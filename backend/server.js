const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3001;

const users = [
  { 
      email: "test", 
      password: "test", 
      status: "admin", 
      videos: [
          { id: "id1", title: "Titre1LONONGGGGGGGG", description: "Description1", script: "Script1", date: "Date1", status: "Status1", tags: ["tag1", "tag2"] }, 
          { id: "id3", title: "Titre3ENCORELOOOOONGGGGGGGGGGG", description: "Description3", script: "Script3", date: "Date3", status: "Status3", tags: ["tag5", "tag6"] },
          { id: "id4", title: "Titre4", description: "DESCRIPTIONNNNNNNNNNNNN", script: "Script4", date: "Date4", status: "Status4", tags: ["tag7", "tag8"] },
          { id: "id5", title: "Titre5", description: "Description5", script: "Script5", date: "Date5", status: "Status5", tags: ["tag9", "tag10"] },
          { id: "id6", title: "Titre6", description: "Description6", script: "Script6", date: "Date6", status: "Status6", tags: ["tag11", "tag12"] }
      
      ]
  },
  { 
      email: "test2", 
      password: "test2", 
      status: "user", 
      videos: [
          { id: "id2", title: "Titre2", description: "Description2", script: "Script2", date: "Date2", status: "Status2", tags: ["tag3", "tag4"] }
      ]
  }
];


// Middleware pour gérer JSON et CORS
app.use(express.json());
app.use(cors());

// Route pour gérer la connexion
app.post("/login", (req, res) => {
  
    console.log("Données reçues :", req.body.email, req.body.password);

    // Vérification des identifiants
    const user = users.find(u => u.email === req.body.email && u.password === req.body.password);
    console.log("Utilisateur trouvé :", user);

    if (user) {
        res.json({ success: true, data : user });
    } else {
        res.json({ success: false, message : "Email ou mot de passe incorrect" });
    }
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
