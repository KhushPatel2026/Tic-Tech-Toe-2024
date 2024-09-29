const Resource = require('../Models/Resource');
const User = require('../Models/User');
//const { cloudinary } = require('../Utils/cloudinaryConfig'); 
const path = require('path');
const fs = require('fs');

exports.renderResources = async (req, res) => {
    try {
        const resources = await Resource.find({ accessLevel: 'public' }).populate('uploadedBy');
        const userLikes = req.user.likes.map(like => like.toString());
        const resourcesWithLikes = resources.map(resource => ({
            ...resource.toObject(),
            isLiked: userLikes.includes(resource._id.toString())
        }));
        res.render('Dashboard', { title: 'Resources', user: req.user, resources: resourcesWithLikes });
    } catch (error) {
        console.error(error);
        res.status(500).render('Dashboard', { title: 'Resources', user: req.user, error: 'Something went wrong. Please try again.' });
    }
}

exports.renderResource = async (req, res) => {
    try {
        const resourceId = req.params.id;
        const resource = await Resource.findById(resourceId)
            .populate('uploadedBy') 
            .populate({
                path: 'ratings', 
                populate: {
                    path: 'user', 
                    select: 'name' 
                }
            });
        if (!resource) {
            return res.status(404).render('Resource', { title: 'Resource Not Found', user: req.user, error: 'Resource not found.' });
        }
        isPublic = resource.accessLevel === 'public';
        resource.views += 1;
        await resource.save();
        const user = await User.findById(req.user.id);
        const isBookmarked = user.bookmarks.includes(resourceId);
        res.render('Resource', { title: resource.title, user: req.user, resource, isBookmarked, isPublic });
    } catch (error) {
        console.error(error);
        res.status(500).render('Resource', { title: 'Resource Not Found', user: req.user, error: 'Something went wrong. Please try again.' });
    }
};

exports.downloadResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) {
            return res.status(404).send('Resource not found.');
        }

        resource.downloads += 1;
        await resource.save();

        const filePath = path.join(__dirname, '../', resource.fileUrl); 

        if (!fs.existsSync(filePath)) {
            return res.status(404).send('File not found.');
        }
        res.download(filePath, resource.title + path.extname(resource.fileUrl)); 
    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong. Please try again.');
    }
};

exports.renderAddResource = (req, res) => {
    res.render('AddResource', { title: 'Add Resource', user: req.user });
}

/*exports.uploadResource = async (req, res) => {
    try {
        const { title, description, subject, tags, accessLevel } = req.body;
        if (!title || !subject || !req.files['pdfFile'] || !req.files['imageFile']) {
            return res.status(400).render('AddResource', {
                title: 'Add Resource',
                user: req.user,
                error: 'Title, Subject, PDF file, and Image file are required.'
            });
        }

        const pdfUrl = req.files['pdfFile'][0].path;
        const imageUrl = req.files['imageFile'][0].path;
        const newResource = new Resource({
            title,
            description,
            subject,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [], 
            fileType: 'pdf', 
            fileUrl: pdfUrl,
            fileImage: imageUrl,
            uploadedBy: req.user.id, 
            accessLevel: accessLevel || 'public',
        });

        await newResource.save();
        res.render('ResourceSuccess', {
            title: 'Resource Uploaded Successfully',
            resource: newResource,
            user: req.user
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('AddResource', {
            title: 'Add Resource',
            user: req.user,
            error: 'Something went wrong. Please try again.'
        });
    }
};*/

