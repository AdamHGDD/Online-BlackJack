"use strict";

var handleCard = function handleCard(e) {
  console.log("handle card");
  e.preventDefault();
  $("#cardMessage").animate({
    width: 'hide'
  }, 350);

  if ($("#cardName").val() == '' || $("#cardAge").val() == '') {
    handleError("RAWR! All fields are required");
    return false;
  }

  sendAjax('POST', $("#cardForm").attr("action"), $("#cardForm").serialize(), function () {
    loadCardsFromServer();
  });
  return false;
};

var CardList = function CardList(props) {
  if (props.cards.length === 0) {
    return /*#__PURE__*/React.createElement("div", {
      className: "cardList"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "emptyCard"
    }, "No Cards yet"));
  }

  var cardNodes = props.cards.map(function (card) {
    return /*#__PURE__*/React.createElement("div", {
      key: card._id,
      className: "card"
    }, /*#__PURE__*/React.createElement("img", {
      src: card.image,
      alt: "card face",
      className: "cardFace"
    }), /*#__PURE__*/React.createElement("h3", {
      className: "cardName"
    }, card.rank, " of ", card.suit));
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "cardList"
  }, cardNodes);
};

var loadCardsFromServer = function loadCardsFromServer() {
  console.log("load cards from server");
  sendAjax('GET', '/getPlayerCards', null, function (data) {
    ReactDOM.render( /*#__PURE__*/React.createElement(CardList, {
      cards: data.cards
    }), document.querySelector("#playerCards"));
  });
  sendAjax('GET', '/getDealerCards', null, function (data) {
    ReactDOM.render( /*#__PURE__*/React.createElement(CardList, {
      cards: data.cards
    }), document.querySelector("#dealerCards"));
  });
};

var handleHButton = function handleHButton(e) {
  e.preventDefault();
  sendAjax('POST', 'playerAction', $("#hitBttn").serialize(), loadCardsFromServer);
};

var handleSButton = function handleSButton(e) {
  e.preventDefault();
  sendAjax('POST', 'playerAction', $("#standBttn").serialize(), loadCardsFromServer);
};

var handleNButton = function handleNButton(e) {
  e.preventDefault();
  sendAjax('POST', 'playerAction', $("#newGameBttn").serialize(), loadCardsFromServer);
};

var HitButton = function HitButton(props) {
  return /*#__PURE__*/React.createElement("form", {
    id: "hitBttn",
    onSubmit: handleHButton,
    className: "actForm"
  }, /*#__PURE__*/React.createElement("input", {
    type: "hidden",
    name: "step",
    value: "hit"
  }), /*#__PURE__*/React.createElement("input", {
    type: "hidden",
    name: "_csrf",
    value: props.csrf
  }), /*#__PURE__*/React.createElement("input", {
    className: "formSubmit",
    type: "submit",
    value: "Hit"
  }));
};

var StandButton = function StandButton(props) {
  return /*#__PURE__*/React.createElement("form", {
    id: "standBttn",
    onSubmit: handleSButton,
    className: "actForm"
  }, /*#__PURE__*/React.createElement("input", {
    type: "hidden",
    name: "step",
    value: "stand"
  }), /*#__PURE__*/React.createElement("input", {
    type: "hidden",
    name: "_csrf",
    value: props.csrf
  }), /*#__PURE__*/React.createElement("input", {
    className: "formSubmit",
    type: "submit",
    value: "Stand"
  }));
};

var NewGameButton = function NewGameButton(props) {
  return /*#__PURE__*/React.createElement("form", {
    id: "newGameBttn",
    onSubmit: handleNButton,
    className: "actForm"
  }, /*#__PURE__*/React.createElement("input", {
    type: "hidden",
    name: "step",
    value: "new"
  }), /*#__PURE__*/React.createElement("input", {
    type: "hidden",
    name: "_csrf",
    value: props.csrf
  }), /*#__PURE__*/React.createElement("input", {
    className: "formSubmit",
    type: "submit",
    value: "New Game"
  }));
};

var setup = function setup(csrf) {
  ReactDOM.render( /*#__PURE__*/React.createElement(CardList, {
    cards: []
  }), document.querySelector("#playerCards"));
  ReactDOM.render( /*#__PURE__*/React.createElement(CardList, {
    cards: []
  }), document.querySelector("#dealerCards"));
  ReactDOM.render( /*#__PURE__*/React.createElement(HitButton, {
    csrf: csrf
  }), document.querySelector("#hitButton"));
  ReactDOM.render( /*#__PURE__*/React.createElement(StandButton, {
    csrf: csrf
  }), document.querySelector("#standButton"));
  ReactDOM.render( /*#__PURE__*/React.createElement(NewGameButton, {
    csrf: csrf
  }), document.querySelector("#newButton"));
  var dataSend = {
    step: "new",
    "_csrf": csrf
  };
  sendAjax('POST', '/playerAction', dataSend, loadCardsFromServer);
};

var getToken = function getToken() {
  sendAjax('GET', '/getToken', null, function (result) {
    setup(result.csrfToken);
  });
};

$(document).ready(function () {
  getToken();
});
"use strict";

var handleError = function handleError(message) {
  $("#errorMessage").text(message);
  $("#cardMessage").animate({
    width: 'toggle'
  }, 350);
};

var redirect = function redirect(response) {
  $("#cardMessage").animate({
    width: 'hide'
  }, 350);
  window.location = response.redirect;
};

var sendAjax = function sendAjax(type, action, data, success) {
  $.ajax({
    cache: false,
    type: type,
    url: action,
    data: data,
    dataType: "json",
    success: success,
    error: function error(xhr, status, _error) {
      var messageObj = JSON.parse(xhr.responseText);
      handleError(messageObj.error);
    }
  });
};
