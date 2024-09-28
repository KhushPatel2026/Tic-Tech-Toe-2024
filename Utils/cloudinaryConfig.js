const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req, file) => {
        let folder = 'Lib';
        let allowedFormats = ["jpeg", "jpg", "png", "pdf"]; 

        if (file.mimetype.startsWith('image/')) {
            folder = 'Lib/images';
        } else if (file.mimetype === 'application/pdf') {
            folder = 'Lib/pdfs';
        }

        return {
            folder: folder,
            allowed_formats: allowedFormats,
            public_id: file.fieldname + '-' + Date.now() 
        };
    },
});

module.exports = {
    cloudinary,
    storage
}
