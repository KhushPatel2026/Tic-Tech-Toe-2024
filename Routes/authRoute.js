const express = require("express");
const router = express.Router();
const passport = require("passport");
const authController = require("../Controllers/authController.js");
const isAuthenticated = require("../Middleware/isAuthenticated.js");

router.get("/login", authController.renderLoginForm);
router.post('/login', passport.authenticate('local', {
    successRedirect: '/resource',
    failureRedirect: '/login',
}));

router.get("/register", authController.renderRegisterForm);
router.post("/register", authController.register);

router.get("/logout", authController.logout);

router.get("/profile", authController.renderProfile);
router.post("/profile/update", isAuthenticated, authController.updateProfile);

router.get("/mybooks", isAuthenticated, authController.myBooks);

module.exports = router;
