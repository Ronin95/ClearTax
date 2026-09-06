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
    const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const key = `${fileId}_${safeOriginalName}`;

    await s3.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype
    }));
    return key;
};

const deleteFromS3 = async (key: string, bucketName: string) => {
    try {
        await s3.send(new DeleteObjectCommand({ Bucket: bucketName, Key: key }));
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

        const { title, category_id, description, latitude, longitude, contributionAmount, targetFunding, ownTaxes, status } = req.body;
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
            `INSERT INTO open_problems 
            (id, user_id, category_id, project_name, summar_desc, image_list, file_list, latitude, longitude, amount_raised, target_funding, creator_work, status) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
            [
                projectId, 
                userId, 
                parseInt(category_id) || 1, 
                title, 
                description, 
                imageList, 
                fileList, 
                latitude ? parseFloat(latitude) : null, 
                longitude ? parseFloat(longitude) : null, 
                parseFloat(contributionAmount) || 0, 
                parseFloat(targetFunding) || 0, 
                ownTaxes === 'true', 
                status || 'Proposed'
            ]
        );

        res.status(201).json({ message: 'Project created successfully', projectId });
    } catch (error) {
        console.error("🔥 CRITICAL DB ERROR:", error);
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

        const { title, category_id, description, latitude, longitude, contributionAmount, targetFunding, ownTaxes, status } = req.body;
        
        const keptImages = req.body.existingImages ? JSON.parse(req.body.existingImages) : [];
        const keptFiles = req.body.existingFiles ? JSON.parse(req.body.existingFiles) : [];

        const imagesToDelete = (oldProject.image_list || []).filter((img: string) => !keptImages.includes(img));
        const filesToDelete = (oldProject.file_list || []).filter((f: string) => !keptFiles.includes(f));

        for (const img of imagesToDelete) await deleteFromS3(img, 'cleartax-image-uploads');
        for (const f of filesToDelete) await deleteFromS3(f, 'cleartax-file-uploads');

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
                amount_raised = $8, target_funding = $9, creator_work = $10, status = $11
            WHERE id = $12`,
            [
                parseInt(category_id) || 1, title, description, finalImageList, finalFileList, 
                parseFloat(latitude) || null, parseFloat(longitude) || null, 
                parseFloat(contributionAmount) || 0, parseFloat(targetFunding) || 0,
                ownTaxes === 'true', status || 'Proposed', projectId
            ]
        );

        res.status(201).json({ message: 'Project created successfully', projectId });
    } catch (error) {
        console.error("🔥 CRITICAL DB ERROR:", error);
        res.status(500).json({ error: 'Failed to create project' });
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

        if (project.image_list) {
            for (const imgKey of project.image_list) await deleteFromS3(imgKey, 'cleartax-image-uploads');
        }
        if (project.file_list) {
            for (const fileKey of project.file_list) await deleteFromS3(fileKey, 'cleartax-file-uploads');
        }

        await pool.query('DELETE FROM open_problems WHERE id = $1', [projectId]);
        res.json({ success: true, message: "Project and files deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete project" });
    }
});

// GET STATUSES ROUTE
router.get('/statuses', async (req, res) => {
    try {
        const statusesRes = await pool.query('SELECT name, color FROM project_statuses ORDER BY id ASC');
        res.json({ statuses: statusesRes.rows });
    } catch (error) {
        console.error("Failed to fetch statuses", error);
        res.status(500).json({ error: 'Failed to fetch statuses' });
    }
});

// GET COMMUNITY PROJECTS
router.get('/community', verifyToken, async (req, res) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });
        const projects = await pool.query(`
            SELECT op.*, 
                   CAST((SELECT COUNT(*) FROM project_approvals WHERE project_id = op.id) AS INTEGER) as approval_count,
                   EXISTS(SELECT 1 FROM project_approvals WHERE project_id = op.id AND user_id = $1) as has_approved
            FROM open_problems op
            ORDER BY op.created_at DESC
        `, [userId]);
        res.json({ projects: projects.rows });
    } catch (error) {
        console.error("Failed to fetch community projects", error);
        res.status(500).json({ error: 'Failed to fetch community projects' });
    }
});

