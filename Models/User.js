const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  adminApproved: {type: Boolean, required: true},
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],  // Define different roles
    default: 'student',
    required: true
  },
  preferences: {type: String},
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }],
  publishedResources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }],
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

const User = mongoose.models.User || mongoose.model('User', userSchema);
module.exports = User;