// Importe
const http = require('http'); // Http importieren.
const app = require('./backend/app.js'); // Backend modul importieren.

const port = 3000; // Definiert Port für Backend.
app.set('port', port); // Setze Port für Backend.

const server = http.createServer(app); // Initialisiere Http Server.
server.listen(port); // Höre zu beim gesetzten Port.

