const jwt = require('jsonwebtoken');

const tokenKey = process.env.TOKEN_KEY;

// Überprüft gespeicherte Anmeldedaten.
module.exports = (req,res,next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, tokenKey);
    req.userData = {nutzername: decodedToken.nutzername, nutzerID: decodedToken.nutzerID};
    next();
  } catch(error) {
    res.status(401).json({message: "Authentifikation fehlgeschlagen."});
  }
};
