const mongoose = require('mongoose');
const slug = require('slugs');

mongoose.Promise = global.Promise;

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Please enter a store name!'
  },
  slug: String,
  description: {
    type: String,
    trim: true
  },
  tags: [String],
  created: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [{
      type: Number,
      required: 'You must supply coordinates!'
    }],
    address: {
      type: String,
      required: 'You must supply an address!'
    }
  },
  photo: String,
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'You must supply an author!'
  }
}, {
  // Virtuals aren't returned by default, and have to be specifically referenced.
  // Include this object if you want to override the default:
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Define our indexes
// Index as text below to allow efficient text based searches using mongo $text aggregation operations
storeSchema.index({
  name: 'text',
  description: 'text'
});

storeSchema.index({ location: '2dsphere' });

storeSchema.pre('save', async function(next) {
  if (!this.isModified('name')) {
    next();
    return; // or return next();
  }
  this.slug = slug(this.name);
  // Find other stores with the same slug prefix (inc e.g. slug, slug-1, slug-2 etc.) 
  const slugPattern = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const storeWithSlug = await this.constructor.find({ slug: slugPattern });

  if (storeWithSlug.length) {
    this.slug = `${this.slug}-${storeWithSlug.length + 1}`;
  }

  next();
});

// Can add another pre save here to sanitise data being saved 
// e.g. strip out images that have been added where there should be only text,
// or remove malicious code

storeSchema.statics.getTagsList = function() {
  return this.aggregate([
    { $unwind: '$tags'},
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
};

storeSchema.statics.getStoresByTag = function(tag) {
  const tagQuery = tag || { $exists: true };
  return this.find({ tags: tagQuery });
};

// Find reviews where store._id === review.store
// Kind of equivalent to join in SQL
storeSchema.virtual('reviews', {
  ref: 'Review',    // Model to link to
  localField: '_id',    // Which field on the store?
  foreignField: 'store'   // Which field on the review?
});

module.exports = mongoose.model('Store', storeSchema);
