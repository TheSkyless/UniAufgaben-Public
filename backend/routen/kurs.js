// Importe
const express = require('express'); // Importiert ExpressJS.
const kursModell = require('../modelle/kurs'); // Importiert das Kursmodell für die Datenbank.
const aufgabenModell = require('../modelle/aufgabe');
const router = express.Router(); // Initialisiert einen ExpressJS Router.

const checkAuth = require('../auth/check-auth');

//----- GET ROUTEN -----

// Ruft alle Kurse ab von einem Nutzer.
router.get('/', checkAuth,(req, res) => {
  const nutzerID = req.userData.nutzerID;

  // Sucht alle Kurse eines Nutzers in der Datenbank.
  kursModell.find({nutzer: nutzerID})
    .then(function (kurse) {
      res.status(200).json({
       message: "[Info] Kurse abgerufen.",
       kurse: kurse
      });
    })
    .catch(function () {
      res.status(500).json({
        message: "Abrufen der Kurse fehlgeschlagen."
      });
    });
});

// Ruft einen Kurs ab.
router.get('/:id', checkAuth, (req, res) => {
  const nutzerID = req.userData.nutzerID;

  // Sucht den Kurs anhand der ID.
  kursModell.findOne({_id: req.params.id, nutzer: nutzerID})
    .then((result) => {
      if(result){
        res.status(200).json(result);
      } else {
        res.status(404).json({
          message: "Kurs nicht gefunden."
        });
      }
    })
    .catch(function () {
      res.status(500).json({
        message: "Abrufen des Kurses fehlgeschlagen."
      });
    });
});

//----- POST ROUTEN -----

// Erstellt einen neuen Kurs.
router.post('/', checkAuth, function (req, res) {
  const nutzerID = req.userData.nutzerID;

  const kurs = new kursModell({
    name: req.body.name,
    semester: req.body.semester,
    fach: req.body.fach,
    bewertet: req.body.bewertet,
    serien_insgesamt: req.body.serien_insgesamt,
    serien_benoetigt: req.body.serien_benoetigt,
    serien_bestanden: 0,
    serien_nicht_bestanden: 0,
    nutzer: nutzerID
  });
  kurs.save()
    .then(function (result) {
      res.status(201).json({
        message: "[Info] Kurs erfolgreich gespeichert.",
        kursID: result._id
      });
    })
    .catch(function (error) {
      res.status(500).json({
        message: "Kurs konnte nicht gespeichert werden.",
        fehler: error
      });
    })
});

//----- PATCH ROUTEN -----

// Bearbeitet einen Kurs.
router.patch('/:id', checkAuth, async function (req, res) {
  const updateBewertung = req.query.checkBewertung;
  let update = req.body;

  // Falls die Bewertung des Kurses sich geändert hat
  if (updateBewertung) {

    let numBestanden = await aufgabenModell.countDocuments({kurs: req.params.id, status: 3});
    let numNichtBestanden = await aufgabenModell.countDocuments({kurs: req.params.id, status: 2});

    update = {
      serien_bestanden: numBestanden,
      serien_nicht_bestanden: numNichtBestanden
    };
  }

  // Findet den Kurs anhand der ID und speichert die Änderungen.
  kursModell.findByIdAndUpdate(req.params.id, update)
    .then(function (result) {
      if (result) {
        res.status(200).json({
          message: "[Info] Kurs erfolgreich bearbeitet."
        });
      } else {
        res.status(404).json({
          message: "Kurs nicht gefunden."
        });
      }
    })
    .catch(function () {
      res.status(500).json({
        message: "Kurs konnte nicht bearbeitet werden."
      });
    });
});

//----- DELETE ROUTEN -----

// Entfernt einen Kurs aus der Datenbank.
router.delete('/:id', checkAuth, function (req, res) {
  const kursID = req.params.id;
  const nutzerID = req.userData.nutzerID;

  // Löscht Kurs mit der entsprechenden ID.
  kursModell.deleteOne({_id: kursID, nutzer: nutzerID})
    .then(function (result) {
      if(result){
        res.status(200).json({
          message: "[Info] Kurs entfernt."
        });
      } else {
        res.status(404).json({
          message: "Kurs nicht gefunden."
        });
      }
    })
    .catch(function () {
      res.status(500).json({
        message: "Kurs konnte nicht entfernt werden."
      });
    });
})

// Vollständige Löschung der Kurse eines Nutzers.
router.delete('/', checkAuth, function (req, res) {
  const nutzerID = req.userData.nutzerID;

  // Löscht alle Kurse von einem Nutzer.
  kursModell.deleteMany({nutzer: nutzerID})
    .then(function (result) {
      if(result){
        res.status(200).json({
          message: "[Info] Kurs(e) entfernt."
        });
      } else {
        res.status(404).json({
          message: "Kurs(e) nicht gefunden."
        });
      }
    })
    .catch(function () {
      res.status(500).json({
        message: "Kurs(e) konnte(n) nicht entfernt werden."
      });
    });
})

module.exports = router;
