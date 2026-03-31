/**
 * Upload Middleware
 * Configures multer for file uploads
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDirs = ['uploads/profiles', 'uploads/trips', 'uploads/verification', 'uploads/receipts'];
uploadDirs.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
});

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = 'uploads/';

        if (file.fieldname === 'profilePicture') {
            uploadPath += 'profiles/';
        } else if (file.fieldname === 'coverImage') {
            uploadPath += 'trips/';
        } else if (file.fieldname === 'idFront' || file.fieldname === 'selfie') {
            uploadPath += 'verification/';
        } else if (file.fieldname === 'receipt') {
            uploadPath += 'receipts/';
        }

        cb(null, path.join(__dirname, '..', uploadPath));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

module.exports = { upload };
