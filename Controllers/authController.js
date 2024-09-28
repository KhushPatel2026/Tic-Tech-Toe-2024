const User = require('../models/User');

exports.renderLoginForm = (req, res) => {
  res.render('Login', { title: 'Login', user: req.user });
};

exports.renderRegisterForm = (req, res) => {
  res.render('Register', { title: 'Register', user: req.user });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    let adminApproved = false;  
    if(role == "student"){
      adminApproved = true;
    }
    const newUser = new User({
      name,
      email,
      password,
      role,
      adminApproved
    });
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
    const { name, password, preferences } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).send('User not found');
    }
    user.name = name;
    if (password && password.length > 0) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    user.preferences = preferences;
    await user.save();
    res.redirect('/profile');
  } catch (err) {
    res.status(400).send(err.message);
  }
};
