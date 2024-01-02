const express = require('express');
const nutzerModell = require('../modelle/nutzer');
const router = express.Router();
const bcrypt = require('bcrypt'); // Importiert Bcrpyt. Benötigt, um Passwörter zu verschlüsseln.
const jwt = require('jsonwebtoken'); // Importiert jsonwebtoken. Benötigt für die AuthTokens.

const checkAuth = require('../auth/check-auth');

const saltRounds = 15; // Anzahl Runden, in welcher hashing durchgeführt wird.
const tokenKey = process.env.TOKEN_KEY; // String, welcher verwendet wird, um Tokens auf dem Endgerät zu speichern.

//----- POST ROUTEN -----

// Meldet Nutzer an.
router.post('/login',(req,res) => {
  // Finde Nutzer anhand des Nutzernamens.
  nutzerModell.findOne({nutzername: req.body.nutzername})
    .then(nutzer => {

      // Falls kein Nutzer vorhanden
      if(!nutzer){
        return res.status(401).json({message: "Anmeldung fehlgeschlagen."});
      }

      // Vergleicht eingegebenes Passwort mit gespeichertem Passwort.
      bcrypt.compare(req.body.passwort, nutzer.passwort, (err,result) => {

        // Falls Passwort falsch
        if(!result){
          return res.status(401).json({message: "Anmeldung fehlgeschlagen."});
        }

        // Erstellt Token.
        const token = jwt.sign({nutzername: nutzer.nutzername, nutzerID: nutzer._id},tokenKey,{expiresIn: '24h'});
        return res.status(200).json({
          token: token,
          expiresIn: 86400,
          nutzerID: nutzer._id
        });
      })
    })
    .catch(_error => {
      return res.status(401).json({message: "Anmeldung fehlgeschlagen."});
    });
});

// Registriert einen neuen Nutzer.
router.post('/signup', (req,res) => {

  // Verschlüsselt Passwort.
  bcrypt.hash(req.body.passwort, saltRounds, (err, hash) => {
    const nutzer = new nutzerModell({
      nutzername: req.body.nutzername,
      passwort: hash
    });

    // Speichert den Nutzer.
    nutzer.save()
      .then(result => {
        res.status(201).json({
          message: "Nutzer erstellt.",
          result: result
        });
      })
      .catch(error => {
        res.status(500).json({
          message: "Erstellen des Nutzers nicht möglich.",
          error: error
        });
      })
  });
});

//----- PATCH ROUTEN -----

// Führt Änderungen an einem Nutzer durch.
router.patch('/:id',checkAuth,(req, res) => {

  // Verschlüsselt neues Passwort.
  bcrypt.hash(req.body.passwort, saltRounds, (err, hash) => {
    nutzerModell.findByIdAndUpdate(req.params.id, {passwort: hash})
      .then((result) => {
        if (result) {
          res.status(200).json({
            message: "[Info] Änderungen gespeichert."
          })
        } else {
          res.status(404).json({message: "Nutzer nicht gefunden."});
        }
      })
      .catch(() => {
        res.status(500).json({message: "Änderungen konnten nicht gespeichert werden."});
      });
  })
})

//----- DELETE ROUTEN -----

// Löscht einen Nutzer.
router.delete('/', checkAuth, (req, res) => {
  const nutzerID = req.userData.nutzerID;

  // Findet einen Nutzer anhand der ID und löscht diesen.
  nutzerModell.findByIdAndDelete(nutzerID)
    .then((result) => {
      if(result){
        res.status(200).json({message: "[Info] Nutzer gelöscht."});
      } else {
        res.status(404).json({message: "Nutzer nicht gefunden."});
      }
    })
    .catch(() => {
      res.status(500).json({message: "Nutzer konnte nicht gelöscht werden."});
    });
});

module.exports = router;
