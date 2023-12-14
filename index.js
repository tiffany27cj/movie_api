const express = require("express"),
  morgan = require('morgan'),
  fs = require('fs'), // import built in node modules fs and path 
  path = require('path'),
  bodyParser = require('body-parser'),
  uuid = require('uuid');

app.use(bodyParser.json());

const app = express();

let users = [
  {
    name: 'John Douglas',
    id: 1,
    favorites: []
  },
  {
    name: 'Sarah Connors',
    id:2,
    favorites: []
  },
  {
    name: 'Julie Beck',
    id: 3,
    favorites: []
  },
  {
    name: 'Chris Brems',
    id: 4,
    favorites: []
  },
  {
    name: 'Alex DeLong',
    id: 5,
    favorites:[]
  }
],


let movies = [
  {
    title: 'Top Gun',
    year: '1986',
    director: 'EEEE',
    genre: 'romantic'
  },
  {
    title: 'The Godfather',
    year: '1972',
    director: 'AAAA',
    genre: 'action'
  },
  {
    title: 'Casablanca',
    year: '1942',
    director: 'SSSS',
    genre: 'romantic'
  },
  {
    title: 'Gone with the wind',
    year: '1939',
    director: 'DDDDD',
    genre: 'romantic'
  },
  {
    title: 'Citizen Kane',
    year: '1941',
    director: 'KKKKK',
    genre: 'action'
  },
  {
    title: 'Schilndler\'s List',
    year: '1993',
    director: 'JJJJJ',
    genre: 'action'
  },
  {
    title: 'Vertigo',
    year: '1958',
    director:'HHHH',
    genre: 'action'
  },
  {
    title: 'Forrest Gump',
    year: '1994',
    director: 'ZZZZ',
    genre: 'romantic'
  },
  {
    title: 'The Sound of Music',
    year: '1965',
    director: 'YYYY',
    genre: 'musical'
  },
  {
    title: 'West Side Story',
    year: '1961',
    director:'XXXX',
    genre: 'romantic'
  }
];

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

app.get('/movies', (req, res) => {
  res.json(movies);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});

//get or read the list of all the movies
app.get('/movies', (req, res) => {
  res.status(200).json(movies);
});

//get or read the information about a specific movie by title
app.get('/movies/:title', (req, res) => {
  const { title } = req.params;
  const movies = movies.find( movie => movie.Title === title );

  if(movie){
    res.status(200).json(movie);
  } else {
    res.status(400).send('No such movie');
  }
  });

//get or read information about a specific movie genre
app.get('/movies/:genre/:genreName', (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find( movie => movie.genre.Name === genreName ).Genre;

  if(genre){
    res.status(200).json(genre);
  } else {
    res.status(400).send('No such genre');
  }
  });

//get or read information about a specific movie director
app.get('/movies/directors/:directorName', (req, res) => 
const { directorName } = req.params;
const director = movies.find( movie => movie.Director.Name === directorName ).Director;

if(director){
  res.status(200).json(director);
} else {
  res.status(400).send('No such director');
}
});

//create or post new user
app.post('/users', (req, res) => {
  const newUser = req.body;

  if (newUser.name){
    newUser.id = uuid.v4;
    users.push(newUser);
    res.status(201).json(newUser)
  } else {
    res.status(400).send('No such user');
  }
});

//update or put a user name
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find(user => user.id == id);

  if (user){
    user.name=updatedUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send('No such user');
  }
  });


  //create or POST user's favorite movies
app.post('/users/id:/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;
  let user = users.find(user => user.id == id);

  if (user){
    user.favoriteMovies.push(movieTitle);
    res.status(200).send('${movieName} has been added to user ${id}\'s list of favorite movies');
  } else {
    res.status(400).send('No such user');
  }
  });

//delete movie from user's favorite movies
app.delete('/users/id:/movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;
  let user = users.find(user => user.id == id);

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter(title => title !== movieTitle);
    res.status(200).send('${movieTitle} has been removed from user ${id}\'s list of favorite movies');
  } else {
    res.status(400).send('No such user');
  }
  });

//delete users  
app.delete('/users', (req, res) => {
  const { id } = req.params;
  let user = users.find(user => user.id == id);

  if (user) {
    users = users.filter(user => user.id != id);
    res.status(200).send('User ${id} has been deleted');
  } else {
    res.status(400).send('No such user');
  }
});