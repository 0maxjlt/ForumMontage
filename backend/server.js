import express from "express";
import mariadb from "mariadb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { video } from "framer-motion/client"; // si tu en as vraiment besoin
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// ------------------- CONFIG BDD MariaDB -------------------
const pool = mariadb.createPool({
  host: "localhost",
  user: "root", // à adapter
  password: "azerty", // à adapter
  database: "forumdb",
  connectionLimit: 5,
  port: 3306
});

async function query(sql, params = []) {
  let conn;
  try {
    conn = await pool.getConnection();
    const res = await conn.query(sql, params);
    return res;
  } finally {
    if (conn) conn.release();
  }
}

// Création des tables si elles n’existent pas
async function initDb() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(255) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS video_requests (
      id INT PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      script TEXT,
      date DATE,
      status ENUM('open','in_progress','done') DEFAULT 'open',
      tags TEXT,
      estimated_video_duration VARCHAR(50),
      estimated_rushes_duration VARCHAR(50),
      price_min INT,
      price_max INT,
      frequence VARCHAR(50),
      creator_id INT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (creator_id) REFERENCES users(id)
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS applications (
      id INT PRIMARY KEY AUTO_INCREMENT,
      request_id INT NOT NULL,
      editor_id INT NOT NULL,
      message TEXT,
      status ENUM('pending','accepted','rejected') DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (request_id) REFERENCES video_requests(id),
      FOREIGN KEY (editor_id) REFERENCES users(id)
    );
  `);
}

initDb().catch(err => console.error("Erreur initialisation BDD :", err));

// ------------------- VARIABLES -------------------
const SECRET = "unSuperSecretUltraSolide";

// ------------------- MIDDLEWARE -------------------
async function authMiddleware(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Non autorisé" });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token invalide ou expiré" });
  }
}

// ------------------- ROUTES UTILISATEUR -------------------

// Connexion
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("Requête reçue sur /api/login :", req.body);
    const users = await query("SELECT * FROM users WHERE email = ?", [email]);
    const user = users[0];
    if (!user) return res.status(401).json({ error: "Email ou mot de passe incorrect" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Email ou mot de passe incorrect" });

    const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: "2h" });
    res.cookie("token", token, { httpOnly: true, secure: false, sameSite: "lax", maxAge: 2*60*60*1000, path: "/" });

    res.json({ success: true, user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    console.error("Erreur login:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Déconnexion
app.post("/api/logout", (req, res) => {
  res.clearCookie("token", { httpOnly: true, secure: false, sameSite: "lax", path: "/" });
  res.json({ success: true });
});

// Inscription
app.post("/api/register", async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    console.log("Requête reçue sur /api/register :", req.body);
    const result = await query(
      "INSERT INTO users (username, email, password) VALUES (?,?,?)",
      [username, email, hashedPassword]
    );
    res.json({ id: result.insertId, username, email });
  } catch (err) {
    res.status(400).json({ error: "Utilisateur déjà existant" });
  }
});

// Profil utilisateur
app.get("/api/me", authMiddleware, async (req, res) => {
  const users = await query("SELECT id, username, email FROM users WHERE id = ?", [req.user.id]);
  res.json(users[0]);
});

// ------------------- ROUTES VIDEO -------------------

// Création d'une vidéo
app.post("/api/video_requests", authMiddleware, async (req, res) => {
  const { title, description, script, date, status,
          estimated_video_duration, estimated_rushes_duration,
          price_min, price_max, frequence, tags } = req.body;

  try {
    const result = await query(
      `INSERT INTO video_requests
       (title, description, script, date, status,
        estimated_video_duration, estimated_rushes_duration,
        price_min, price_max, frequence, tags, creator_id)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        title, description, script, date, status,
        estimated_video_duration, estimated_rushes_duration,
        price_min, price_max, frequence,
        tags ? JSON.stringify(tags) : null,
        req.user.id
      ]
    );

    const created = await query("SELECT * FROM video_requests WHERE id = ?", [result.insertId]);
    if (created[0].tags) created[0].tags = JSON.parse(created[0].tags);
    console.log("Vidéo créée :", created[0]);
    res.json(created[0]);
  } catch (err) {
    console.error("Erreur création vidéo :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Modification d'une vidéo
app.put("/api/video_requests/:id", authMiddleware, async (req, res) => {
  const { title, description, script, date, status,
          estimated_video_duration, estimated_rushes_duration,
          price_min, price_max, frequence, tags } = req.body;
  const { id } = req.params;

  try {
    await query(
      `UPDATE video_requests
       SET title = ?, description = ?, script = ?, date = ?, status = ?,
           estimated_video_duration = ?, estimated_rushes_duration = ?,
           price_min = ?, price_max = ?, frequence = ?, tags = ?
       WHERE id = ? AND creator_id = ?`,
      [
        title, description, script, date, status,
        estimated_video_duration, estimated_rushes_duration,
        price_min, price_max, frequence,
        tags ? JSON.stringify(tags) : null,
        id, req.user.id
      ]
    );

    const updated = await query(
      "SELECT * FROM video_requests WHERE id = ? AND creator_id = ?",
      [id, req.user.id]
    );

    if (!updated[0]) return res.status(404).json({ error: "Vidéo non trouvée ou accès refusé" });
    if (updated[0].tags) updated[0].tags = JSON.parse(updated[0].tags);

    console.log("Vidéo mise à jour :", updated[0]);
    res.json(updated[0]);
  } catch (err) {
    console.error("Erreur modification vidéo :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.delete("/api/video_requests/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    await query(
      "DELETE FROM video_requests WHERE id = ? AND creator_id = ?",
      [id, req.user.id]
    );
    res.json({ success: true });
    console.log("Vidéo supprimée :", id);
  } catch (err) {
    console.error("Erreur suppression vidéo :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Liste des vidéos
app.get("/api/video_requests", authMiddleware, async (req, res) => {
  try {
    const requests = await query(
      "SELECT vr.*, u.username AS creator_name FROM video_requests vr JOIN users u ON vr.creator_id = u.id"
    );
    const userVideos = requests
      .filter(v => v.creator_id === req.user.id)
      .map(v => ({ ...v, tags: v.tags ? JSON.parse(v.tags) : [] }));
    res.json(userVideos);
  } catch (err) {
    console.error("Erreur récupération vidéos :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Récupération d'une vidéo par ID
app.get("/api/video_requests/:vid", authMiddleware, async (req, res) => {
  const videoId = req.params.vid;

  try {
    const videos = await query(
      `SELECT vr.*, u.username AS creator_name
       FROM video_requests vr
       JOIN users u ON vr.creator_id = u.id
       WHERE vr.id = ? AND vr.creator_id = ?`,
      [videoId, req.user.id]
    );
    if (!videos[0]) return res.status(404).json({ error: "Vidéo introuvable ou non autorisée" });
    videos[0].tags = videos[0].tags ? JSON.parse(videos[0].tags) : [];
    res.json(videos[0]);
  } catch (err) {
    console.error("Erreur récupération vidéo :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ------------------- ROUTES APPLICATION -------------------

// Candidate à un souhait
app.post("/api/applications", async (req, res) => {
  const { request_id, editor_id, message } = req.body;

  try {
    const result = await query(
      "INSERT INTO applications (request_id, editor_id, message) VALUES (?,?,?)",
      [request_id, editor_id, message]
    );
    res.json({ id: result.insertId, request_id, editor_id, message });
  } catch (err) {
    console.error("Erreur candidature :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Voir les candidatures d’un souhait
app.get("/api/applications/:requestId", async (req, res) => {
  try {
    const apps = await query(
      "SELECT a.*, u.username AS editor_name FROM applications a JOIN users u ON a.editor_id = u.id WHERE a.request_id = ?",
      [req.params.requestId]
    );
    res.json(apps);
  } catch (err) {
    console.error("Erreur récupération candidatures :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Route forum
app.post("/forum", (req, res) => {
  console.log("Connecté à la route Forum, envoie des données");
  let videoList = [];
  if (typeof users !== "undefined") {
    for (let i = 0; i < users.length; i++) {
      users[i].videos?.forEach(video => videoList.push(video));
    }
  }
  res.json(videoList.length ? { success: true, data: videoList } : { success: false, message: "Aucune vidéo trouvée" });
});

// ------------------- LANCEMENT -------------------
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
