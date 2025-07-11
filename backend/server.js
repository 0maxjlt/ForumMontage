const express = require("express");
const cors = require("cors");
const { video } = require("framer-motion/client");

const app = express();
const PORT = 3001;

const users = [
  { 
    email: "max@example.com", 
    password: "test", 
    status: "admin", 
    videos: [
      { 
        id: "vid001",
        username: "maxlezinzin",
        title: "Test de la dernière caméra Sony A7",
        description: "Montage d'une vidéo de review tech avec b-roll et voice-over.",
        script: "Intro → Unboxing → Test terrain → Conclusion",
        date: "2025-05-01",
        status: "En cours",
        tags: ["Tech", "B-roll", "Review"],
        estimatedVideoDuration: "00:10:00",
        estimatedRushesDuration: "00:30:00",
        price: [100, 140]
      }, 
      { 
        id: "vid002",
        username: "maxlezinzin",
        title: "Compilation de fails Minecraft",
        description: "Montage dynamique et humoristique avec sound design cartoon.",
        script: "Best-of extrait de streams",
        date: "2025-05-03",
        status: "À faire",
        tags: ["Gaming", "Humour", "Best-of"],
        estimatedVideoDuration: "00:12:00",
        estimatedRushesDuration: "00:50:00",
        price: [80, 100]
      },
      { 
        id: "vid003",
        username: "maxlezinzin",
        title: "Intro animée pour chaîne YouTube",
        description: "Création d'une intro motion design de 5 à 10 secondes.",
        script: "Logo + animation + son",
        date: "2025-04-25",
        status: "Terminé",
        tags: ["Motion Design", "Intro", "Animation"],
        estimatedVideoDuration: "00:00:10",
        estimatedRushesDuration: "00:00:30",
        price: [40, 60]
      },
      { 
        id: "vid004",
        username: "maxlezinzin",
        title: "Présentation de l’application mobile ZenApp et plein d'autres trucs cools",
        description: "Vidéo explicative avec sous-titres et animations UI.",
        script: "Fonctionnalités → Avantages → Call-to-action",
        date: "2025-05-05",
        status: "En cours",
        tags: ["App", "UI", "Explainer"],
        estimatedVideoDuration: "00:03:00",
        estimatedRushesDuration: "00:15:00",
        price: [90, 120]
      },
      { 
        id: "vid005",
        username: "maxlezinzin",
        title: "Vlog - Une journée à Tokyo",
        description: "Montage immersif avec musique et sound design.",
        script: "Matin → Déjeuner → Shopping → Soirée",
        date: "2025-05-06",
        status: "Prêt à publier",
        tags: ["Vlog", "Voyage", "Musique"],
        estimatedVideoDuration: "00:08:00",
        estimatedRushesDuration: "00:40:00",
        price: [100, 130]
      }
    ]
  },
  { 
    email: "lisa@youtubemail.com", 
    password: "hashed_password2", 
    status: "user", 
    videos: [
      { 
        id: "vid006",
        username: "lisavlog",
        title: "Recette rapide : Pancakes à la banane",
        description: "Montage d’une courte vidéo food en format vertical.",
        script: "Ingrédients → Préparation → Dégustation",
        date: "2025-04-29",
        status: "À valider",
        tags: ["Cuisine", "Shorts", "Vertical"],
        estimatedVideoDuration: "00:01:00",
        estimatedRushesDuration: "00:10:00",
        price: [30, 50]
      }
    ]
  },
  {
    email: "hugo@studio.com", 
    password: "hashed_password3", 
    status: "adminboss", 
    videos: [
      { 
        id: "vid007",
        username: "hugoreact",
        title: "Formation React pour débutants",
        description: "Montage d'une série de tutoriels pédagogiques en plusieurs parties.",
        script: "Intro → JSX → Props → State → Conclusion",
        date: "2025-05-02",
        status: "Montage terminé",
        tags: ["Code", "React", "Formation"],
        estimatedVideoDuration: "00:20:00",
        estimatedRushesDuration: "01:00:00",
        price: [150, 200]
      }
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

app.post("/forum", (req, res) => {
    console.log("Connecté à la route Forum, envoie des données");
    let videoList = [];
    for (i = 0; i < users.length; i++) {
        users[i].videos.map((video) => {videoList.push(video)});
    
    }
    console.log("Liste des vidéos :", videoList);
    if (videoList) {
        res.json({ success: true, data : videoList });
    } else {
        res.json({ success: false, message : "Aucune vidéo trouvée" });
    }
    
});


// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
