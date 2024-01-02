const mongoose = require("mongoose"); // Mongoose für MongoDB importieren.

// Definiert das Schema für Aufgaben in der Datenbank.
const aufgabenSchema = mongoose.Schema({

  // Nummer der Serie.
  seriennummer: {type: Number, required: true},

  // Zeitpunkt, an welchem die Aufgabe abgegeben worden sein muss.
  faelligkeitsdatum: {type: Date, required: true},

  // Aktueller Status der Serie.
  status: {type: Number, required: true},

  // Optionaler Kommentar vom Nutzer für die Aufgabe.
  kommentar: {type: String},

  // Zugehöriger Nutzer.
  nutzer: {type: String, required: true},

  // Zugehöriger Kurs.
  kurs: {type: String, required: true}
});

module.exports = mongoose.model('aufgabe', aufgabenSchema);
