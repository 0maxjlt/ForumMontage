import express from "express";
import mariadb from "mariadb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { th, video } from "framer-motion/client"; // si tu en as vraiment besoin
import cookieParser from "cookie-parser";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------------- CONFIG BDD MariaDB -------------------
const pool = mariadb.createPool({
  host: "localhost",
  user: "root",
  password: "azerty",
  database: "forumdb",
  connectionLimit: 5,
  port: 3306,
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
      status ENUM('open','in_progress','closed') DEFAULT 'closed',
      tags TEXT,
      estimated_video_duration VARCHAR(50),
      estimated_rushes_duration VARCHAR(50),
      price_min INT,
      price_max INT,
      frequence VARCHAR(50),
      creator_id INT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      favorite BOOLEAN,
      thumbnail VARCHAR(255),
      FOREIGN KEY (creator_id) REFERENCES users(id)
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS applications (
      id INT PRIMARY KEY AUTO_INCREMENT,
      video_id INT NOT NULL,
      video_creator_id INT NOT NULL,
      editor_id INT NOT NULL,
      message TEXT,
      status ENUM('pending','accepted','rejected') DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (video_id) REFERENCES video_requests(id),
      FOREIGN KEY (editor_id) REFERENCES users(id)
    );
  `);
}

initDb().catch(err => console.error("Erreur initialisation BDD :", err));


// ------------------- CONFIG MULTER (upload fichiers) -------------------

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5 Mo
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Seules les images sont autorisées"));
    }
    cb(null, true);
  },
});

app.post("/api/upload/thumbnail", authMiddleware, upload.single("thumbnail"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Aucun fichier envoyé" });

  // URL accessible de la miniature (si tu sers /uploads)
  const fileUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
  res.json({ success: true, url: fileUrl });
});

app.use("/uploads", express.static("uploads"));


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
    res.cookie("token", token, { httpOnly: true, secure: false, sameSite: "lax", maxAge: 2 * 60 * 60 * 1000, path: "/" });

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
  const { title, description, script, status,
    estimated_video_duration, estimated_rushes_duration,
    price_min, price_max, frequence, tags, favorite, thumbnail } = req.body;

  try {
    const result = await query(
      `INSERT INTO video_requests
       (title, description, script, status,
        estimated_video_duration, estimated_rushes_duration,
        price_min, price_max, frequence, tags, creator_id, created_at, favorite, thumbnail)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        title, description, script, status,
        estimated_video_duration, estimated_rushes_duration,
        price_min, price_max, frequence,
        tags ? JSON.stringify(tags) : null,
        req.user.id, new Date(), favorite, thumbnail

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
  const { title, description, script, status,
    estimated_video_duration, estimated_rushes_duration,
    price_min, price_max, frequence, tags, favorite, thumbnail } = req.body;
  const { id } = req.params;

  try {
    await query(
      `UPDATE video_requests
       SET title = ?, description = ?, script = ?, status = ?,
           estimated_video_duration = ?, estimated_rushes_duration = ?,
           price_min = ?, price_max = ?, frequence = ?, tags = ?, favorite = ?, thumbnail = ?
       WHERE id = ? AND creator_id = ?`,
      [
        title, description, script, status,
        estimated_video_duration, estimated_rushes_duration,
        price_min, price_max, frequence,
        tags ? JSON.stringify(tags) : null, favorite, thumbnail,

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

app.put("/api/video_requests/:id/favorite", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { favorite } = req.body; // true / false

  try {
    await query("UPDATE video_requests SET favorite = ? WHERE id = ?", [favorite ? 1 : 0, id]);
    res.json({ success: true, favorite });
  } catch (err) {
    console.error("Erreur mise à jour favori :", err);

    console.log("Mise à jour favori :", id, favorite);
  }
});


app.delete("/api/video_requests/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;


  try {
    await query(
      "DELETE FROM applications WHERE video_id = ? AND video_creator_id = ?",
      [id, req.user.id]
    );
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

app.delete("/api/video_requests/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const minia = await query("SELECT thumbnail FROM video_requests WHERE id = ? AND creator_id = ?", [id, req.user.id]);

    console.log("Vidéo à supprimer :", minia[0].thumbnail);

    if (minia.length === 0) {
      return res.status(404).json({ error: "Vidéo non trouvée ou accès refusé" });
    }


    const fileName = path.basename(minia[0].thumbnail);
    const filePath = path.join(__dirname, "..", "uploads", fileName);

    console.log("Chemin du fichier à supprimer :", filePath);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("Fichier supprimé :", minia[0].thumbnail);
    }

  } catch (err) {
    return res.status(404).json({ error: "Vidéo non trouvée ou accès refusé" });
  }

  try {
    await query(
      "DELETE FROM applications WHERE video_id = ? AND video_creator_id = ?",
      [id, req.user.id]
    );
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
      `SELECT vr.*, u.username AS creator_name
       FROM video_requests vr
       JOIN users u ON vr.creator_id = u.id
       WHERE vr.creator_id = ?
       ORDER BY vr.favorite DESC, vr.created_at DESC`,
      [req.user.id] // on filtre directement par utilisateur
    );

    // Convertir les tags JSON en tableau JS
    const userVideos = requests.map(v => ({
      ...v,
      tags: v.tags ? JSON.parse(v.tags) : []
    }));

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

// Récupération des vidéos publiques (forum)
app.get("/api/publicVideos", async (req, res) => {
  let {
    sortBy = "created_at",
    order = "DESC",
    title = "",
    price_min = 0,
    price_max = 999999,
    tags = ""
  } = req.query;

  try {
    if (price_max === '500') price_max = '999999';

    // On transforme la liste de tags en tableau et on enlève les "(nombre)" à la fin
    const tagsArray = tags
      ? tags.split(",").map(tag => tag.replace(/\s*\(\d+\)$/, ""))
      : [];

    // Construction dynamique de la condition tags avec LIKE
    let tagsQuery = "";
    let tagsParams = [];
    if (tagsArray.length > 0) {
      tagsQuery = tagsArray.map(_ => "video_requests.tags LIKE ?").join(" OR ");
      tagsParams = tagsArray.map(tag => `%${tag}%`);
    }

    const queryString = `
      SELECT 
        video_requests.id AS video_id,
        video_requests.title,
        video_requests.description,
        video_requests.status,
        video_requests.tags,
        video_requests.estimated_video_duration,
        video_requests.estimated_rushes_duration,
        video_requests.price_min,
        video_requests.price_max,
        video_requests.created_at AS video_created_at,
        users.username
      FROM video_requests
      JOIN users ON video_requests.creator_id = users.id
      WHERE video_requests.status = 'open'
        AND video_requests.title LIKE ?
        AND video_requests.price_min >= ?
        AND video_requests.price_max <= ?
        ${tagsQuery ? "AND (" + tagsQuery + ")" : ""}
      ORDER BY video_requests.${sortBy} ${order}
    `;

    const videos = await query(queryString, [`%${title}%`, price_min, price_max, ...tagsParams]);

    const parsedVideos = videos.map(video => ({
      ...video,
      tags: video.tags ? JSON.parse(video.tags) : []
    }));

    res.json(parsedVideos);
  } catch (err) {
    console.error("Erreur récupération vidéos publiques :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});





// ------------------- ROUTES APPLICATION -------------------

// Vérifier si l’éditeur a déjà postulé à une vidéo ou pas

app.get("/api/applications/:videoId", authMiddleware, async (req, res) => {
  const video_id = req.params.videoId;
  const editor_id = req.user.id;

  try {
    const existingApps = await query(
      "SELECT * FROM applications WHERE video_id = ? AND editor_id = ?",
      [video_id, editor_id]
    );

    if (editor_id === existingApps[0]?.video_creator_id) {
      return res.json({ result: "creator" });
    }

    if (existingApps.length > 0) {
      console.log("Candidature existante :", existingApps[0]);
      return res.json({ result: "exists", application: existingApps[0] });
    } else {
      return res.json({ result: "none" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


// Candidate à un souhait
app.post("/api/applications", authMiddleware, async (req, res) => {
  const { video_id, message } = req.body;
  const editor_id = req.user.id;
  const created_at = new Date();
  const status = "pending";


  if (!message) return res.status(400).json({ error: "Message manquant" });
  if (!video_id) return res.status(400).json({ error: "ID vidéo manquant" });
  if (!editor_id) return res.status(400).json({ error: "ID éditeur manquant" });


  try {
    const existingApps = await query(
      "SELECT * FROM applications WHERE video_id = ? AND editor_id = ?",
      [video_id, editor_id]
    );

    if (existingApps.length > 0) {
      return res.status(400).json({ error: "Vous avez déjà postulé à cette vidéo" });
    }



    else {

      const video = await query("SELECT creator_id FROM video_requests WHERE id = ?", [video_id]);
      if (video.length === 0) return res.status(404).json({ error: "Vidéo non trouvée" });
      const video_creator_id = video[0].creator_id;


      const result = await query(
        "INSERT INTO applications (video_creator_id, video_id, editor_id, message, created_at, status) VALUES (?,?,?,?,?,?)",
        [video_creator_id, video_id, editor_id, message, created_at, status]
      );

      const newApp = await query("SELECT * FROM applications WHERE id = ?", [result.insertId]);
      res.json(newApp[0]);
      console.log("Nouvelle candidature :", newApp[0]);

    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Modification du message de candidature

app.put("/api/applications/", authMiddleware, async (req, res) => {

  const { applicationId, message } = req.body;

  console.log("Données reçues pour modification :", { applicationId, message });

  const editor_id = req.user.id;

  if (!applicationId || !message) {
    return res.status(400).json({ error: "ID candidature ou message manquant" });
  }

  try {
    const result = await query(
      "UPDATE applications SET message = ? WHERE id = ? AND editor_id = ?",
      [message, applicationId, editor_id]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: "Candidature non trouvée" });
    }

    res.json({ message: "Candidature modifiée avec succès" });
    console.log("Candidature modifiée :", applicationId);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Récupération d’une vidéo publique par username + videoId quand on clique sur une vidéo dans le forum

app.get("/api/videos/:username/:videoId", authMiddleware, async (req, res) => {
  const { username, videoId } = req.params;

  try {
    const video = await query(
      `SELECT vr.*, u.username AS creator_name
       FROM video_requests vr
       JOIN users u ON vr.creator_id = u.id
       WHERE vr.id = ? AND u.username = ? AND vr.status = 'open'`,
      [videoId, username]
    );

    console.log("Vidéo récupérée :", video);
    if (!video[0]) return res.status(404).json({ error: "Vidéo introuvable ou non autorisée" });

    const parsedVideos = video.map(video => ({
      ...video,
      tags: video.tags ? JSON.parse(video.tags) : [] // si null → tableau vide
    }));

    console.log("Vidéos publiques récupérées :", parsedVideos[0]);
    res.json(parsedVideos[0]);
  } catch (err) {
    console.error("Erreur récupération vidéo :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Voir les candidatures d’un souhait
app.get("/api/applications/:requestId", authMiddleware, async (req, res) => {
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


// ------------------- LANCEMENT -------------------
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
