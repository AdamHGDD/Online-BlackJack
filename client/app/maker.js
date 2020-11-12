const handleDomo = (e) => {
  console.log("handle domo");

  e.preventDefault();

  $("#domoMessage").animate({width:'hide'},350);

  if($("#domoName").val() == '' || $("#domoAge").val() == '') {
    handleError("RAWR! All fields are required");
    return false;
  }

  sendAjax('POST', $("#domoForm").attr("action"), $("#domoForm").serialize(), function() {
    loadDomosFromServer();
  });

  return false;
};

const handleDomoDelete = (e) => {
  console.log("handle domo delete");
  
  e.preventDefault();

  $("#domoMessage").animate({width:'hide'},350);

  if($("#domoNameD").val() == '') {
    handleError("RAWR! Name is required");
    return false;
  }

  console.log("domo delete action: "+$("#domoDel").attr("action"));
  console.log("domo delete serialize: "+$("#domoDel").serialize());

  sendAjax('POST', $("#domoDel").attr("action"), $("#domoDel").serialize(), function() {
    loadDomosFromServer();
  });

  return false;
};

const DomoForm = (props) => {
  return (
    <form id="domoForm"
      onSubmit={handleDomo}
      name="domoForm"
      action="/maker"
      method="POST"
      className="domoForm"
    >
      <label htmlFor="name">Name: </label>
      <input id="domoName" type="text" name="name" placeholder="Domo Name" />
      <label htmlFor="age">Age: </label>
      <input id="domoAge" type="text" name="age" placeholder="Domo Age"/>
      <label htmlFor="image">Image: </label>
      <input id="image" type="text" name="image" placeholder="Domo Image"/>
      <input type="hidden" name="_csrf" value={props.csrf} />
      <input className="makeDomoSubmit" type="submit" value="Make Domo" />
    </form>
  );
};
const DomoDel = (props) => {
  return (
    <form id="domoDel"
      onSubmit={handleDomoDelete}
      name="domoDel"
      action="/delete"
      method="POST"
      className="domoDel"
    >
      <label htmlFor="name">Name: </label>
      <input id="domoNameD" type="text" name="name" placeholder="Domo Name" />
      <input type="hidden" name="_csrf" value={props.csrf} />
      <input className="makeDomoSubmit" type="submit" value="Delete Domo" />
    </form>
  );
};

const DomoList = function(props) {
  if(props.domos.length === 0) {
    return (
      <div className="domoList">
        <h3 className="emptyDomo">No Domos yet</h3>
      </div>
    );
  }

  const domoNodes = props.domos.map(function(domo) {
    return (
      <div key={domo._id} className="domo">
        <img src={domo.image} alt="domo face" className="domoFace" />
        <h3 className="domoName"> Name: {domo.name} </h3>
        <h3 className="domoAge"> Age: {domo.age} </h3>
      </div>
    );
  });

  return (
    <div className="domoList">
      {domoNodes}
    </div>
  );
};

const loadDomosFromServer = () => {
  console.log("load domos from server");
  sendAjax('GET', '/getDomos', null, (data) => {
    ReactDOM.render(
      <DomoList domos={data.domos} />, document.querySelector("#domos")
    );
  });
};

const setup = function(csrf) {
  ReactDOM.render(
    <DomoForm csrf={csrf} />, document.querySelector("#makeDomo")
  );

  ReactDOM.render(
    <DomoDel csrf={csrf} />, document.querySelector("#deleteDomo")
  );

  ReactDOM.render(
    <DomoList domos={[]} />, document.querySelector("#domos")
  );

  loadDomosFromServer();
};

const getToken = () => {
  sendAjax('GET', '/getToken', null, (result) => {
    setup(result.csrfToken);
  });
};

$(document).ready(function() {
  getToken();
});