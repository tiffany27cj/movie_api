const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 8080;

http.createServer((request, response) => {
  let addr = request.url,
    q = new URL(addr, `http://localhost:${port}`),
    filePath = '';

  // Logging to log.txt
  fs.appendFile('log.txt', `URL: ${addr}\nTimestamp: ${new Date()}\n\n`, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Added to log.');
    }
  });

  // Handling routes
  if (q.pathname.includes('documentation')) {
    filePath = path.join(__dirname, 'documentation.html');
  } else {
    filePath = path.join(__dirname, 'index.html');
  }

  // Reading and serving HTML file
  fs.readFile(filePath, (err, data) => {
    if (err) {
      response.writeHead(404, { 'Content-Type': 'text/plain' });
      response.end('File not found');
      return;
    }

    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.write(data);
    response.end();
  });
}).listen(port);

console.log(`Server is running on Port ${port}.`);