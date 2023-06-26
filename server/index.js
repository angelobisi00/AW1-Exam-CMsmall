'use strict';

const express = require('express');
const morgan = require('morgan'); // logging middleware
const { check, validationResult, } = require('express-validator'); // validation middleware
const passport = require('passport'); // auth middleware
const LocalStrategy = require('passport-local').Strategy; // username and password for login
const session = require('express-session'); // enable sessions
const cors = require('cors');
const pageDao = require('./dao-pages'); // module for accessing the films table in the DB
const userDao = require('./dao-users'); // module for accessing the users table in the DB
const dayjs = require('dayjs');

/*** Set up Passport ***/
// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(new LocalStrategy(
  function(username, password, done) {
    userDao.getUser(username, password).then((user) => {
      if (!user)
        return done(null, false, { message: 'Incorrect username and/or password.' });
        
      return done(null, user);
    })
  }
));

// serialize and de-serialize the user (user object <-> session)
// we serialize the user id and we store it in the session: the session is very small in this way
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
  userDao.getUserById(id)
    .then(user => {
      done(null, user); // this will be available in req.user
    }).catch(err => {
      done(err, null);
    });
});

// init express
const app = new express();
const port = 3001;

// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json());
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions)); // NB: Usare solo per sviluppo e per l'esame! Altrimenti indicare dominio e porta corretti
app.use(express.static(__dirname + '/public'));
// set up the session
app.use(session({
  // by default, Passport uses a MemoryStore to keep track of the sessions
  secret: 'wge8d239bwd93rkskb',   //personalize this random string, should be a secret value
  resave: false,
  saveUninitialized: false 
}));

// then, init passport
app.use(passport.initialize());
app.use(passport.session());


/*** Utility Functions ***/

// This function is used to format express-validator errors as strings
const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
  return `${location}[${param}]: ${msg}`;
};

// custom middleware: check if a given request is coming from an authenticated user
const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated())
    return next();
  
  return res.status(401).json({ error: 'Not authenticated'});
}


/*** Pages APIs ***/

// 1. Retrieve the list of all the pubblicated pages.
// GET /api/pubPages
app.get('/api/pubPages', (req, res) => {
  pageDao.listPages('pubb')
  .then((pages) => res.json(pages))
  .catch((err) => res.status(500).json(err));
});

// 2. Retrieve the list of all the available pages.
// GET /api/pages
app.get('/api/pages', isLoggedIn, (req, res) => {
  pageDao.listPages('all')
  .then((pages) => res.json(pages))
  .catch((err) => res.status(500).json(err));
})

// 3. Retrieve a page, given its “id”.
// GET /api/pages/<id>
app.get('/api/pages/:id',
  [ check('id').isInt({min: 1}) ],    // check: is the id a positive integer?
  async (req, res) => {
    try {
      const result = await pageDao.getPage(req.params.id);

      if(result.error){
        return res.status(404).json(result);
      }

      // se non si è loggati e la data di pubblicazione è futura, non si può vedere la pagina
      if(result.pubblicationDate == null || dayjs(result.pubblicationDate)?.isAfter(dayjs())){
        if(!req.isAuthenticated())
          return res.status(401).json({ error: 'Not authenticated'});
      }

      res.json(result);

    } catch (err) {
      res.status(500).end();
    }
  }
);

// 4. Create a new page, by providing all relevant information.
// POST /api/pages
app.post('/api/pages', isLoggedIn,
  [
    check('title').isLength({min: 1, max:160}),
    check('author').isInt({min: 1}),
    check('creationDate').isLength({min: 10, max: 10}).isISO8601({strict: true}),
    check('pubblicationDate').optional({nullable: true}).isLength({min: 10, max: 10}).isISO8601({strict: true}),
    check('content').isArray({min: 2}),
    check('content.*.type').isIn(['Paragraph', 'Image', 'Header']),
    check('content.*.name').isLength({min: 1, max: 1000}),
    check('content.*.value').isLength({min: 1, max: 1000}),
  ],
  async (req, res) => {
    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array().join(", ") }); // error message is a single string with all error joined together
    }
    // console.log(req.body.content.toString());
    // WARN: note that we expect watchDate with capital D but the databases does not care and uses lowercase letters, so it returns "watchdate"
    const page = {
      title: req.body.title,
      author: req.body.author,
      creationDate: req.body.creationDate, // A different method is required if also time is present. For instance: (req.body.watchDate || '').split('T')[0]
      pubblicationDate: req.body.pubblicationDate,
      content: JSON.stringify(req.body.content),
    };

    // Is the user authorized to create the page?
    if(req.user.admin !== 1 && req.user.id !== req.body.author){     
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify that the author exists
    try {
      const users = await userDao.getUsers();
      if(!users.find((user) => user.id == page.author)){
        return res.status(422).json({ error: `User with id ${page.author} does not exist` });
      }
    } catch (err) {
      res.status(503).json({ error: `Database error during the creation of new page: ${err}` }); 
    }

    // verify that one at least one block is header
    if(!req.body.content.find((block) => block.type == 'Header')){
      return res.status(422).json({ error: `At least one block must be a header` });
    }

    try {
      const result = await pageDao.addPage(page);
      res.json(result);
    } catch (err) {
      res.status(503).json({ error: `Database error during the creation of new page: ${err}` }); 
    }
  }
);

