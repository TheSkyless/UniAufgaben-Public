// Importe
const express = require('express'); // Importiert ExpressJS.
const aufgabenModell = require('../modelle/aufgabe');
const router = express.Router(); // Initialisiert einen ExpressJS Router.

const checkAuth = require('../auth/check-auth');

//----- GET ROUTEN -----

// Ruft alle Kurse von einem Nutzer ab.
router.get('/', checkAuth,(req, res) => {
  const kursID = req.query.kursID;
  const dashboard = req.query.dashboard;
  const nutzerID = req.userData.nutzerID;

  // Falls nur Aufgaben von einem Kurs abgerufen werden sollten:
  if(kursID) {
    aufgabenModell.find({kurs: kursID, nutzer: nutzerID})
      .then((aufgaben) => {
        res.status(200).json({
          message: "[Info] Aufgaben abgerufen.",
          aufgaben: aufgaben
        });
      })
      .catch(function () {
        res.status(500).json({
          message: "Abrufen der Aufgaben fehlgeschlagen."
        });
      });
  }
  // Falls nur die 5 dringendsten Aufgaben von einem Nutzer abgerufen werden sollten.
  else if (dashboard) {
    aufgabenModell.find({nutzer: nutzerID, status: 0})
      .limit(5)
      .sort({faelligkeitsdatum: "ascending"})
      .then( (aufgaben) => {
        res.status(200).json({
          message: "[Info] Aufgaben abgerufen.",
          aufgaben: aufgaben
        });
      })
      .catch(function () {
        res.status(500).json({
          message: "Abrufen der Aufgaben fehlgeschlagen."
        });
      });
  }
  // Ruft alle Aufgaben von einem Nutzer ab.
  else {
    aufgabenModell.find({nutzer: nutzerID})
      .then( (aufgaben) => {
        res.status(200).json({
          message: "[Info] Aufgaben abgerufen.",
          aufgaben: aufgaben
        });
      })
      .catch(function () {
        res.status(500).json({
          message: "Abrufen der Aufgaben fehlgeschlagen."
        });
      });
  }
});

// Ruft ab, wie viele offene Aufgaben vorhanden sind.
router.get('/stats',checkAuth,(req, res) => {
  const nutzerID = req.userData.nutzerID;

  let curDate = new Date();
  let dateLimit = new Date();
  dateLimit.setDate(dateLimit.getDate() + 14);

  let count = 0;
  let count14 = 0;

  aufgabenModell.count({nutzer: nutzerID, status: 0, faelligkeitsdatum: { $gte: curDate, $lte: dateLimit }})
    .then((result) => {
      count14 = result;
    })
    .then(() => {
      return aufgabenModell.count({nutzer: nutzerID, status: 0})
    })
    .then((result) => {
      count = result;

      res.status(200).json({
        message: "[Info] Informationen abgerufen.",
        count: count,
        count14: count14
      })
    })
    .catch(() => {
      res.status(500).json({
        message: "Informationen konnten nicht abgerufen werden."
      })
    })
});

// Ruft eine Aufgabe ab.
router.get('/:id', checkAuth, (req, res) => {
  const nutzerID = req.userData.nutzerID;

  aufgabenModell.findOne({_id: req.params.id, nutzer: nutzerID})
    .then(function (result) {
      if(result){
        res.status(200).json(result);
      } else {
        res.status(404).json({
          message: "Aufgabe nicht gefunden."
        });
      }
    })
    .catch(() => {
      res.status(500).json({
        message: "Abrufen der Aufgabe fehlgeschlagen."
      });
    });
});

//----- POST ROUTEN -----

// Erstellt eine neue Aufgabe.
router.post('/', checkAuth, (req, res) => {
  const nutzerID = req.userData.nutzerID;

  const aufgabe = new aufgabenModell({
    seriennummer: req.body.seriennummer,
    faelligkeitsdatum: req.body.faelligkeitsdatum,
    status: req.body.status,
    kommentar: req.body.kommentar,
    nutzer: nutzerID,
    kurs: req.body.kurs
  });

  // Speichert Aufgabe in Datenbank ab.
  aufgabe.save()
    .then((result) => {
      res.status(201).json({
        message: "[Info] Aufgabe erfolgreich gespeichert.",
        aufgabenID: result._id
      });
    })
    .catch(() => {
      res.status(500).json({
        message: "Aufgabe konnte nicht gespeichert werden."
      });
    })
});

//----- PATCH ROUTEN -----

// Bearbeitet eine Aufgabe anhand der ID.
router.patch('/:id', checkAuth,(req, res) => {
  const body = req.body;

  // Findet die Aufgabe anhand der ID und führt Änderungen durch.
  aufgabenModell.findByIdAndUpdate(req.params.id, body)
    .then((result) => {
      if(result){
        res.status(200).json({
          message: "[Info] Aufgabe erfolgreich bearbeitet."
        });
      } else {
        res.status(404).json({
          message: "Aufgabe nicht gefunden."
        });
      }
    })
    .catch(() => {
      res.status(500).json({
        message: "Aufgabe konnte nicht bearbeitet werden."
      });
    });
});

//----- DELETE ROUTEN -----

// Löscht eine Aufgabe.
router.delete('/:id', checkAuth, function (req, res) {

  // Löscht Aufgabe anhand der ID.
  aufgabenModell.findByIdAndDelete(req.params.id)
    .then((result) => {
      if(result){
        res.status(200).json({
          message: "[Info] Aufgabe entfernt."
        });
      } else {
        res.status(404).json({
          message: "Aufgabe nicht gefunden."
        });
      }
    })
    .catch(function () {
      res.status(500).json({
        message: "Aufgabe konnte nicht entfernt werden."
      });
    });
})

// Löscht alle Aufgaben von einem Kurs oder einem Nutzer.
router.delete('/', checkAuth,(req, res) => {
  const kursID = req.query.kursID;
  const nutzerID = req.userData.nutzerID;

  const filter = kursID ? {kurs: kursID, nutzer: nutzerID} : {nutzer: nutzerID};

  // Löscht die Aufgaben gemäss Filter.
  aufgabenModell.deleteMany(filter)
    .then(() => {
      const nachricht = "[Info] Aufgaben des Kurses gelöscht."
      res.status(200).json({
        message: nachricht
      });
    })
    .catch(() => {
      res.status(500).json({
        message: "Aufgaben des Kurses konnten nicht gelöscht werden."
      });
    });
});

module.exports = router;