// POST FUNDING ROUTE
router.post('/:id/approve', verifyToken, upload.array('files'), async (req, res) => {
    try {
        const projectId = req.params.id;
        const userId = (req as any).user?.id;
        
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { comment, fundedAmount } = req.body;
        const fundAmount = parseFloat(fundedAmount || '0');

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Check User's Available Money
            const userRes = await client.query('SELECT available_amount FROM users WHERE id = $1', [userId]);
            const userMoney = parseFloat(userRes.rows[0]?.available_amount || '0');

            if (fundAmount > 0 && userMoney < fundAmount) {
                await client.query('ROLLBACK');
                return res.status(400).json({ error: "Not enough money available. Please extract your money from the RIS." });
            }

            // 2. Process File Uploads to Garage S3
            const files = req.files as Express.Multer.File[];
            const uploadedFileNames: string[] = [];
            
            if (files && files.length > 0) {
                for (const file of files) {
                    const uniqueFileName = await uploadToS3(file, 'cleartax-file-uploads');
                    uploadedFileNames.push(uniqueFileName);
                }
            }

            // 3. Move the Money
            if (fundAmount > 0) {
                await client.query('UPDATE users SET available_amount = available_amount - $1, contributed_amount = contributed_amount + $1 WHERE id = $2', [fundAmount, userId]);
                await client.query('UPDATE open_problems SET amount_raised = amount_raised + $1 WHERE id = $2', [fundAmount, projectId]);
            }

            // 4. Save the Approval / Funding Record
            await client.query(`
                INSERT INTO project_approvals (project_id, user_id, comment, file_list, funded_amount)
                VALUES ($1, $2, $3, $4, $5)
            `, [projectId, userId, comment, uploadedFileNames, fundAmount]);

            // 5. Check if Funding Goal is Met!
            const projRes = await client.query('SELECT amount_raised, target_funding, assigned_company_id, status FROM open_problems WHERE id = $1', [projectId]);
            const currentRaised = parseFloat(projRes.rows[0].amount_raised);
            const targetGoal = parseFloat(projRes.rows[0].target_funding);
            const assignedCompanyId = projRes.rows[0].assigned_company_id;
            const currentStatus = projRes.rows[0].status;
            // If it met or exceeded the goal, update the status!
            if (currentRaised >= targetGoal) {
                if (assignedCompanyId && currentStatus === 'Funding Extension') {
                    await client.query(`UPDATE open_problems SET status = 'In Progress' WHERE id = $1`, [projectId]);
                } else if (currentStatus === 'Proposed') {
                    // It now goes to Funding Approved!
                    await client.query(`UPDATE open_problems SET status = 'Funding Approved' WHERE id = $1`, [projectId]); 
                }
            }

            await client.query('COMMIT'); // Commit Transaction!
            res.status(200).json({ message: "Successfully funded project!" });
        } catch (err: any) {
            await client.query('ROLLBACK');
            
            // Handle constraint errors (like trying to fund twice)
            if (err.code === '23505') {
                return res.status(400).json({ error: "You have already backed this project." });
            }
            
            console.error("Transaction Error:", err);
            res.status(500).json({ error: "Server Error during funding" });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Funding failed", error);
        res.status(500).json({ error: "Failed to fund project" });
    }
});

// POST ROUTE: Complete a Project
router.post('/:id/complete', verifyToken, upload.fields([{ name: 'finalImages', maxCount: 10 }, { name: 'finalFiles', maxCount: 10 }]), async (req, res) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const projectId = req.params.id;
        const { summary, finalCost, completionDate, maintenanceNotes, rating } = req.body;
        
        // Security Check: Make sure they own the project and it's actually In Progress
        const projectRes = await pool.query("SELECT * FROM open_problems WHERE id = $1 AND user_id = $2", [projectId, userId]);
        if (projectRes.rows.length === 0) return res.status(404).json({ error: "Project not found or unauthorized" });
        if (projectRes.rows[0].status !== 'In Progress') return res.status(400).json({ error: "Project must be 'In Progress' to complete" });

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        
        // Upload images
        const finalImageList: string[] = [];
        if (files && files['finalImages']) {
            for (const file of files['finalImages']) {
                finalImageList.push(await uploadToS3(file, 'cleartax-image-uploads'));
            }
        }

        // Upload documents
        const finalFileList: string[] = [];
        if (files && files['finalFiles']) {
            for (const file of files['finalFiles']) {
                finalFileList.push(await uploadToS3(file, 'cleartax-file-uploads'));
            }
        }

        // 1. Insert the completion report
        await pool.query(
            `INSERT INTO project_completions 
            (project_id, summary, final_cost, completion_date, maintenance_notes, rating, final_image_list, final_file_list) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (project_id) DO UPDATE SET
            summary = EXCLUDED.summary, final_cost = EXCLUDED.final_cost, completion_date = EXCLUDED.completion_date,
            maintenance_notes = EXCLUDED.maintenance_notes, rating = EXCLUDED.rating, 
            final_image_list = EXCLUDED.final_image_list, final_file_list = EXCLUDED.final_file_list`,
            [
                projectId, summary, parseFloat(finalCost) || 0, completionDate || null, 
                maintenanceNotes, parseInt(rating) || 0, finalImageList, finalFileList
            ]
        );

        // 2. Change the project status to Completed
        await pool.query("UPDATE open_problems SET status = 'Pending Completion' WHERE id = $1", [projectId]);

        res.status(200).json({ message: 'Project completed successfully' });
    } catch (error) {
        console.error("🔥 CRITICAL COMPLETION ERROR:", error);
        res.status(500).json({ error: 'Failed to complete project' });
    }
});

