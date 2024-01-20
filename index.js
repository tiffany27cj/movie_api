const express = require("express"),
  morgan = require('morgan'),
  fs = require('fs'), // import built in node modules fs and path 
  path = require('path'),
  bodyParser = require('body-parser'),
  uuid = require('uuid');
  const {check, validationResult} = require('express-validator');
const app = express();

const mongoose = require('mongoose');
const Models = require('./models.js');

app.use(bodyParser.json());

//import auth.js
let auth = require('./auth')(app);

//import passport and passport.js 
const passport = require('passport');
require('./passport');

const Movies = Models.Movie;
const Users = Models.User;
mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });

// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' })

// setup the logger
app.use(morgan('combined', { stream: accessLogStream }));

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('Welcome to my app!');
});

app.get('/secreturl', (req, res) => {
  res.send('This is a secret URL with super top-secret content.');
});

//get or read the list of all the movies
app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movies.find()
      .then((movies) => {
          res.status(201).json(movies);
      })
      .catch((err) => {
          console.error(err);
          res.status(500).send('Error: ' + err);
      });
});


//get or read the information about a specific movie by title
app.get('/movies/:title', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movies.findOne({ Title: req.params.title })
      .then((movie) => {
          res.json(movie);
      })
      .catch((err) => {
          console.error(err);
          res.status(500).send('Error: ' + err);
      });
});


//get or read information about a specific movie genre
app.get('/movies/genres/:genreName', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movies.findOne({ 'Genre.Name': req.params.genreName })
  .then((movie) => {
      res.json(movie.Genre);
  })
  .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
  });
});

//get or read information about a specific movie director
app.get('/movies/directors/:directorName', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movies.findOne({ 'Director.Name': req.params.directorName })
      .then((movie) => {
          res.json(movie.Director);
      })
      .catch((err) => {
          console.error(err);
          res.status(500).send('Error: ' + err);
      });
});

//create or post new user
// CREATE new user
/* expect JSON in this format
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}*/
app.post('/users', 
    [
        check('lastName', 'LastName is required').isLength({min: 5}),
        check('lastName', 'LastName contains non alphanumeric characters - not allowed.').isAlphanumeric(),
        check('Password', 'Password is required').not().isEmpty(),
        check('Email', 'Email does not appear to be valid').isEmail()
    ], async (req, res) => {

    // check the validation object for errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    // let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({ Email: req.body.Email}) // Search to see if a user with the requested email already exists
        .then((user) => {
            if (user) {
                return res.status(400).send(req.body.Email + 'already exists');
            } else {
                Users
                    .create({
                        firstName: req.body.firstName, 
                        lastName: req.body.lastName,
                        Password: req.body.Password,
                        Email: req.body.Email,
                        Birthday: req.body.Birthday
                    })
                    .then((user) => { res.status(201).json(user) })
                .catch((error) => {
                    console.error(error);
                    res.status(500).send('Error: ' + error);
                })
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        });
})

// get or read all users
app.get('/users', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Users.find()
      .then((users) => {
          res.status(201).json(users);
      })
      .catch((err) => {
          console.error(err);
          res.status(500).send('Error: ' + err);
      });
});

// update or put user information by email
/* expect JSON in this format
{
  FirstName: String, (required)
  LastName: String, (required)
  Email: String, (required)
  Password: String, (required)
  Birthday: Date
  CreatedAt: Date
  UpdatedAt: Date
}*/
app.put('/users/:Email', passport.authenticate('jwt', { session: false }),
    [
        check('Email', 'Email is required').isLength({min: 5}),
        check('Password', 'Password is required'), //.not().isEmpty()
        check('Email', 'Email does not appear to be valid').isEmail()
    ], async (req, res) => {
          if(req.user.Email !== req.params.Email){
          return res.status(400).send('Permission denied');
    }
  
    // check the validation object for errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    // gives you data already in the database
    let oldData = Users.findOne({ Email: req.params.Email }); 

    let hashedPassword = req.body.Password? Users.hashPassword(req.body.Password) : Users.findOne({ Email: req.params.Email }).Password;
    await Users.findOneAndUpdate({ Email: req.params.Email }, { $set:
        {
            // if there is new data, update the database with new data, else use old data
            FirstName: req.body.FirstName,
            LastName: req.body.LastName || oldData.LastName,
            Password: hashedPassword, // see hashed variable above
            Email: req.body.Email || oldData.Email,
            Birthday: req.body.Birthday || oldData.Birthday,
            CreatedAt: req.body.CreatedAt || oldData.CreatedAt,
            UpdatedAt: req.body.UpdatedAt || oldData.UpdatedAt
        }
    },
    { new: true }) // we make sure that the updated document is returned
    .then((updatedUser) => {
        res.json(updatedUser);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    })
});

// add a movie to a user's list of favorites
app.post('/users/:Email/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
  // Condition to check user authorization
  if(req.user.Email !== req.params.Email){
      return res.status(400).send('Permission denied');
  }
  // Condition ends here
  await Users.findOneAndUpdate({ Email: req.params.Email }, {
      $push: { FavoriteMovies: req.params.MovieID }
  },
  { new: true }) // we make sure that the updated document is returned
  .then((updatedUser) => {
      res.json(updatedUser);
  })
  .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
  });
});

//delete movie from user's favorite movies
app.delete('/users/:Email/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
  // Condition to check user authorization
  if(req.user.Email !== req.params.Email){
      return res.status(400).send('Permission denied');
  }
  // Condition ends here
  await Users.findOneAndUpdate({ Email: req.params.Email }, {
      $pull: { FavoriteMovies: req.params.MovieID }
  },
  { new: true }) // we make sure that the updated document is returned
  .then((updatedUser) => {
      res.json(updatedUser);
  })
  .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
  });
});

//delete users  
app.delete('/users/:Email', passport.authenticate('jwt', { session: false }), async (req, res) => {
  // Condition to check user authorization
  if(req.user.Email !== req.params.Email){
      return res.status(400).send('Permission denied');
  }
  // Condition ends here
  await Users.findOneAndDelete({ Email: req.params.Email })
      .then((user) => {
          if (!user) {
              res.status(400).send(req.params.Email + ' was not found');
          } else {
              res.status(200).send(req.params.Email + ' was deleted.');
          }
      })
      .catch((err) => {
          console.error(err);
          res.status.apply(500).send('Error: ' + err);
      });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});

