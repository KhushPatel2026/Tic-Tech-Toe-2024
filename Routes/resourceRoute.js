const express = require('express');
const router = express.Router();
const multer = require('multer');
//const { storage } = require('../Utils/cloudinaryConfig');
const upload = require('../Utils/localStorageConfig');
const resourceController = require('../Controllers/resourceController');
const isAuthenticated = require('../Middleware/isAuthenticated');
//const upload = multer({ storage: storage });

router.get('/', isAuthenticated,resourceController.renderResources);
router.get('/resource/:id', isAuthenticated,resourceController.renderResource);
router.get('/resource/:id/download', isAuthenticated,resourceController.downloadResource);
router.get('/add', isAuthenticated,resourceController.renderAddResource);
router.post('/add/upload', isAuthenticated,upload.fields([{ name: 'pdfFile', maxCount: 1 }, { name: 'imageFile', maxCount: 1 }]), resourceController.uploadResource);

router.get('/getSuggestedBooks', isAuthenticated,resourceController.getSuggestedBooks);
router.get('/getLatestBooks', isAuthenticated,resourceController.getLatestBooks);
router.get('/getMostViewedBooks', isAuthenticated,resourceController.getMostViewedBooks);
router.get('/getMostDownloadedBooks', isAuthenticated,resourceController.getMostDownloadedBooks);
router.get('/getMostRatedBooks', isAuthenticated,resourceController.getMostRatedBooks);
router.get('/search', isAuthenticated,resourceController.getSearchAndFilterResources);
router.get('/tags', isAuthenticated,resourceController.getTags);

module.exports = router;