// GET ROUTE: Fetch Completion Data
router.get('/:id/completion', verifyToken, async (req, res) => {
    try {
        const projectId = req.params.id;
        const result = await pool.query("SELECT * FROM project_completions WHERE project_id = $1", [projectId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Completion report not found" });
        }
        
        res.json({ completion: result.rows[0] });
    } catch (error) {
        console.error("Failed to fetch completion report", error);
        res.status(500).json({ error: "Server error" });
    }
});

// GET: Tender Board (Approved projects looking for a company)
router.get('/tender-board', verifyToken, async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM open_problems WHERE status = 'Funding Approved' AND assigned_company_id IS NULL ORDER BY created_at DESC");
        res.json({ projects: result.rows });
    } catch (err) { res.status(500).json({ error: 'Server error fetching tender board' }); }
});

// GET: Project IDs that the logged-in company has already submitted a bid for
router.get('/my-bids', verifyToken, async (req, res) => {
    try {
        const companyId = (req as any).user.id;
        const result = await pool.query("SELECT project_id FROM project_bids WHERE company_id = $1", [companyId]);
        // Extract just the array of IDs
        res.json({ bidProjectIds: result.rows.map(r => r.project_id) });
    } catch (err) {
        console.error("Error fetching my bids:", err);
        res.status(500).json({ error: "Failed to fetch bids" });
    }
});

// GET: Projects where the logged-in company WON the bid (Active Contracts & Portfolio)
router.get('/my-contracts', verifyToken, async (req, res) => {
    try {
        const companyId = (req as any).user.id;
        
        const result = await pool.query(`
            SELECT p.* 
            FROM open_problems p
            JOIN project_bids b ON p.id = b.project_id
            WHERE b.company_id = $1 AND b.status = 'Accepted'
            ORDER BY p.created_at DESC
        `, [companyId]);

        res.json({ projects: result.rows });
    } catch (err) {
        console.error("Error fetching company contracts:", err);
        res.status(500).json({ error: "Failed to fetch contracts" });
    }
});

// POST: Submit a Bid (Company Action)
router.post('/:id/bids', verifyToken, upload.array('files'), async (req, res) => {
    try {
        const { estimatedCost, pitch, startDate, endDate } = req.body;
        const companyId = (req as any).user.id;
        const projectId = req.params.id;

        // Handle PDF file uploads
        const files = req.files as Express.Multer.File[];
        const uploadedFileNames: string[] = [];
        
        if (files && files.length > 0) {
            for (const file of files) {
                const uniqueFileName = await uploadToS3(file, 'cleartax-file-uploads');
                uploadedFileNames.push(uniqueFileName);
            }
        }
        
        await pool.query(
            "INSERT INTO project_bids (project_id, company_id, estimated_cost, pitch, estimated_start_date, estimated_end_date, file_list) VALUES ($1, $2, $3, $4, $5, $6, $7)",
            [
                projectId, 
                companyId, 
                parseFloat(estimatedCost) || 0, 
                pitch, 
                startDate || null, 
                endDate || null, 
                uploadedFileNames
            ]
        );
        res.json({ message: "Bid submitted successfully" });
    } catch (err) { 
        console.error("Bid error:", err);
        res.status(500).json({ error: 'Server error submitting bid' }); 
    }
});

