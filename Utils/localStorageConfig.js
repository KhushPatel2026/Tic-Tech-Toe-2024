const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = 'uploads/'; 
        if (file.mimetype.startsWith('image/')) {
            folder = 'uploads/images/'; 
        } else if (file.mimetype === 'application/pdf') {
            folder = 'uploads/pdfs/'; 
        }

        // Create the directory if it doesn't exist
        fs.mkdirSync(folder, { recursive: true });
        cb(null, folder);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

module.exports = upload;
