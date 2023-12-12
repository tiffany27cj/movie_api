const express = require("express");
const morgan = require('morgan');
const fs = require('fs'); // import built in node modules fs and path 
const path = require('path');

const app = express();

let favoriteMovies = [
  {
    title: 'Top Gun',
    year: '1986'
  },
  {
    title: 'The Godfather',
    year: '1972'
  },
  {
    title: 'Casablanca',
    year: '1942'
  },
  {
    title: 'Gone with the wind',
    year: '1939'
  },
  {
    title: 'Citizen Kane',
    year: '1941'
  },
  {
    title: 'Schilndler\'s List',
    year: '1993'
  },
  {
    title: 'Vertigo',
    year: '1958'
  },
  {
    title: 'Forrest Gump',
    year: '1994'
  },
  {
    title: 'The Sound of Music',
    year: '1965'
  },
  {
    title: 'West Side Story',
    year: '1961'
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
  res.json(favoriteMovies);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});