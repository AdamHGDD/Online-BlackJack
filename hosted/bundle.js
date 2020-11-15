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
  sendAjax('GET', '/getCards', null, function (data) {
    ReactDOM.render( /*#__PURE__*/React.createElement(CardList, {
      cards: data.cards
    }), document.querySelector("#cards"));
  });
};

var setup = function setup(csrf) {
  ReactDOM.render( /*#__PURE__*/React.createElement(CardList, {
    cards: []
  }), document.querySelector("#cards"));
  loadCardsFromServer();
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
