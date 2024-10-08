const express = require('express');
const router = express.Router();
const ratingController = require('../Controllers/ratingController');
const isAuthenticated = require('../Middleware/isAuthenticated');

router.get('/:resourceId', isAuthenticated, ratingController.getResourceWithRatings);
router.post('/:resourceId/rate', isAuthenticated, ratingController.addOrUpdateRating);
router.get('/all/u', isAuthenticated, ratingController.getAllRatings);

module.exports = router;
