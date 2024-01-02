require('dotenv').config();
const express = require('express'); // Importiere ExpressJS für NodeJS.
const mongoose = require('mongoose'); // Importiere mongoose für MongoDB für Datenbank-Anfragen.
const bodyparser = require('body-parser'); // Importiere body-parser für JSON.

const kursRouten = require('./routen/kurs'); // Importiere API-Routen für Kurse.
const aufgabenRouten = require('./routen/aufgabe'); // Importiere API-Routen für Aufgaben.
const nutzerRouten = require('./routen/nutzer'); // Importiere API-Routen für Nutzer.

const app = express(); // Verwende ExpressJS.

// Definiert URL, mit welcher zur MongoDB Datenbank verbunden wird.
const dbURL = "mongodb+srv://"+process.env.DB_AUTH_USERNAME+":"+process.env.DB_AUTH_PASS+"@"+process.env.DB_AUTH_HOST+'/'+process.env.DB_AUTH_COLLECTION+'?';

// Datenbank Verbindung aufbauen.
mongoose.connect(dbURL)
  .then(function () {
    console.log("[Info] Verbindung zur Datenbank hergestellt.");
  })
  .catch(function () {
    console.log("[Fehler] Verbindung zur Datenbank fehlgeschlagen.");
  });

app.use(bodyparser.json());

// Access-Control einstellen.
app.use((req,res,next) => {
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  next();
});

// Routen für Anfragen importieren.
const apiString = "/api/v1"
app.use((apiString + "/kurse"), kursRouten);
app.use((apiString + "/aufgaben"), aufgabenRouten);
app.use((apiString + "/nutzer"), nutzerRouten);

module.exports = app;

