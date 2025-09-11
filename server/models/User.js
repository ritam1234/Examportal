// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true, // Added trim for good practice
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ],
        trim: true, // Good practice
        lowercase: true // Store emails consistently
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false // Good for security, don't send password by default
    },
    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student'
    },
    // --- *** CORRECTED CASING HERE *** ---
    isVerified: {  // Changed from is_verified to isVerified
        type: Boolean,
        default: false
    },
    // ------------------------------------
    // createdAt: { // Mongoose 'timestamps: true' below will handle this automatically
    //     type: Date,
    //     default: Date.now
    // }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare password for login
UserSchema.methods.matchPassword = async function (enteredPassword) {
    // 'this.password' will be available because it's directly on the document instance
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);