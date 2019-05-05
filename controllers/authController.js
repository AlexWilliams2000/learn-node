const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');
const mail = require('../handlers/mail');

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Login failed',
  successRedirect: '/',
  successFlash: 'You are now logged in.'
});

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You are now logged out.');
  res.redirect('/');
};

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'Oops, you must be logged in to do that!');
  res.redirect('/login');
};

exports.forgot = async (req, res) => {
  // 1. Ensure user exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    // Shouldn't let malicious users know there is a valid email - a message like
    // 'No account with that email exists.' leaks information, hence the "lie" below..
    // Hmmm..but this uses an error flash? Which does the same thing..?
    req.flash('error', 'A password reset has been mailed to you.');
    return res.redirect('/login');
  }
  // 2. Reset tokens and expiry on their account
  // User Node native crypto for cryptographically secure random strings:
  user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordExpires = Date.now() + 3600000;
  await user.save();
  // 3. Send email with token
  const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
  await mail.send({
    user,
    subject: 'Password reset',
    resetURL,
    filename: 'password-reset'
  });
  req.flash('success', 'You have been emailed a password reset link.');
  // 4. Redirect to login page
  res.redirect('/login');
};

exports.reset = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });
  if (!user) {
    req.flash('error', 'Password reset is invalid or has expired');
    return res.redirect('/login');
  }
  // If the user is valid, show the password reset form
  res.render('reset', { title: 'Reset your password.' });
};

exports.validatePasswords = (req, res, next) => {
  // Think this'll need a check on whether the token has expired too? Otherwise once
  // you've loaded the reset page (via GET) the reset token is effectively valid forever,
  // so long as the page isn't refreshed..
  // Update - so this is handled in the function below after all. Phew 👍
  if (req.body.password === req.body['password-confirm']) {
    return next();
  }
  req.flash('error', 'Passwords don\'t match!');
  res.redirect('back');
};

exports.updatePassword = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });
  if (!user) {
    req.flash('error', 'Password reset is invalid or has expired');
    return res.redirect('/login');
  }

  const setPassword = promisify(user.setPassword, user);
  await setPassword(req.body.password);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  const updatedUser = await user.save();
  await req.login(updatedUser);
  req.flash('success', '✊ Nice! Your password has been reset, and you are now logged in.');
  res.redirect('/');
};
