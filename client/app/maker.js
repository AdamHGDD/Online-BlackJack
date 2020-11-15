const handleCard = (e) => {
  console.log("handle card");

  e.preventDefault();

  $("#cardMessage").animate({width:'hide'},350);

  if($("#cardName").val() == '' || $("#cardAge").val() == '') {
    handleError("RAWR! All fields are required");
    return false;
  }

  sendAjax('POST', $("#cardForm").attr("action"), $("#cardForm").serialize(), function() {
    loadCardsFromServer();
  });

  return false;
};

const CardList = function(props) {
  if(props.cards.length === 0) {
    return (
      <div className="cardList">
        <h3 className="emptyCard">No Cards yet</h3>
      </div>
    );
  }

  const cardNodes = props.cards.map(function(card) {
    return (
      <div key={card._id} className="card">
        <img src={card.image} alt="card face" className="cardFace" />
        <h3 className="cardName">{card.rank} of {card.suit}</h3>
      </div>
    );
  });

  return (
    <div className="cardList">
      {cardNodes}
    </div>
  );
};

const loadCardsFromServer = () => {
  console.log("load cards from server");
  sendAjax('GET', '/getCards', null, (data) => {
    ReactDOM.render(
      <CardList cards={data.cards} />, document.querySelector("#cards")
    );
  });
};

const setup = function(csrf) {
  ReactDOM.render(
    <CardList cards={[]} />, document.querySelector("#cards")
  );

  loadCardsFromServer();
};

const getToken = () => {
  sendAjax('GET', '/getToken', null, (result) => {
    setup(result.csrfToken);
  });
};

$(document).ready(function() {
  getToken();
});