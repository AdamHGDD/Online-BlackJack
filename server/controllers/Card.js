// Include models
const models = require('../models');

// Get Card model
const { Card } = models;
const { Account } = models;

// Make a card
const makeCard = (rnk, st, val, img, ownr, cards) => {

  let imag = img;
  // Test for AD
  if(imag === "/assets/img/AD.png")
  {
    imag = "/assets/img/AceD.png"
  }

  // Create card js object
  const cardData = {
    rank: rnk,
    suit: st,
    value: val,
    location: 'deck',
    image: imag,
    owner: ownr,
  };

  for (let i = 0; i < cards.length; i++) {
    if (cards[i].rank === rnk && cards[i].suit === st) {
      return null;
    }
  }

  console.log(`Created card: ${rnk} of ${st}`);

  // Make a new card model from the js object created above
  const newCard = new Card.CardModel(cardData);

  // Save new card
  const cardPromise = newCard.save();

  // Complete and return the saved object
  return cardPromise;
};

// Create all 4 cards for a rank
const allSuits = (val, rank, rankAcro, ownr, cards) => {
  makeCard(rank, 'Spades', val, (`/assets/img/${rankAcro}S.png`), ownr, cards);
  makeCard(rank, 'Hearts', val, (`/assets/img/${rankAcro}H.png`), ownr, cards);
  makeCard(rank, 'Diamonds', val, (`/assets/img/${rankAcro}D.png`), ownr, cards);
  makeCard(rank, 'Clubs', val, (`/assets/img/${rankAcro}C.png`), ownr, cards);
};

// Load page
const makerPage = (req, res) => {
  // Find the card for the active user
  Card.CardModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    console.log('Before creating:');
    // console.dir(docs);

    // Make all the cards
    for (let i = 2; i < 11; i++) {
      allSuits(i, (`${i}`), i, req.session.account._id, docs);
    }

    // Face cards
    allSuits(10, ('Jack'), 'J', req.session.account._id, docs);
    allSuits(10, ('Queen'), 'Q', req.session.account._id, docs);
    allSuits(10, ('King'), 'K', req.session.account._id, docs);
    allSuits(11, ('Ace'), 'A', req.session.account._id, docs);

    // Send the data to the page
    // Attach to csurf
    return res.render('app', { csrfToken: req.csrfToken(), cards: docs });
  });
};

const getCards = (request, response) => {
  const req = request;
  const res = response;
  console.log('Get Cards');

  return Card.CardModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    return res.json({ cards: docs });
  });
};

// Alterative version of the method for just finding the player's hand
const getPlayerCards = (request, response) => {
  const req = request;
  const res = response;
  console.log('Get Player Cards');

  return Card.CardModel.findByLocation(req.session.account._id, 'player', (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    return res.json({ cards: docs });
  });
};

// Alterative version of the method for just finding the dealer's hand
const getDealerCards = (request, response) => {
  const req = request;
  const res = response;
  console.log('Get Dealer Cards');

  return Card.CardModel.findByLocation(req.session.account._id, 'dealer', (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    return res.json({ cards: docs });
  });
};

const calculateCards = (location, cards) => {
  // First get the relevant cards
  let relCards = [];
  for (let i = 0; i < cards.length; i++) {
    if (cards[i].location === location) {
      relCards.push(cards[i]);
    }
  }

  // Then calculate raw value
  let value = 0;
  for (let i = 0; i < relCards.length; i++) {
    value += relCards[i].value;
  }

  // Check for aces if over 21
  for (let i = 0; i < relCards.length; i++) {
    if(value > 21 && relCards[i].value === 11){
      value -= 10;
    }
  }

  // If still over 21 reduce to 0
  if(value > 21) {value = 0;}
  // Blackjack is better than just a normal 21
  if(value === 21 && relCards.length === 2) {value = 22;}

  // Return calculated value
  console.log("Calculated value for: "+location+", value: "+value);
  return value;
}

// Helper methods for playing the game
const drawCard = (newLocation, cards) => {
  console.log('draw a card');
  // New arrays based on cards
  let deck = [];
  let newCardList = [];

  // Find the cards that are in the deck
  for (let i = 0; i < cards.length; i++) {
    if (cards[i].location === 'deck') {
      deck.push(cards[i]);
    }
    // Save it to the return list
    newCardList.push(cards[i]);
  }

  // Check if the deck is empty
  if (!(deck.length > 1)) {
    // Refresh the card list
    newCardList = [];
    // Put discard back into the deck
    for (let i = 0; i < cards.length; i++) {
      if (cards[i].location === 'discard') {
        // Switch location
        const cardToChange = cards[i];
        cardToChange.location = 'deck';
        // Update the card
        Card.CardModel.findByIdAndUpdate(cards[i]._id, cards[i], () => { console.log('Found and Updated to deck'); });
        deck.push(cardToChange);
        // Save it to the return list
        newCardList.push(cards[i]);
      }
      else{
        // Save it to the return list
        newCardList.push(cards[i]);
      }
    }
  }

  // Take a card from the deck and bring it to a new location (player's hand or dealer's hand)
  const cardToChange = deck[Math.floor(Math.random() * deck.length)];
  // Find index in array
  let indexToChange = newCardList.indexOf(cardToChange);
  cardToChange.location = newLocation;
  // Update the card in the database
  Card.CardModel.findByIdAndUpdate(cardToChange._id, cardToChange, () => { console.log('Found and Updated to a hand'); });
  // Update the card in the list
  newCardList[indexToChange] = cardToChange;

  // Return the new version of cards
  return newCardList;
};

