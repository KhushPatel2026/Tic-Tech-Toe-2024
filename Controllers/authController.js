const User = require('../models/User');
const Resource = require('../models/Resource');

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
    res.redirect('/profile');
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
    const { name, password, preference1, preference2, preference3, preference4, preference5 } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).send('User not found');
    }

    if (name && name.trim() !== '') {
      user.name = name;
    }

    if (password && password.trim().length > 0) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    const preferencesArray = [
      preference1 || user.preferences[0],
      preference2 || user.preferences[1],
      preference3 || user.preferences[2],
      preference4 || user.preferences[3],
      preference5 || user.preferences[4]
    ];

    user.preferences = preferencesArray;

    await user.save();
    res.redirect('/profile');
  } catch (err) {
    res.status(400).send(err.message);
  }
};

exports.myBooks = async (req, res) => {
  if (!req.user) {
    return res.redirect('/login');
  }
  const user = await User.findById(req.user.id).populate('publishedResources');
  res.render('MyBooks', { title: 'Your Books', user: req.user, resources: user.publishedResources });
}

