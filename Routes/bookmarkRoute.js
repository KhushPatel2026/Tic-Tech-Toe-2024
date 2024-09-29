const express = require('express');
const router = express.Router();
const isAuthenticated = require('../Middleware/isAuthenticated');
const bookmarkController = require('../Controllers/bookmarkController');

router.get('/', isAuthenticated, bookmarkController.getBookmarks);
router.get('/specific/:id', isAuthenticated, bookmarkController.getSpecificBookmarks);
router.post('/add/:id', isAuthenticated, bookmarkController.addBookmarks);
router.post('/remove/:id', isAuthenticated, bookmarkController.deleteBookmarks);
router.get('/all',isAuthenticated, bookmarkController.getAllBookmarks)

module.exports = router;