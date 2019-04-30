const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions = {
  // Store in memory since we're gonna resize and save the modified image to disk
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if (isPhoto) {
      next(null, true);
    } else {
      next({ message: 'That filetype isn\'t allowed!' }, false);
    }
  }
};

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

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  // Check if there's no new file to resize
  if (!req.file) {
    next();
  }
  const extension = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuid.v4()}.${extension}`;
  // Now we resize..
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  // Once we've written the resized photo to our filesystem, continue..
  next();
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

    // The 'old skool' pre-ES8 approach to promises with error handling:
    // somePromise
    // .then(storeDetails => storeDetails.find())
    // .then(stores => res.render('storeList', { stores }))
    // .catch((err) => {
    //   throw Error(err);
    // });
  // res.json(req.body);
  // Error handling is now defined in one place with a wrapper function around createStore added in the router,
  // see errorHandlers.js and index.js
};

exports.getStores = async (req, res) => {
  // 1. Query the database for a list of all stores
  const stores = await Store.find();
  // console.log(stores);
  res.render('stores', { title: 'Stores', stores });
};

exports.getStoreBySlug = async (req, res, next) => {
  const store = await Store.findOne({ slug: req.params.slug });
  if (!store) {
    next();
  }
  res.render('store', { store, title: store.name });
};

exports.editStore = async (req, res) => {
  // 1. Find the store given the ID
  const store = await Store.findOne({ _id: req.params.id });
  // 2. Confirm user owns the store
  // TODO
  // 3. Render out the edit form so the user can update it
  res.render('editStore', { title: `Edit ${store.name}`, store });
};

exports.updateStore = async (req, res) => {
  req.body.location.type = 'Point';
  // Find and update the store
  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, runValidators: true }).exec();
  // Redirect user to the store and confirm success
  req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store ➡️</a>`);
  res.redirect(`/stores/${store._id}/edit`);
};
