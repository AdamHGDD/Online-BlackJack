// Include models
const models = require('../models');

// Get Card model
const { Card } = models;

// Make a card
const makeCard = (rnk, st, val, img, ownr, cards) => {

  // Create card js object
  const cardData = {
    rank: rnk,
    suit: st,
    value: val,
    location: "deck",
    image: img,
    owner: ownr,
  };

  for (let i = 0; i < cards.length; i++) {
    if(cards[i].rank === rnk && cards[i].suit === st) {
      return null;
    }
  }

  console.log("Created card: "+rnk+" of "+st);

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

    console.log("Before creating:");
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
  console.log("Get Cards");

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
  console.log("Get Player Cards");

  return Card.CardModel.findByLocation(req.session.account._id, "player", (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    return res.json({ cards: docs });
  });
}

// Alterative version of the method for just finding the dealer's hand
const getDealerCards = (request, response) => {
  const req = request;
  const res = response;
  console.log("Get Dealer Cards");

  return Card.CardModel.findByLocation(req.session.account._id, "dealer", (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    return res.json({ cards: docs });
  });
}

// Helper methods for playing the game
const drawCard = (newLocation, cards) => {
  console.log("draw a card");
  //console.dir(cards); 
  // Find the cards that are in the deck
  let deck = [];
  for (let i = 0; i < cards.length; i++) {
    if(cards[i].location === "deck"){
      deck.push(cards[i]);
    }
  }

  // Check if the deck is empty
  if(!(deck.length > 1)) {
    // Put discard back into the deck
    for (let i = 0; i < cards.length; i++) {
      if(cards[i].location === "discard"){
        // Switch location to save and then update/save
        cards[i].location = "deck";
        Card.CardModel.findByIdAndUpdate(cards[i]._id, cards[i], () => {console.log("Found and Updated to deck")});
      }
    }
  }

  // Take a card from the deck and bring it to a new location (player's hand or dealer's hand)
  let index = [Math.floor(Math.random() * deck.length)];
  deck[index].location = newLocation;
  Card.CardModel.findByIdAndUpdate(deck[index]._id, deck[index], () => {console.log("Found and Updated to a hand")});

  // Return the card for if it's needed
  return deck[index];
}

const newGame = (req, res, cards) => {
  console.log("newGame");
  // Discard any existing player and dealer cards, allowing card counting
  for (let i = 0; i < cards.length; i++) {
    if(cards[i].location === "dealer" || cards[i].location === "player"){
      // Switch location to save and then update/save
      cards[i].location = "discard";
      // console.dir(cardToChange);
      Card.CardModel.findByIdAndUpdate(cards[i]._id, cards[i], () => {console.log("Found and Updated to discard")});
    }
  }
  // New game so draw 2 for player and 1 for dealer
  drawCard("player", cards);
  drawCard("player", cards);
  drawCard("dealer", cards);
  // Response message
  return res.status(200).json({ message: 'New game has started' });
}

const drawPlayerCard = (req, res, cards) => {
  // Draw a single card
  drawCard("player", cards);
  // Response message
  return res.status(200).json({ message: 'Drew a card for the player successful' });
}

const stand = (req, res, cards) => {
  // Player has finished, now finish for the dealer
  let dealerValue;
  //calculate value
  while(dealerValue < 17){
    drawCard("dealer", cards);
    //recalculate value
  }
  // Compare to player
  let playerValue
  //calculate player value
  // Player wins and gets payout
  if(playerValue > dealerValue){
    //money += bet
    // Game over win
    return res.status(200).json({ message: 'You have won this hand' });
  }
  // Dealer wins in a tie
  else {
    //money -= bet
    // Game over loss
    return res.status(200).json({ message: 'You have lost this hand' });
  }
}

const playerAction = (request, response) => {
  // Make code shorter
  const req = request;
  const res = response;
  console.log("begin player action");

  return Card.CardModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }
    
    console.log("begin player action callback");
    // console.dir(docs);
    
    // Switch statement for figuring out cards
    switch(request.body.step) {
      case "new":
        return newGame(req, res, docs);
      case "hit":
        return drawPlayerCard(req, res, docs);
      case "stand":
        return stand(req, res, docs);
      default:
        return newGame(req, res, docs);
    }
  });
}

// Exports
module.exports.makerPage = makerPage;
module.exports.getCards = getCards;
module.exports.getPlayerCards = getPlayerCards;
module.exports.getDealerCards = getDealerCards;
module.exports.playerAction = playerAction;