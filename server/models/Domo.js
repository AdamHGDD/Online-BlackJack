// Includes
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const _ = require('underscore');

// Set up model
let DomoModel = {};

// mongoose.Types.ObjectID is a function that converts string ID to mongo id
const convertId = mongoose.Types.ObjectId;
const setName = (name) => _.escape(name).trim();

// Set the schema for how data should be held
const DomoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    set: setName,
  },

  age: {
    type: Number,
    min: 0,
    required: true,
  },

  image: {
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
DomoSchema.statics.toAPI = (doc) => ({
  name: doc.name,
  age: doc.age,
  image: doc.image,
});

DomoSchema.statics.findByOwner = (ownerId, callback) => {
  const search = {
    owner: convertId(ownerId),
  };

  return DomoModel.find(search).select('name age image').lean().exec(callback);
};

DomoSchema.statics.deleteByName = (ownerId, nametag, callback) => {
  const search = {
    owner: convertId(ownerId),
    name: nametag
  };

  console.log("delete by name: "+nametag);

  return DomoModel.deleteOne(search, function (err) {
    if (err) {
      console.log("error on delete");
    }
    return err;
  }).exec(callback);
};

// Define model
DomoModel = mongoose.model('Domo', DomoSchema);

// Exports
module.exports.DomoModel = DomoModel;
module.exports.DomoSchema = DomoSchema;
