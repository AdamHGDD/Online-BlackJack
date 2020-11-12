// Include models
const models = require('../models');

// Get Domo model
const { Domo } = models;

// Load page
const makerPage = (req, res) => {
  // Find the domo for the active user
  Domo.DomoModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    // Send the data to the page
    // Attach to csurf
    return res.render('app', { csrfToken: req.csrfToken(), domos: docs });
  });
};

// Make a domo
const makeDomo = (req, res) => {
  // Check for valid data
  if (!req.body.name || !req.body.age) {
    return res.status(400).json({ error: 'RAWR! Both name and age are required' });
  }

  console.log('about to see req.session');
  console.dir(req.session);
  console.log('done seeing req.session');

  // Backup image
  let img = "/assets/img/domoface.jpeg";

  if(req.body.image)
  {
    img = req.body.image;
  }

  // Create domo js object
  const domoData = {
    name: req.body.name,
    age: req.body.age,
    image: img,
    owner: req.session.account._id,
  };

  // Make a new domo model from the js object created above
  const newDomo = new Domo.DomoModel(domoData);

  // Save new domo
  const domoPromise = newDomo.save();

  // Finish
  domoPromise.then(() => res.json({ redirect: '/maker' }));

  // Catch errors
  domoPromise.catch((err) => {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Domo already exists.' });
    }

    return res.status(400).json({ error: 'An error occurred' });
  });

  // Complete and return the saved object
  return domoPromise;
};

// Make a domo
const deleteDomo = (req, res) => {
  // Check for valid data
  if (!req.body.name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  console.log('about to see req.session');
  console.dir(req.session);
  console.log('done seeing req.session');

  // Delete domo js object
  return Domo.DomoModel.deleteByName(req.session.account._id, req.body.name, (err) => {
    console.log("reached callback");
    if(err) {
      console.log(err);
      return res.status(400).json({error: 'An error occurred'});
    }
    return res.status(200).json({ error: 'Delete successful' });
  });
};

const getDomos = (request, response) => {
	const req = request;
	const res = response;

	return Domo.DomoModel.findByOwner(req.session.account._id, (err, docs) => {
		if(err) {
			console.log(err);
			return res.status(400).json({error: 'An error occurred'});
		}

		return res.json({domos: docs});
	});
};

// Exports
module.exports.makerPage = makerPage;
module.exports.getDomos = getDomos;
module.exports.make = makeDomo;
module.exports.delete = deleteDomo;