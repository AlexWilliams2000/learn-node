const mongoose = require('mongoose');
const Store = mongoose.model('Store');

exports.homePage = (req, res) => {
  console.log(req.name);
  // N.B. Flashes only work in applications which hold state in a session, will not work with stateless apps
  // req.flash('error', 'Something happened!');
  // req.flash('info', 'Something else happened!');
  // req.flash('warning', 'A third thing happened!');
  // req.flash('success', '<strong>Nothing</strong> happened :-(');
  // req.flash('success', 'Still nothing, but this demonstrates how all flash messages in a category are stored in an array');
  res.render('index');// , { title: 'MyShop' });
};

exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add Store' });
};

exports.createStore = async (req, res) => {
  const store = new Store(req.body);
  store.age = 10;
  console.log(`Store slug before save = ${store.slug}`);
  await store.save();
  console.log(`Store slug after save = ${store.slug}`);
  req.flash('success', `Successfully created ${store.name}. Care to leave a review?`);
  res.redirect(`/store/${store.slug}`);

  console.log('It worked!');

    // .then(storeDetails => storeDetails.find())
    // .then(stores => res.render('storeList', { stores }))
    // .catch((err) => {
    //   throw Error(err);
    // });
  // res.json(req.body);
};
