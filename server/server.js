// server/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const User = require('./models/User'); // Import the User model

dotenv.config(); // Load .env first

// --- Function to Create Static Admin User ---
const createStaticAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
            console.warn('Static admin credentials (ADMIN_EMAIL, ADMIN_PASSWORD) not found in .env. Skipping default admin creation.');
            return;
        }

        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log(`Static admin user with email ${adminEmail} already exists (Verified: ${existingAdmin.isVerified}).`);
            // Optional: If admin exists but is NOT verified, update them
            if (!existingAdmin.isVerified) {
                existingAdmin.isVerified = true;
                await existingAdmin.save();
                console.log(`Static admin user ${adminEmail} was found and marked as verified.`);
            }
            return;
        }

        console.log(`Static admin user ${adminEmail} not found. Creating...`);
        const adminUser = await User.create({
            name: 'Default Admin',
            email: adminEmail,
            password: adminPassword, // Hashed by pre-save hook
            role: 'admin',
            isVerified: true // <<<------ **SET isVerified TO TRUE HERE**
        });
        console.log(`Static admin user ${adminUser.email} created successfully and marked as verified.`);

    } catch (error) {
        console.error('Error during static admin user creation/check:', error.message);
    }
};

// --- Initialize Server ---
async function startServer() {
    await connectDB();       // Connect to DB first
    await createStaticAdmin(); // Then check/create admin

    const app = express();
    app.use(cors());
    app.use(express.json());

    // --- API Routes ---
    app.get('/api', (req, res) => res.send('Exam Portal API Running'));
    app.use('/api/auth', require('./routes/authRoutes'));
    app.use('/api/users', require('./routes/userRoutes'));
    app.use('/api/questions', require('./routes/questionRoutes'));
    app.use('/api/exams', require('./routes/examRoutes'));
    app.use('/api/results', require('./routes/resultRoutes'));

    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => console.log(`Server active on port ${PORT}`));

    process.on('unhandledRejection', (err, promise) => {
        console.error(`Server Error: Unhandled Rejection - ${err.message}`);
        server.close(() => process.exit(1));
    });
}

startServer().catch(error => {
    console.error("Failed to initialize and start the server:", error);
    process.exit(1);
});