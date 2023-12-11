const express = require("express"), 
morgan = require('morgan');
const app = express();

app.use(morgan('common'));

app.use(express.static('public/documentation.html'));


app.get('/', (req, res) => {
  res.send('Welcome to my app!');
});


let myLogger = (req, res, next) => {
  console.log(req.url);
  next();
};

app.get('/', (req, res) => {
  res.send('Welcome to my app!');
});

app.get('/secreturl', (req, res) => {
  res.send('This is a secret url with super top-secret content.');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});


const http = require('http');

http.createServer((request, response) => {
  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.end('Welcome to my book club!\n');
}).listen(8080);

console.log('My first Node test server is running on Port 8080.');