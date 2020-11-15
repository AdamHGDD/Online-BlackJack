// Include models
const models = require('../models');

// Get Card model
const { Card } = models;

// Make a card
const makeCard = (rnk, st, val, img, ownr) => {
  console.log("Created card: "+rnk+" of "+st);

  // Create card js object
  const cardData = {
    rank: rnk,
    suit: st,
    value: val,
    location: "deck",
    image: img,
    owner: ownr,
  };

  // Make a new card model from the js object created above
  const newCard = new Card.CardModel(cardData);

  // Save new card
  const cardPromise = newCard.save();

  // Finish
  // cardPromise.then(() => res.json({ redirect: '/maker' }));

  // Complete and return the saved object
  return cardPromise;
};

// Create all 4 cards for a rank
const allSuits = (val, rank, rankAcro, ownr) => {
  makeCard(rank, 'Spades', val, (`/assets/img/${rankAcro}S.png`), ownr);
  makeCard(rank, 'Hearts', val, (`/assets/img/${rankAcro}H.png`), ownr);
  makeCard(rank, 'Diamonds', val, (`/assets/img/${rankAcro}D.png`), ownr);
  makeCard(rank, 'Clubs', val, (`/assets/img/${rankAcro}C.png`), ownr);
};

// Load page
const makerPage = (req, res) => {
  // Find the card for the active user
  Card.CardModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    // Make all the cards
    for (let i = 2; i < 11; i++) {
      allSuits(i, (`${i}`), i, req.session.account._id);
    }

    // Face cards
    allSuits(10, ('Jack'), 'J', req.session.account._id);
    allSuits(10, ('Queen'), 'Q', req.session.account._id);
    allSuits(10, ('King'), 'K', req.session.account._id);
    allSuits(11, ('Ace'), 'A', req.session.account._id);

    // Send the data to the page
    // Attach to csurf
    return res.render('app', { csrfToken: req.csrfToken(), cards: docs });
  });
};

const getCards = (request, response) => {
  const req = request;
  const res = response;
  console.log("Get Cards");

  return Card.CardModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    return res.json({ cards: docs });
  });
};

// Exports
module.exports.makerPage = makerPage;
module.exports.getCards = getCards;
