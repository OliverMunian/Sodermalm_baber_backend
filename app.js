require('dotenv').config();
require("./models/connection");
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const nodemailer = require('nodemailer')

var port = process.env.PORT


var usersRouter = require('./routes/users');
var bookingRouter = require("./routes/bookings")
var app = express();

const cors = require('cors');
app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/assets', express.static(path.join(__dirname, 'public/uploads')));

app.use('/users', usersRouter);
app.use('/bookings', bookingRouter)


let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Utiliser SSL pour sécuriser la connexion
  auth: {
    user: 'omalahel@gmail.com', 
    pass: process.env.PASSWORD_ECNA, // Utilisation de la variable d'environnement pour le mot de passe
  },
});


function sendEmail(mailOptions, callback) {
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return callback(error, null); // Retourner une erreur si l'envoi échoue
    }
    callback(null, info); // Retourner les informations sur l'e-mail envoyé
  });
}

app.post('/send-email', async (req, res) => {
  try {
    // const { to, subject, text, fileName, content } = req.body;

    // if (!to || !subject || !fileName || !content) {
    //   return res.status(400).send('Paramètres manquants dans la requête');
    // }

    // Configuration des options de l'email
    let mailOptions = {
      from: 'omalahel@gmail.com', // Adresse de l'expéditeur
      to: req.body.to,             // Adresse du destinataire
      subject: req.body.subject,           // Sujet de l'e-mail
      text: req.body.text,                 // Corps du mail
    };

    // Envoi de l'email
    sendEmail(mailOptions, (error, info) => {
      if (error) {
        console.error('Erreur lors de l\'envoi de l\'email : ', error);
        return res.status(500).send('Erreur lors de l\'envoi de l\'email');
      }
      console.log('Email envoyé: ' + info.response);
      res.json({result: true, message:'Email send with success !'});
    });
    
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email : ', error);
    res.status(500).send('Erreur interne du serveur');
  }
});

app.get("/", (req, res) => {
  res.send("Backend is running");
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


module.exports = app;
