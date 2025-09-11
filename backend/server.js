
import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { video } from "framer-motion/client"; // si tu en as vraiment besoin
import cookieParser from "cookie-parser";
import cors from "cors";


const app = express();
const PORT = 3001;

app.use(express.json()); // pour parser le JSON du body
app.use(cookieParser());

app.use(cors({
  origin: "http://localhost:5173", // ton frontend React
  credentials: true                // autorise l'envoi des cookies
}));




// Connexion à SQLite
const dbPromise = open({
  filename: "./forum.db",
  driver: sqlite3.Database
});

// Création des tables si elles n’existent pas
async function initDb() {
  const db = await dbPromise;

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS video_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      script TEXT,
      date DATE,
      status TEXT CHECK(status IN ('open','in_progress','done')) DEFAULT 'open',
      tags TEXT,
      estimated_video_duration TEXT,
      estimated_rushes_duration TEXT,
      price_min INTEGER,
      price_max INTEGER,
      frequence TEXT,
      creator_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (creator_id) REFERENCES users(id)
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER NOT NULL,
      editor_id INTEGER NOT NULL,
      message TEXT,
      status TEXT CHECK(status IN ('pending','accepted','rejected')) DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (request_id) REFERENCES video_requests(id),
      FOREIGN KEY (editor_id) REFERENCES users(id)
    );
  `);
}
initDb();

// ------------------- ROUTES -------------------



function authMiddleware(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Non autorisé" });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded; // On stocke les infos du user dans req.user
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token invalide ou expiré" });
  }
}




const SECRET = "unSuperSecretUltraSolide"; // à mettre dans ton .env plus tard

// Route pour gérer la connexion
app.post("/api/login", async (req, res) => {
  const db = await dbPromise;
  const { email, password } = req.body;

  try {
    console.log("Requête reçue sur /api/login :", req.body);

    // Chercher l’utilisateur en BDD
    const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);
    if (!user) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    // Vérifier le mot de passe avec bcrypt
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    // Générer un token JWT
    const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: "2h" });

    // Définir le token dans un cookie sécurisé
    res.cookie("token", token, {
      httpOnly: true, // ⚡ Sécurité : inaccessible au JS côté client
      secure: false,  // ⚠️ mettre true si HTTPS (prod)
      sameSite: "lax", // protection CSRF
      maxAge: 2 * 60 * 60 * 1000, // 2h
      path: "/"
    });

    // Réponse au frontend (sans token)
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      }
    });

  } catch (err) {
    console.error("Erreur login:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


// Déconnexion
app.post("/api/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,  // true si HTTPS
    sameSite: "lax",
    path: "/"
  });
  res.json({ success: true });
});



app.post("/api/register", async (req, res) => {
  const db = await dbPromise;
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {

    console.log("Requête reçue sur /api/register :", req.body);

    const result = await db.run(
      "INSERT INTO users (username, email, password) VALUES (?,?,?)",
      [username, email, hashedPassword]
    );
    res.json({ id: result.lastID, username, email });
  } catch (err) {
    res.status(400).json({ error: "Utilisateur déjà existant" });
  }
});

{/*
 id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      script TEXT,
      date DATE,
      status TEXT CHECK(status IN ('open','in_progress','done')) DEFAULT 'open',
      tags TEXT,
      estimated_video_duration TEXT,
      estimated_rushes_duration TEXT,
      price_min INTEGER,
      price_max INTEGER,
      frequence TEXT,
      creator_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (creator_id) REFERENCES users(id)
*/}

// ✅ Création d'une vidéo
// ✅ Création d'une vidéo
app.post("/api/video_requests", authMiddleware, async (req, res) => {
  const db = await dbPromise;
  const {
    title,
    description,
    script,
    date,
    status,
    estimated_video_duration,
    estimated_rushes_duration,
    price_min,
    price_max,
    frequence,
    tags // ➕ ajout des tags
  } = req.body;

  try {
    const result = await db.run(
      `INSERT INTO video_requests
       (title, description, script, date, status,
        estimated_video_duration, estimated_rushes_duration,
        price_min, price_max, frequence, tags, creator_id)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        title,
        description,
        script,
        date,
        status,
        estimated_video_duration,
        estimated_rushes_duration,
        price_min,
        price_max,
        frequence,
        tags ? JSON.stringify(tags) : null, // ⚡ on stocke en JSON string
        req.user.id,
      ]
    );

    const created = await db.get(
      "SELECT * FROM video_requests WHERE id = ?",
      [result.lastID]
    );

    // ⚡ On parse les tags pour le retour API
    if (created.tags) created.tags = JSON.parse(created.tags);

    console.log("Vidéo créée :", created);
    res.json(created);
  } catch (err) {
    console.error("Erreur création vidéo :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ✅ Modification d'une vidéo
app.put("/api/video_requests/:id", authMiddleware, async (req, res) => {
  const db = await dbPromise;
  const {
    title,
    description,
    script,
    date,
    status,
    estimated_video_duration,
    estimated_rushes_duration,
    price_min,
    price_max,
    frequence,
    tags // ➕ ajout des tags
  } = req.body;
  const { id } = req.params;

  try {
    const result = await db.run(
      `UPDATE video_requests
       SET title = ?, description = ?, script = ?, date = ?, status = ?,
           estimated_video_duration = ?, estimated_rushes_duration = ?,
           price_min = ?, price_max = ?, frequence = ?, tags = ?
       WHERE id = ? AND creator_id = ?`,
      [
        title,
        description,
        script,
        date,
        status,
        estimated_video_duration,
        estimated_rushes_duration,
        price_min,
        price_max,
        frequence,
        tags ? JSON.stringify(tags) : null,
        id,
        req.user.id,
      ]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Vidéo non trouvée ou accès refusé" });
    }

    const updated = await db.get(
      "SELECT * FROM video_requests WHERE id = ? AND creator_id = ?",
      [id, req.user.id]
    );

    if (updated.tags) updated.tags = JSON.parse(updated.tags);

    console.log("Vidéo mise à jour :", updated);
    res.json(updated);
  } catch (err) {
    console.error("Erreur modification vidéo :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ➡️ Liste des vidéos (toutes ou par user)
app.get("/api/video_requests", authMiddleware, async (req, res) => {
  const db = await dbPromise;
  const requests = await db.all(
    "SELECT vr.*, u.username AS creator_name FROM video_requests vr JOIN users u ON vr.creator_id = u.id"
  );

  const userVideos = requests
    .filter(v => v.creator_id === req.user.id)
    .map(v => ({
      ...v,
      tags: v.tags ? JSON.parse(v.tags) : [] // ⚡ parse JSON en tableau
    }));

  res.json(userVideos);
});

// ➡️ Récupération d'une vidéo par ID
app.get("/api/video_requests/:vid", authMiddleware, async (req, res) => {
  const db = await dbPromise;
  const videoId = req.params.vid;

  try {
    const video = await db.get(
      `SELECT vr.*, u.username AS creator_name 
       FROM video_requests vr 
       JOIN users u ON vr.creator_id = u.id 
       WHERE vr.id = ? AND vr.creator_id = ?`,
      [videoId, req.user.id]
    );

    if (!video) return res.status(404).json({ error: "Vidéo introuvable ou non autorisée" });

    video.tags = video.tags ? JSON.parse(video.tags) : [];

    res.json(video);
  } catch (err) {
    console.error("Erreur récupération vidéo :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});




// ➡️ Liste des souhaits de vidéo
app.get("/api/video_requests", authMiddleware, async (req, res) => {
  console.log("Requête reçue sur /api/video_requests par user:", req.user);

  const db = await dbPromise;

  // si tu veux toutes les vidéos :
  const requests = await db.all(
    "SELECT vr.*, u.username AS creator_name FROM video_requests vr JOIN users u ON vr.creator_id = u.id"
  );

  // si tu veux seulement les vidéos créées par l’utilisateur connecté :
  const userVideos = requests.filter(v => v.creator_id === req.user.id);

  console.log("Vidéos de l'utilisateur :", userVideos);
  res.json(userVideos);
});




// ✅ Route /api/me pour récupérer le profil utilisateur depuis le cookie
app.get("/api/me", authMiddleware, async (req, res) => {
  const db = await dbPromise;
  const user = await db.get("SELECT id, username, email FROM users WHERE id = ?", [req.user.id]);
  res.json(user);
});




// Récupérer une seule vidéo par ID pour l'utilisateur connecté
app.get("/api/video_requests/:vid", authMiddleware, async (req, res) => {
  const db = await dbPromise;
  const videoId = req.params.vid;

  try {
    const video = await db.get(
      `SELECT vr.*, u.username AS creator_name 
       FROM video_requests vr 
       JOIN users u ON vr.creator_id = u.id 
       WHERE vr.id = ? AND vr.creator_id = ?`,
      [videoId, req.user.id] // ⚡ on prend l'user depuis le token
    );

    if (!video) return res.status(404).json({ error: "Vidéo introuvable ou non autorisée" });

    res.json(video);
  } catch (err) {
    console.error("Erreur récupération vidéo :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});





// ➡️ Un monteur candidate à un souhait
app.post("/api/applications", async (req, res) => {
  const db = await dbPromise;
  const { request_id, editor_id, message } = req.body;

  const result = await db.run(
    "INSERT INTO applications (request_id, editor_id, message) VALUES (?,?,?)",
    [request_id, editor_id, message]
  );
  res.json({ id: result.lastID, request_id, editor_id, message });
});

// ➡️ Voir les candidatures d’un souhait
app.get("/api/applications/:requestId", async (req, res) => {
  const db = await dbPromise;
  const apps = await db.all(
    "SELECT a.*, u.username AS editor_name FROM applications a JOIN users u ON a.editor_id = u.id WHERE a.request_id = ?",
    [req.params.requestId]
  );
  res.json(apps);
});




app.post("/forum", (req, res) => {
  console.log("Connecté à la route Forum, envoie des données");
  let videoList = [];
  for (i = 0; i < users.length; i++) {
    users[i].videos.map((video) => { videoList.push(video) });

  }
  console.log("Liste des vidéos :", videoList);
  if (videoList) {
    res.json({ success: true, data: videoList });
  } else {
    res.json({ success: false, message: "Aucune vidéo trouvée" });
  }

});


// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
