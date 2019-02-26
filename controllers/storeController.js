exports.myMiddleware = (req, res, next) => {
  req.name = 'Al';
  res.cookie('name', 'Wes is cool', { maxAge: 9000000 });
  if (req.name === 'Al') {
    throw Error('That\'s a stupid name');
  }
  next();
}

exports.homePage = (req, res) => {
  console.log(req.name);
  res.render('index');
}