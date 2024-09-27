const User = require('../models/User');

exports.renderLoginForm = (req, res) => {
  res.render('Login', { title: 'Login', user: req.user });
};

exports.renderRegisterForm = (req, res) => {
  res.render('Register', { title: 'Register', user: req.user });
};

exports.register = async (req, res) => {
  try {
    const { name, emailid, password } = req.body;
    const newUser = new User({ name, emailid, password });
    await newUser.save();
    res.redirect('/login');
  } catch (err) {
    res.status(400).send(err.message);
  }
};

exports.logout = (req, res, next) => {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
};

exports.renderProfile = (req, res) => {
  if (!req.user) {
    return res.redirect('/login');
  }
  res.render('Profile', { title: 'Your Profile', user: req.user });
};

exports.updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).send('User not found');
    }
    user.name = name;
    await user.save();
    res.redirect('/profile');
  } catch (err) {
    res.status(400).send(err.message);
  }
};