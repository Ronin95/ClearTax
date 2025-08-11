require('dotenv').config({ path: __dirname + '/../../.env' });
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
const cookieParser = require('cookie-parser');

if (!process.env.JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET environment variable is not defined.");
  process.exit(1);
}

const app = express();
// --- Middleware Setup ---
const corsOptions = {
  origin: 'http://localhost:3002', // Allow only React app
  credentials: true, // Allow cookies to be sent
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// --- NEW: SESSION MIDDLEWARE SETUP ---
app.use(session({
  store: new pgSession({
    pool: db.pool, // Use from db.js
    tableName: 'user_sessions' // Name of the session table
  }),
  secret: process.env.SESSION_SECRET || 'your_default_session_secret', // A secret for signing the session ID cookie
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, 
    httpOnly: true, // Prevents client-side JS from reading the cookie
    maxAge: 1000 * 60 * 60 * 24 // Cookie expires in 24 hours
  }
}));

// --- NEW: Endpoint to check if a user is logged in ---
app.get('/api/me', (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

// Signup Route
app.post('/cleartax/signup', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: "Username, email, and password are required." });
    }
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUserResult = await db.query(
            "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
            [username, email, hashedPassword]
        );
        const newUser = newUserResult.rows[0];

        req.session.user = {
            id: newUser.id,
            username: newUser.username
        };

        // Return the new token
        res.status(201).json({ user: req.session.user });

    } catch (err) {
        console.error(err.message);
        if (err.code === '23505') { 
            const message = err.detail.includes('email') 
                ? "Email already in use." 
                : "Username already in use.";
            return res.status(409).json({ message });
        }
        res.status(500).send("Server error");
    }
});


// Login Route
app.post('/cleartax/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }
    try {
        const userResult = await db.query(
            "SELECT * FROM users WHERE email = $1", 
            [email]
        );
        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: "Invalid credentials." });
        }
        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        req.session.user = {
            id: user.id,
            username: user.username
        };

        console.log(`✅ Login successful for user: ${user.username} (ID: ${user.id})`);

        res.json({ user: req.session.user });
    } catch (err) {
        console.error("Error during login process:", err);
        res.status(500).send("Server error");
    }
});

app.post('/cleartax/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Could not log out, please try again.' });
    }
    res.clearCookie('connect.sid'); // The default session cookie name
    res.status(200).json({ message: 'Logout successful' });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});