const fiveChips = (req, res) => {
  // Grab user
  const accountToChange = req.session.account;
  accountToChange.chips += 5;
  // Update the account in the database
  Account.AccountModel.findByIdAndUpdate(req.session.account._id, accountToChange, () => { console.log('Added 5 chips'); });
  res.redirect('/');
}

const newGame = (req, res, cards) => {
  console.log('newGame');
  console.dir(req.session.account);
  // Check account
  if(req.session.account.inGame || req.session.account.chips < 1)
  {
    return res.status(400).json({ message: 'Previous game wasn\'t finished' });
  }

  // Change account
  // Grab user
  const accountToChange = req.session.account;
  accountToChange.chips -= 1;
  accountToChange.inGame = true;
  // Update the card in the database
  Account.AccountModel.findByIdAndUpdate(req.session.account._id, accountToChange, () => { console.log('Removed 1 chip and started game'); });

  // Discard any existing player and dealer cards, allowing card counting
  for (let i = 0; i < cards.length; i++) {
    if (cards[i].location === 'dealer' || cards[i].location === 'player') {
      // Switch location to save and then update/save
      const cardToChange = cards[i];
      cardToChange.location = 'discard';
      // console.dir(cardToChange);
      Card.CardModel.findByIdAndUpdate(cards[i]._id, cards[i], () => { console.log('Found and Updated to discard'); });
    }
  }

  // New game so draw 2 for player and 1 for dealer
  let newCards = drawCard('player', cards);
  newCards = drawCard('player', newCards);
  drawCard('dealer', newCards);
  // console.log("print new cards: "+newCards.length);
  // console.dir(newCards);
  // Response message
  return res.status(200).json({ message: 'New game has started' });
};

const stand = (req, res, cards) => {
  // Player has finished, now finish for the dealer
  let newCards = cards;
  // Calculate value to see if the dealer needs a new card
  while (calculateCards("dealer", newCards) < 17 && calculateCards("dealer", newCards) > 1) {
    // Draw a new card for dealer if they need a new card
    newCards = drawCard('dealer', newCards);
  }

  // Change account
  // Grab user
  const accountToChange = req.session.account;

  // Compare to player
  if (calculateCards("player", newCards) > calculateCards("dealer", newCards)) {
    accountToChange.chips += 2;
    // End game
    accountToChange.inGame = false;
    // Update the account in the database
    Account.AccountModel.findByIdAndUpdate(req.session.account._id, accountToChange, () => { console.log('Removed 1 chip and started game'); });
    // Game over win
    return res.status(200).json({ message: 'You have won this hand' });
  }

  // Dealer wins in a tie, or if dealer is higher
  // Player has already payed
  // End game
  accountToChange.inGame = false;
  // Update the account in the database
  Account.AccountModel.findByIdAndUpdate(req.session.account._id, accountToChange, () => { console.log('Removed 1 chip and started game'); });

  // Game over loss
  return res.status(200).json({ message: 'You have lost this hand' });
};

const drawPlayerCard = (req, res, cards) => {
  // Check if a card can even be drawn
  if(calculateCards("player", cards) > 20 || calculateCards("player", cards) < 2)
  {
    return res.status(400).json({ message: 'Invalid Action, Press New Game' });
  }

  // Draw a single card
  let newCards = drawCard('player', cards);
  
  // Check if the game is over
  if(calculateCards("player", newCards) > 20 || calculateCards("player", newCards) < 2){
    // Move onto the end of the game
    return stand(req, res, newCards);
  }
  
  // Response message
  return res.status(200).json({ message: 'Drew a card for the player successful' });
};

const playerAction = (request, response) => {
  // Make code shorter
  const req = request;
  const res = response;
  console.log('begin player action');

  return Card.CardModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    console.log('begin player action callback');
    // console.dir(docs);

    // Switch statement for figuring out cards
    switch (request.body.step) {
      case 'new':
        return newGame(req, res, docs);
      case 'hit':
        return drawPlayerCard(req, res, docs);
      case 'stand':
        return stand(req, res, docs);
      default:
        return newGame(req, res, docs);
    }
  });
};

// Exports
module.exports.makerPage = makerPage;
module.exports.getCards = getCards;
module.exports.getPlayerCards = getPlayerCards;
module.exports.getDealerCards = getDealerCards;
module.exports.playerAction = playerAction;
module.exports.fiveChips = fiveChips;
