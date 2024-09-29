const User = require('../models/User');
const Resource = require('../models/Resource');

exports.getBookmarks = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('bookmarks');
        res.render('Bookmarks', { title: 'Your Bookmarks', user: req.user, bookmarks: user.bookmarks });
    } catch (err) {
        res.status(400).send(err.message);
    }
};

exports.getSpecificBookmarks = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('bookmarks');
        const resourceId = req.params.id;
        const resource = await Resource.findById(resourceId);
        if (!resource) {
            return res.status(404).send('Resource not found');
        }
        res.render('Resource', { title: resource.title, user: req.user, resource });
    }
    catch (err) {
        res.status(400).send(err.message);
    }
}

exports.addBookmarks = async (req, res) => {
    try {
        const resourceId = req.params.id;
        const user = await User.findById(req.user.id);
        const resource = await Resource
            .findById(resourceId)
            .populate('ratings')
        if (!resource) {
            return res.status(404).send('Resource not found');
        }
        if (user.bookmarks.includes(resource.id)) {
            return res.status(400).send('Resource already bookmarked');
        }
        user.bookmarks.push(resource.id);
        await user.save();
        res.redirect('/resource/resource/' + resourceId);
    }
    catch (err) {
        res.status(400).send(err.message);
    }
}

exports.deleteBookmarks = async(req,res) => {
    try{
        const user = await User.findById(req.user.id).populate('bookmarks');
        const resourceId = req.params.id;
        
        if(!user.bookmarks.includes(resourceId)){
            return res.status(400).send('Resource not bookmarked');
        }

        user.bookmarks = user.bookmarks.filter(bookmark => bookmark != resourceId);
        await user.save();
        res.redirect('/bookmarks');
    }catch(err){
        res.status(400).send(err.message);
    }
}
