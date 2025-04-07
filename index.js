const express = require("express");
const mongoose = require("mongoose")
const dotenv = require("dotenv").config();
const userRoutes = require("./routes/user.routes.js")
const authRoutes = require("./routes/auth.routes.js")
const challengeRoutes = require("./routes/challenge.routes.js")
const analisisRoutes = require("./routes/analitics.routes.js")
const questionsRoutes = require("./routes/questions.routes.js")
const companyRoutes = require("./routes/company.routes.js")


const cors = require('cors');
const path = require('path');
const app = express()
app.use(express.json())

app.use(cors({
  origin: '*'
}));


mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("DB CONNECTED SUCCESFULLY"))
    .catch((err) => {
        console.error(err);
    })


// Serve panel and view files
app.use('/public', express.static('public'));
app.use('/panel', express.static(path.join(__dirname, 'panel')));
app.use('/panelmartha', express.static(path.join(__dirname, 'panelmartha')));
app.use(express.static(path.join(__dirname, 'view')));

//ROUTES
app.use("/api/auth", authRoutes)
app.use("/api/user", userRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/analisis", analisisRoutes);
app.use("/api/questions", questionsRoutes);
app.use("/api/company", companyRoutes);

// Serve panel and view routes
app.get('/panel/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'panel/index.html'));
  });
  
  app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'view/index.html'));
  });

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log("Server is running on port: " + PORT)
})
