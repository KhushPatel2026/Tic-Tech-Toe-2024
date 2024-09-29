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
