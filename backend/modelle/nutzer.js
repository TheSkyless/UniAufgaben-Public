const mongoose = require('mongoose'); // Importiert Mongoose für MongoDB.
const uniqueValidator = require('mongoose-unique-validator'); // Importiert Plugin für Mongoose.

// Definiert das Schema für Nutzer in der Datenbank.
const nutzerSchema = mongoose.Schema({
  // Nutzername, gewählt vom Nutzer. Muss einmalig sein.
  nutzername: {type: String, required: true, unique: true},

  // Passwort, gewählt vom Nutzer. Gespeichert als Hash.
  passwort: {type: String, required: true}
});

// Nutzt mongoose-unique-validator, damit jeder Nutzername nur einmal in der Datenbank vorkommen kann.
nutzerSchema.plugin(uniqueValidator);

module.exports = mongoose.model("nutzer", nutzerSchema);
