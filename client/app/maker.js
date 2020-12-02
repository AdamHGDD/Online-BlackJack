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
  sendAjax('GET', '/getPlayerCards', null, (data) => {
    ReactDOM.render(
      <CardList cards={data.cards} />, document.querySelector("#playerCards")
    );
  });
  sendAjax('GET', '/getDealerCards', null, (data) => {
    ReactDOM.render(
      <CardList cards={data.cards} />, document.querySelector("#dealerCards")
    );
  });
};

const handleHButton = (e) => {
  e.preventDefault();
  sendAjax('POST', 'playerAction', $("#hitBttn").serialize(), loadCardsFromServer);
}
const handleSButton = (e) => {
  e.preventDefault();
  sendAjax('POST', 'playerAction', $("#standBttn").serialize(), loadCardsFromServer);
}
const handleNButton = (e) => {
  e.preventDefault();
  sendAjax('POST', 'playerAction', $("#newGameBttn").serialize(), loadCardsFromServer);
}

const HitButton = (props) => {
  return (
    <form id="hitBttn"
        onSubmit={handleHButton}
        className="actForm"
    >
      <input type="hidden" name="step" value={"hit"}/>
      <input type="hidden" name="_csrf" value={props.csrf}/>
      <input className="formSubmit" type="submit" value="Hit" />
    </form>
    );
};
const StandButton = (props) => {
  return (
    <form id="standBttn"
        onSubmit={handleSButton}
        className="actForm"
    >
      <input type="hidden" name="step" value={"stand"}/>
      <input type="hidden" name="_csrf" value={props.csrf}/>
      <input className="formSubmit" type="submit" value="Stand" />
    </form>
    );
};
const NewGameButton = (props) => {
  return (
    <form id="newGameBttn"
        onSubmit={handleNButton}
        className="actForm"
    >
      <input type="hidden" name="step" value={"new"}/>
      <input type="hidden" name="_csrf" value={props.csrf}/>
      <input className="formSubmit" type="submit" value="New Game" />
    </form>
    );
};

const setup = function(csrf) {
  ReactDOM.render(
    <CardList cards={[]} />, document.querySelector("#playerCards")
  );
  ReactDOM.render(
    <CardList cards={[]} />, document.querySelector("#dealerCards")
  );
  ReactDOM.render(
    <HitButton csrf={csrf} />, document.querySelector("#hitButton")
  );
  ReactDOM.render(
    <StandButton csrf={csrf} />, document.querySelector("#standButton")
  );
  ReactDOM.render(
    <NewGameButton csrf={csrf} />, document.querySelector("#newButton")
  );

  let dataSend = {step : "new", "_csrf" : csrf};

  sendAjax('POST', '/playerAction', dataSend, loadCardsFromServer);

  
};

const getToken = () => {
  sendAjax('GET', '/getToken', null, (result) => {
    setup(result.csrfToken);
  });
};

$(document).ready(function() {
  getToken();
});