// Includes
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
// const _ = require('underscore');

// Set up model
let CardModel = {};

// mongoose.Types.ObjectID is a function that converts string ID to mongo id
const convertId = mongoose.Types.ObjectId;
// const setName = (name) => _.escape(name).trim();

// Set the schema for how data should be held
const CardSchema = new mongoose.Schema({
  rank: {
    type: String,
    required: true,
    trim: true,
  },

  suit: {
    type: String,
    required: true,
    trim: true,
  },

  value: {
    type: Number,
    min: 0,
    required: true,
  },

  image: {
    type: String,
    required: true,
    trim: true,
  },

  // Possible locations: "player", "dealer", "deck", and "discard"
  location: {
    type: String,
    required: true,
    trim: true,
  },

  owner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },

  createdData: {
    type: Date,
    default: Date.now,
  },
});

// Define the methods
CardSchema.statics.toAPI = (doc) => ({
  rank: doc.rank,
  suit: doc.suit,
  value: doc.value,
  image: doc.image,
});

// Search
CardSchema.statics.findByOwner = (ownerId, callback) => {
  const search = {
    owner: convertId(ownerId),
  };

  return CardModel.find(search).select('rank suit value image').lean().exec(callback);
};

// Search with location requirements
CardSchema.statics.findByLocation = (ownerId, loc, callback) => {
  const search = {
    owner: convertId(ownerId),
    location: loc,
  };

  return CardModel.find(search).select('rank suit value image').lean().exec(callback);
};

// Define model
CardModel = mongoose.model('Card', CardSchema);

// Exports
module.exports.CardModel = CardModel;
module.exports.CardSchema = CardSchema;