// GET: View all Bids for a Project (Creator Action)
router.get('/:id/bids', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT b.*, u.username as company_name, u.email as company_email 
            FROM project_bids b 
            JOIN users u ON b.company_id = u.id 
            WHERE b.project_id = $1 ORDER BY b.created_at DESC
        `, [req.params.id]);
        res.json({ bids: result.rows });
    } catch (err) { res.status(500).json({ error: 'Server error fetching bids' }); }
});

// POST: Accept a Bid (Creator Action)
router.post('/:id/accept-bid', verifyToken, async (req, res) => {
    try {
        const { bidId } = req.body;
        const projectId = req.params.id;
        
        const bidRes = await pool.query("SELECT company_id, estimated_cost FROM project_bids WHERE id = $1", [bidId]);
        if(bidRes.rows.length === 0) return res.status(404).json({error: "Bid not found"});
        
        const companyId = bidRes.rows[0].company_id;
        const estimatedCost = parseFloat(bidRes.rows[0].estimated_cost);

        const projectRes = await pool.query("SELECT amount_raised FROM open_problems WHERE id = $1", [projectId]);
        const amountRaised = parseFloat(projectRes.rows[0].amount_raised);

        // Accept this bid, reject all others
        await pool.query("UPDATE project_bids SET status = 'Accepted' WHERE id = $1", [bidId]);
        await pool.query("UPDATE project_bids SET status = 'Rejected' WHERE project_id = $1 AND id != $2", [projectId, bidId]);
        
        if (estimatedCost > amountRaised) {
            // Deficit! Project needs more money before it can start.
            await pool.query(
                "UPDATE open_problems SET assigned_company_id = $1, status = 'Funding Extension', target_funding = $2 WHERE id = $3", 
                [companyId, estimatedCost, projectId]
            );
            res.json({ message: "Bid accepted. Project requires additional funding to proceed." });
        } else {
            // Fully funded! Go straight to In Progress.
            await pool.query(
                "UPDATE open_problems SET assigned_company_id = $1, status = 'In Progress' WHERE id = $2", 
                [companyId, projectId]
            );
            res.json({ message: "Bid accepted. Project is now In Progress!" });
        }
    } catch (err) { res.status(500).json({ error: 'Server error accepting bid' }); }
});

// POST: Submit Progress Update (Company Action)
router.post('/:id/updates', verifyToken, upload.single('image'), async (req, res) => {
    try {
        const { message } = req.body;
        const companyId = (req as any).user.id;
        const projectId = req.params.id;
        
        let imageUrl = null;
        if (req.file) {
            imageUrl = await uploadToS3(req.file, 'cleartax-image-uploads');
        }
        
        await pool.query("INSERT INTO project_updates (project_id, company_id, message, image_url) VALUES ($1, $2, $3, $4)", [projectId, companyId, message, imageUrl]);
        res.json({ message: "Progress update posted" });
    } catch (err) { res.status(500).json({ error: 'Server error posting update' }); }
});

// GET: View Progress Updates (Public Action)
router.get('/:id/updates', verifyToken, async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM project_updates WHERE project_id = $1 ORDER BY created_at DESC", [req.params.id]);
        res.json({ updates: result.rows });
    } catch (err) { res.status(500).json({ error: 'Server error fetching updates' }); }
});

// POST: Verify Completion Sign-off (User Action)
router.post('/:id/verify-completion', verifyToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const projectId = req.params.id;
        const userId = (req as any).user.id;
        
        await client.query('BEGIN');

        // Record the sign-off
        await client.query("INSERT INTO project_completion_approvals (project_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [projectId, userId]);
        
        // Check if we hit the required amount of sign-offs (e.g. 3 users)
        const countRes = await client.query("SELECT COUNT(*) FROM project_completion_approvals WHERE project_id = $1", [projectId]);
        
        if (parseInt(countRes.rows[0].count) >= 3) {
            // Check if there is leftover money!
            const projectRes = await client.query("SELECT amount_raised, target_funding FROM open_problems WHERE id = $1", [projectId]);
            const amountRaised = parseFloat(projectRes.rows[0].amount_raised);
            const targetFunding = parseFloat(projectRes.rows[0].target_funding);

            if (amountRaised > targetFunding) {
                const leftover = amountRaised - targetFunding;
                
                // 1. Create a contribution to the National Debt (category_id = 4)
                await client.query(`
                    INSERT INTO contributions (id, user_id, category_id, contributed_amount_by_user) 
                    VALUES (gen_random_uuid(), $1, 4, $2)
                `, [userId, leftover]); 

                // 2. Adjust the project's amount_raised down so the money isn't double-counted
                await client.query("UPDATE open_problems SET amount_raised = $1 WHERE id = $2", [targetFunding, projectId]);
            }

            // Once verified by the community, officially complete it!
            await client.query("UPDATE open_problems SET status = 'Completed' WHERE id = $1", [projectId]);
        }
        
        await client.query('COMMIT');
        res.json({ message: "Completion report verified by user" });
    } catch (err) { 
        await client.query('ROLLBACK');
        res.status(500).json({ error: 'Server error verifying completion' }); 
    } finally {
        client.release();
    }
});

export default router;
