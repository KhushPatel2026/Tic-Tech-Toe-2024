const express = require("express");
const dontenv = require("dotenv").config();
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/User");
const authRoutes = require("./routes/authRoute");
const resourceRoutes = require("./routes/resourceRoute");
const ratingRoutes = require("./routes/ratingRoute");
const hbs = require("hbs");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

mongoose.connect("mongodb://127.0.0.1:27017/starterkit")
  .then(() => console.log("Connected to DB"))
  .catch(err => console.log(err));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: 'mysupersecretcode',
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const static_path = path.join(__dirname, "public");
app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));
hbs.registerPartials(path.join(__dirname, "views", "partials"));

passport.use(new LocalStrategy(
  { usernameField: 'emailid' },
  async (emailid, password, done) => {
    try {
      const user = await User.findOne({ emailid });
      if (!user) return done(null, false, { message: 'Incorrect email.' });
      const isMatch = await user.comparePassword(password);
      if (!isMatch) return done(null, false, { message: 'Incorrect password.' });
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

app.use("/", authRoutes);
app.use("/resource", resourceRoutes);
app.use('/ratings', ratingRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
