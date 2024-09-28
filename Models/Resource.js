const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  subject: { type: String, required: true },
  tags: [{ type: String }],
  fileType: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileImage: {type: String, required: true},
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accessLevel: {
    type: String,
    enum: ['public', 'private', 'restricted'],
    default: 'public'
  },
  views: { type: Number, default: 0 },
  downloads: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  ratings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Rating' }]
}, { timestamps: true });

module.exports = mongoose.model('Resource', ResourceSchema);
