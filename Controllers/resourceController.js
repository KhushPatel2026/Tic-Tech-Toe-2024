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
        const { title, description, subject, tags, accessLevel } = req.body;

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
