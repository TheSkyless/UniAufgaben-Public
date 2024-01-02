const mongoose = require("mongoose"); // Importiert Mongoose für MongoDB.

// Definiert das Schema für Kurse in der Datenbank.
const kursSchema = mongoose.Schema({
  // Name vom Kurs.
  name: {type: String, required: true},

  // Semester, in welchem der Kurs stattfindet.
  semester: {type: Number, required: true},

  // Fach, welchem der Kurs zugehört.
  fach: {type: String, required: true},

  // Bestimmt, ob der Kurs bewertet wird, oder nicht.
  // Falls TRUE wird ein Fortschrittsbalken angezeigt.
  bewertet: {type: Boolean, required: true},

  // Gesamte Anzahl an Serien für den Kurs.
  serien_insgesamt: {type: Number},

  // Anzahl Serien, welche bestanden werden müssen.
  serien_benoetigt: {type: Number},

  // Anzahl Serien, welche aktuell bestanden sind.
  serien_bestanden: {type: Number},

  // Anzahl Serien, welche aktuell nicht bestanden sind.
  serien_nicht_bestanden: {type: Number},

  // Zugehöriger Nutzer.
  nutzer: {type: String, required: true}
});

module.exports = mongoose.model('kurs', kursSchema);
