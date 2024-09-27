const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  emailid: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String },
  preferences: {
    subjects: [{ type: String }],
    resourceTypes: [{ type: String }]
  },
  uploadedResources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }],
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }],
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }],
  ratingsGiven: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Rating' }]
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
