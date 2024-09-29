const express = require('express');
const router = express.Router();
const likesController = require('../Controllers/likeController');
const isAuthenticated = require('../Middleware/isAuthenticated');

router.post('/toggle/:id', isAuthenticated, likesController.toggleLike);

module.exports = router;
