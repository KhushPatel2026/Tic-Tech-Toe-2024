// In your likesController.js
const User = require('../models/User');
const Resource = require('../models/Resource');

exports.toggleLike = async (req, res) => {
    try {
        const resourceId = req.params.id;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).send('User not found');
        }
        if (user.likes.includes(resourceId)) {
            user.likes = user.likes.filter(like => like.toString() !== resourceId);
        } else {
            user.likes.push(resourceId);
        }

        await user.save();
        res.redirect('/resource');
    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong');
    }
}

exports.getAllLikes = async (req, res) => {
    try {
        const userLikes = req.user.likes.map(like => like.toString()); // Get user's likes
        const resources = await Resource.find({ accessLevel: 'public', _id: { $in: userLikes } }).populate('uploadedBy'); // Fetch only liked resources

        const resourcesWithLikes = resources.map(resource => ({
            ...resource.toObject(),
            isLiked: true // All fetched resources are liked by the user
        }));

        res.render('Dashboard', { title: 'Resources', user: req.user, resources: resourcesWithLikes });
    } catch (error) {
        console.error(error);
        res.status(500).render('Dashboard', { title: 'Resources', user: req.user, error: 'Something went wrong. Please try again.' });
    }
}
