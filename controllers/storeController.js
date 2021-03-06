const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const User = mongoose.model('User');
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
  req.body.author = req.user._id;
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
  const page = req.params.page || 1;
  const limit = 4;
  const skip = (page * limit) - limit;
  // Query the database for a list of all stores
  const storesPromise = Store
    .find()
    .skip(skip)
    .limit(limit)
    .sort({ created: 'desc' });

  const countPromise = Store.count();

  const [stores, count] = await Promise.all([storesPromise, countPromise]);

  const pages = Math.ceil(count / limit);

  if (!stores.length && skip) {
    req.flash('info', `Hey! You asked for page ${page}. But that doesn't exist. So I put you on page ${pages}`);
    res.redirect(`/stores/page/${pages}`);
    return;
  }

  res.render('stores', { title: 'Stores', stores, page, pages, count });
};

exports.getHearts = async (req, res) => {
  const stores = await Store.find({
    _id: { $in: req.user.hearts }
  });
  res.render('stores', { title: 'Favourite Stores', stores });
};

exports.getStoreBySlug = async (req, res, next) => {
  const store = await Store.findOne({ slug: req.params.slug }).populate('author reviews');
  if (!store) {
    return next();
  }
  res.render('store', { store, title: store.name });
};

const confirmOwner = (store, user) => {
  if (!store.author.equals(user._id)) {
    // Surely this should be a flash?! Else the page displays a stack trace...
    throw Error('You must own a store in order to edit it!');
  }
};

exports.editStore = async (req, res) => {
  // 1. Find the store given the ID
  const store = await Store.findOne({ _id: req.params.id });
  // 2. Confirm user owns the store
  confirmOwner(store, req.user);
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

exports.getStoresByTag = async (req, res) => {
  const tag = req.params.tag;
  const tagsPromise = Store.getTagsList();
  const storesPromise = Store.getStoresByTag(tag);
  const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);

  res.render('tag', { tags, title: 'Tags', tag, stores });
};

exports.searchStores = async (req, res) => {
  const stores = await Store.find({
    $text: {
      $search: req.query.q
    }
  }, {
    score: { $meta: 'textScore' }
  }).sort({
    score: { $meta: 'textScore' }
  }).limit(5);
  res.json(stores);
};

exports.mapStores = async (req, res) => {
  const coordinates = [req.query.lng, req.query.lat].map(parseFloat);
  const q = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates
        },
        $maxDistance: 10000 // 10km
      }
    }
  };

  const stores = await Store.find(q).select('slug name description location photo')
    .limit(10);  // can alternatively use e.g. select('-author -location') to remove attributes from the result
  res.json(stores);
};

exports.mapPage = (req, res) => {
  res.render('map', { title: 'Map' });
};

exports.heartStore = async (req, res) => {
  const hearts = req.user.hearts.map(obj => obj.toString());
  const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet';
  const user = await User.findByIdAndUpdate(req.user._id,
    { [operator]: { hearts: req.params.id } },
    { new: true }
  );
  res.json(user);
};

exports.getTopStores = async (req, res) => {
  const stores = await Store.getTopStores();
  res.render('topStores', { stores, title: '⭐️ Top Stores' });
};
