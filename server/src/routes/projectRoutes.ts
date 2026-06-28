import express from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import { pool } from '../db.ts';
import { verifyToken } from '../middleware/authMiddleware.ts';

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

const s3 = new S3Client({
    endpoint: process.env.GARAGE_ENDPOINT || 'http://garage:3900',
    region: process.env.GARAGE_REGION || 'eu-central-1',
    credentials: {
        accessKeyId: process.env.GARAGE_ACCESS_KEY || 'your_access_key',
        secretAccessKey: process.env.GARAGE_SECRET_KEY || 'your_secret_key'
    },
    forcePathStyle: true
});

const uploadToS3 = async (file: Express.Multer.File, bucketName: string) => {
    const fileId = crypto.randomUUID();
    
    // Clean the original filename to remove spaces or weird characters for S3 safety
    const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    
    // Combine the UUID and the safe original name
    const key = `${fileId}_${safeOriginalName}`;

    await s3.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype
    }));
    return key;
};

// NEW: Helper to securely delete files from Garage S3
const deleteFromS3 = async (key: string, bucketName: string) => {
    try {
        await s3.send(new DeleteObjectCommand({
            Bucket: bucketName,
            Key: key
        }));
    } catch (err) {
        console.error(`Failed to delete ${key} from ${bucketName}:`, err);
    }
};

// 1. GET ROUTE
router.get('/', verifyToken, async (req, res) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const projects = await pool.query('SELECT * FROM open_problems WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        res.json({ projects: projects.rows });
    } catch (error) {
        console.error("Failed to fetch projects:", error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// 2. GET FILE ROUTE (Proxy to S3)
router.get('/file/:bucket/:key', async (req, res) => {
    try {
        const { bucket, key } = req.params;
        const command = new GetObjectCommand({ Bucket: bucket, Key: key });
        const s3Response = await s3.send(command);
        
        if (s3Response.ContentType) res.setHeader('Content-Type', s3Response.ContentType);
        (s3Response.Body as any).pipe(res);
    } catch (error) {
        res.status(404).json({ error: "File not found" });
    }
});

// 3. POST ROUTE (Create New)
router.post('/', verifyToken, upload.fields([{ name: 'images', maxCount: 10 }, { name: 'files', maxCount: 10 }]), async (req, res) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { title, category_id, description, latitude, longitude, contributionAmount, ownTaxes } = req.body;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        
        const imageList: string[] = [];
        if (files && files['images']) {
            for (const file of files['images']) imageList.push(await uploadToS3(file, 'cleartax-image-uploads'));
        }

        const fileList: string[] = [];
        if (files && files['files']) {
            for (const file of files['files']) fileList.push(await uploadToS3(file, 'cleartax-file-uploads'));
        }

        const projectId = crypto.randomUUID();
        await pool.query(
            `INSERT INTO open_problems (id, user_id, category_id, project_name, summar_desc, image_list, file_list, latitude, longitude, amount_raised, creator_work) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [projectId, userId, parseInt(category_id) || 1, title, description, imageList, fileList, parseFloat(latitude) || null, parseFloat(longitude) || null, parseFloat(contributionAmount) || 0, ownTaxes === 'true']
        );

        res.status(201).json({ message: 'Project created successfully', projectId });
    } catch (error) {
        console.error("Project creation failed:", error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

// 4. PUT ROUTE (Edit Existing)
router.put('/:id', verifyToken, upload.fields([{ name: 'images', maxCount: 10 }, { name: 'files', maxCount: 10 }]), async (req, res) => {
    try {
        const userId = (req as any).user?.id;
        const projectId = req.params.id;

        const projectRes = await pool.query('SELECT * FROM open_problems WHERE id = $1 AND user_id = $2', [projectId, userId]);
        if (projectRes.rows.length === 0) return res.status(404).json({ error: "Project not found" });
        const oldProject = projectRes.rows[0];

        const { title, category_id, description, latitude, longitude, contributionAmount, ownTaxes } = req.body;
        
        // Find which files were kept vs removed
        const keptImages = req.body.existingImages ? JSON.parse(req.body.existingImages) : [];
        const keptFiles = req.body.existingFiles ? JSON.parse(req.body.existingFiles) : [];

        const imagesToDelete = (oldProject.image_list || []).filter((img: string) => !keptImages.includes(img));
        const filesToDelete = (oldProject.file_list || []).filter((f: string) => !keptFiles.includes(f));

        // Delete removed files from S3
        for (const img of imagesToDelete) await deleteFromS3(img, 'cleartax-image-uploads');
        for (const f of filesToDelete) await deleteFromS3(f, 'cleartax-file-uploads');

        // Upload newly added files
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const newImages: string[] = [];
        if (files && files['images']) {
            for (const file of files['images']) newImages.push(await uploadToS3(file, 'cleartax-image-uploads'));
        }

        const newFiles: string[] = [];
        if (files && files['files']) {
            for (const file of files['files']) newFiles.push(await uploadToS3(file, 'cleartax-file-uploads'));
        }

        const finalImageList = [...keptImages, ...newImages];
        const finalFileList = [...keptFiles, ...newFiles];

        await pool.query(
            `UPDATE open_problems SET 
                category_id = $1, project_name = $2, summar_desc = $3, 
                image_list = $4, file_list = $5, latitude = $6, longitude = $7, 
                amount_raised = $8, creator_work = $9
            WHERE id = $10`,
            [parseInt(category_id) || 1, title, description, finalImageList, finalFileList, parseFloat(latitude) || null, parseFloat(longitude) || null, parseFloat(contributionAmount) || 0, ownTaxes === 'true', projectId]
        );

        res.json({ message: 'Project updated successfully' });
    } catch (error) {
        console.error("Update failed:", error);
        res.status(500).json({ error: "Failed to update project" });
    }
});

// 5. DELETE ROUTE
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const userId = (req as any).user?.id;
        const projectId = req.params.id;

        const projectRes = await pool.query('SELECT * FROM open_problems WHERE id = $1 AND user_id = $2', [projectId, userId]);
        if (projectRes.rows.length === 0) return res.status(404).json({ error: "Project not found or you don't have permission" });
        const project = projectRes.rows[0];

        // Delete all files from S3 to prevent orphans
        if (project.image_list) {
            for (const imgKey of project.image_list) await deleteFromS3(imgKey, 'cleartax-image-uploads');
        }
        if (project.file_list) {
            for (const fileKey of project.file_list) await deleteFromS3(fileKey, 'cleartax-file-uploads');
        }

        // Delete from Database
        await pool.query('DELETE FROM open_problems WHERE id = $1', [projectId]);

        res.json({ success: true, message: "Project and files deleted successfully" });
    } catch (error) {
        console.error("Delete failed:", error);
        res.status(500).json({ error: "Failed to delete project" });
    }
});

export default router;