exports.uploadResource = async (req, res) => {
    try {
        const { title, description, subject, tags, accessLevel, author } = req.body;

        if (!title || !subject || !req.files['pdfFile'] || !req.files['imageFile']) {
            return res.status(400).render('AddResource', {
                title: 'Add Resource',
                user: req.user,
                error: 'Title, Subject, PDF file, and Image file are required.'
            });
        }

        const pdfFile = req.files['pdfFile'][0];
        const imageFile = req.files['imageFile'][0];

        if (!pdfFile || !imageFile) {
            return res.status(400).render('AddResource', {
                title: 'Add Resource',
                user: req.user,
                error: 'Files not uploaded successfully.'
            });
        }

        const pdfUrl = pdfFile.path;
        const imageUrl = imageFile.path;

        const newResource = new Resource({
            title,
            author,
            description,
            subject,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            fileType: pdfFile.mimetype,
            fileUrl: pdfUrl,
            fileImage: imageUrl,
            uploadedBy: req.user.id,
            accessLevel: accessLevel || 'public',
        });

        await newResource.save();

        const user = await User.findById(req.user.id);
        user.publishedResources.push(newResource._id);

        await user.save();

        res.render('ResourceSuccess', {
            title: 'Resource Uploaded Successfully',
            resource: newResource,
            user: req.user
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('AddResource', {
            title: 'Add Resource',
            user: req.user,
            error: 'Something went wrong. Please try again.'
        });
    }
};

const generateRecommendations = (user, allResources) => {
    const userPreferences = user.preferences ? user.preferences.split(',') : [];
    
    const preferenceMatches = allResources.map(resource => ({
        resource,
        score: matchUserPreferences(userPreferences, resource.tags) +
               scoreByLikesBookmarks(user, resource) +
               scoreByPopularity(resource) +
               scoreByDate(resource)
    }));

    preferenceMatches.sort((a, b) => b.score - a.score);

    const scoredResourceIds = new Set(preferenceMatches.map(rec => rec.resource._id));

    const unscoredResources = allResources.filter(resource => !scoredResourceIds.has(resource._id));

    return [...preferenceMatches.map(rec => rec.resource), ...unscoredResources];
};

const matchUserPreferences = (userPreferences, resourceTags) => {
    let score = 0;
    resourceTags.forEach(tag => {
        if (userPreferences.includes(tag)) {
            score += 5;
        }
    });
    return score;
};

const scoreByLikesBookmarks = (user, resource) => {
    let score = 0;
    
    if (user.likes.includes(resource._id)) {
        score += 4;
    }
    if (user.bookmarks.includes(resource._id)) {
        score += 3;
    }

    return score;
};

const scoreByPopularity = (resource) => {
    const score = resource.views * 1 + resource.downloads * 2;
    return score;
};

const scoreByDate = (resource) => {
    const resourceDate = new Date(resource.createdAt);
    const now = new Date();
    
    const diffInDays = Math.floor((now - resourceDate) / (1000 * 60 * 60 * 24));
    
    return Math.max(1 - diffInDays * 0.1, 0);
};

exports.getSuggestedBooks = async (req, res) => {
    try {
        const allResources = await Resource.find({ accessLevel: 'public' });
        const recommendedResources = generateRecommendations(req.user, allResources);
        const userLikes = req.user.likes.map(like => like.toString());
        
        const resourcesWithLikes = recommendedResources.map(resource => ({
            ...resource.toObject(),
            isLiked: userLikes.includes(resource._id.toString())
        }));
        
        res.render('Dashboard', { title: 'Resources', user: req.user, resources: resourcesWithLikes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
};

exports.getLatestBooks = async (req, res) => {
    try {
        const resources = await Resource.find({ accessLevel: 'public' })
            .sort({ createdAt: -1 }) 
        
        const userLikes = req.user.likes.map(like => like.toString());
        
        const resourcesWithLikes = resources.map(resource => ({
            ...resource.toObject(),
            isLiked: userLikes.includes(resource._id.toString())
        }));
        
        res.render('Dashboard', { title: 'Resources', user: req.user, resources: resourcesWithLikes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
};

exports.getMostViewedBooks = async (req, res) => {
    try {
        const resources = await Resource.find({ accessLevel: 'public' })
            .sort({ views: -1 })  
        
        const userLikes = req.user.likes.map(like => like.toString());
        
        const resourcesWithLikes = resources.map(resource => ({
            ...resource.toObject(),
            isLiked: userLikes.includes(resource._id.toString())
        }));
        
        res.render('Dashboard', { title: 'Resources', user: req.user, resources: resourcesWithLikes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
};

exports.getMostDownloadedBooks = async (req, res) => {
    try {
        const resources = await Resource.find({ accessLevel: 'public' })
            .sort({ downloads: -1 })  
        
        const userLikes = req.user.likes.map(like => like.toString());
        
        const resourcesWithLikes = resources.map(resource => ({
            ...resource.toObject(),
            isLiked: userLikes.includes(resource._id.toString())
        }));
        
        res.render('Dashboard', { title: 'Resources', user: req.user, resources: resourcesWithLikes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
};

exports.getMostRatedBooks = async (req, res) => {
    try {
        const resources = await Resource.find({ accessLevel: 'public' })
            .sort({ averageRating: -1 })  
        
        const userLikes = req.user.likes.map(like => like.toString());
        
        const resourcesWithLikes = resources.map(resource => ({
            ...resource.toObject(),
            isLiked: userLikes.includes(resource._id.toString())
        }));
        
        res.render('Dashboard', { title: 'Resources', user: req.user, resources: resourcesWithLikes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
}

exports.getSearchAndFilterResources = async (req, res) => {
    try {
        const { search, tags, author, subject, accessLevel, minRating } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { author: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }

        if (tags && tags !== 'All') { // Check if tags are provided and not "all"
            const tagArray = tags.split(',').map(tag => tag.trim());
            query.tags = { $in: tagArray };
        }

        if (author) {
            query.author = { $regex: author, $options: 'i' };
        }

        if (subject) {
            query.subject = { $regex: subject, $options: 'i' };
        }

        if (accessLevel) {
            query.accessLevel = accessLevel;
        }

        if (minRating) {
            query.averageRating = { $gte: parseFloat(minRating) };
        }

        let resources = await Resource.find(query)
            .populate('ratings')
            .populate('uploadedBy')
            .exec();

        const userLikes = req.user ? req.user.likes.map(like => like.toString()) : [];

        const resourcesWithLikes = resources.map(resource => ({
            ...resource.toObject(),
            isLiked: userLikes.includes(resource._id.toString())
        }));

        res.render('Dashboard', { resources: resourcesWithLikes, user: req.user });

    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

exports.getTags = async (req, res) => {
    try {
        const tags = await Resource.aggregate([
            { $unwind: "$tags" },
            { $group: { _id: "$tags", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]).exec();

        res.json(tags.map(tag => tag._id));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
};

