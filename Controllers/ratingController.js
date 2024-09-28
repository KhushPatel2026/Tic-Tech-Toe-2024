const Rating = require('../Models/Rating');
const Resource = require('../Models/Resource');

const updateAverageRating = async (resourceId) => {
    const ratings = await Rating.find({ resource: resourceId });
    if (ratings.length === 0) {
        await Resource.findByIdAndUpdate(resourceId, { averageRating: 0 }, { new: true });
        return;
    }

    const totalRating = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    const averageRating = totalRating / ratings.length;

    await Resource.findByIdAndUpdate(resourceId, { averageRating }, { new: true });
};

exports.getResourceWithRatings = async (req, res) => {
    try {
        const resourceId = req.params.resourceId;
        const resource = await Resource.findById(resourceId).populate('uploadedBy');
        const ratings = await Rating.find({ resource: resourceId }).populate('user');
        const userRating = await Rating.findOne({ resource: resourceId, user: req.user.id });

        if (!resource) {
            return res.status(404).send('Resource not found.');
        }

        res.render('Resource', {
            resource,
            ratings,
            userRating,
            title: resource.title,
            user: req.user
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('Error', { message: 'Something went wrong while retrieving the resource.' });
    }
};

exports.addOrUpdateRating = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const userId = req.user.id;
        const resourceId = req.params.resourceId;

        const existingRating = await Rating.findOne({ resource: resourceId, user: userId });

        if (existingRating) {
            existingRating.rating = rating;
            existingRating.comment = comment;
            await existingRating.save();
        } else {
            const newRating = new Rating({
                resource: resourceId,
                user: userId,
                rating,
                comment
            });
            await newRating.save();

            await Resource.findByIdAndUpdate(
                resourceId, 
                { $push: { ratings: newRating._id } }, 
                { new: true }
            );

        }

        await updateAverageRating(resourceId);

        res.redirect(`/resource/resource/${resourceId}`);  
    } catch (error) {
        console.error(error);
        res.status(500).render('Error', { message: 'Something went wrong while submitting your rating.' });
    }
};