// 5. Update an existing page, by providing all the relevant information
// PUT /api/pages/<id>
app.put('/api/pages/:id', isLoggedIn,
  [
    check('id').isInt(),
    check('title').isLength({min: 1, max:160}),
    check('author').default(0),
    check('creationDate').isLength({min: 10, max: 10}).isISO8601({strict: true}).optional({checkFalsy: true}),
    check('pubblicationDate').optional({nullable: true}).isLength({min: 10, max: 10}).isISO8601({strict: true}),
    check('content').isArray({min: 2}),
    check('content.*.type').isIn(['Paragraph', 'Image', 'Header']),
    check('content.*.name').isLength({min: 1, max: 1000}),
    check('content.*.value').isLength({min: 1, max: 1000}),
  ],
  async (req, res) => {
    // Is there any validation error?
    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array().join(", ")  }); // error message is a single string with all error joined together
    }
    // Is the id in the body equal to the id in the url?
    if (req.body.id !== Number(req.params.id)) {
      return res.status(422).json({ error: 'URL and body id mismatch' });
    }

    // Is the user authorized to update the page?
    if(req.user.admin !== 1 && req.user.id !== req.body.author){     
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // verify that one at least one block is header
    if(!req.body.content.find((block) => block.type == 'Header')){
      return res.status(422).json({ error: `At least one block must be a header` });
    }

    const page = {
      id: req.body.id,
      title: req.body.title,
      author: req.body.author,
      creationDate: req.body.creationDate,
      pubblicationDate: req.body.pubblicationDate,
      content: JSON.stringify(req.body.content),
    };

    // Verify that the author exists
    try {
      const users = await userDao.getUsers();
      if(!users.find((user) => user.id == page.author)){
        return res.status(422).json({ error: `User with id ${page.author} does not exist` });
      }
    } catch (err) {
      res.status(503).json({ error: `Database error during the creation of new page: ${err}` }); 
    }

    try {
      const result = await pageDao.updatePage(page.id, page);
      if (result.error)
        res.status(404).json(result);
      else
        res.json(result); 
    } catch (err) {
      res.status(503).json({ error: `Database error during the update of page ${req.params.id}: ${err}` });
    }
  }
);

// 6. Delete an existing page, given its “id”.
// DELETE /api/pages/<id>
app.delete('/api/pages/:id', isLoggedIn,
  [ check('id').isInt({min: 1}) ],
  async (req, res) => {

    /* Per far cancellare la apgina solo all'admin o all'autore */
    const page = await pageDao.getPage(req.params.id);
    let valid = false;
    if(req.user.admin === 1){
      valid = true;
    }
    if(req.user.id === page.author){
      valid = true;
    }
    if(!valid){
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      await pageDao.deletePage(req.params.id);
      res.status(200).json({});
    } catch (err) {
      res.status(503).json({ error: `Database error during the deletion of page ${req.params.id}: ${err}` });
    }
});

// 7. Get the site name
// GET /api/get-name
app.get('/api/get-name', async (req, res) => {
    try {
      const result = await pageDao.getSiteName();
      if (result.error)
        res.status(404).json(result);
      else
        res.json(result);
    } catch (err) {
      res.status(500).end();
    }
  }
);

// 8. Modify the site name
// PUT /api/modify-name
app.put('/api/modify-name/:name', isLoggedIn,
  [
    check('name').isLength({min: 1, max:160})
  ],
  async (req, res) => {
    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array().join(", ")  }); // error message is a single string with all error joined together
    }

    // Is the user authorized to update the site name?
    if(req.user.admin !== 1){     
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const result = await pageDao.modifyName(req.params.name);
      if (result.error)
        res.status(404).json(result);
      else
        res.json(result); 
    } catch (err) {
      res.status(503).json({ error: `Database error during the update of name site: ${err}` });
    }
});

// 9. Get the images
// GET /api/images
app.get('/api/images', async (req, res) => {
  try {
    const result = await pageDao.getImages();
    res.json(result);
  } catch (err) {
    res.status(500).end();
  }
});

/*** Users APIs ***/

app.get('/api/users', async (req, res) => {
  userDao.getUsers()
    .then((users) => res.json(users))
    .catch((err) => res.status(500).json(err));
});

app.post('/api/sessions', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if(err) return next(err);
    
    if (!user)
      return res.status(401).json(info);

    req.login(user, (err) => {
      if(err) return next(err);
      
      return res.json(req.user);
    })

  })(req, res, next);
})

app.get('/api/sessions/current', (req, res) => {
  if(req.isAuthenticated()) {
    if(req.user.admin === 1){
      req.user.amministratore = true;
    }
    res.status(200).json(req.user);
  }else
    res.status(401).json({error: 'Unauthenticated user!'});;
});

app.delete('/api/sessions/current', (req, res) => {
  req.logout( ()=> { res.end(); } );
});


// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
