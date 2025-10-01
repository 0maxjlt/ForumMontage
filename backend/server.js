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

import WebSocketServer from "ws";


import { pool, query, initDb } from "./db.js";
import { initSocketServer } from "./socketServer.js";


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



// ------------------- VARIABLES -------------------
const SECRET = "unSuperSecretUltraSolide";



const server = app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

initSocketServer(server, SECRET);




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
  console.log("Profil utilisateur :", users[0]);
});

// ------------------- ROUTES VIDEO -------------------

// Création d'une vidéo
app.post("/api/video_requests", authMiddleware, async (req, res) => {
  const { title, description, status,
    estimated_video_duration, estimated_rushes_duration,
    price_min, price_max, tags, favorite, thumbnail } = req.body;

  try {
    const result = await query(
      `INSERT INTO video_requests
       (title, description, status,
        estimated_video_duration, estimated_rushes_duration,
        price_min, price_max, tags, creator_id, created_at, favorite, thumbnail)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        title, description, status,
        estimated_video_duration, estimated_rushes_duration,
        price_min, price_max,
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
  const { title, description, status,
    estimated_video_duration, estimated_rushes_duration,
    price_min, price_max, tags, favorite, thumbnail } = req.body;
  const { id } = req.params;

  try {
    await query(
      `UPDATE video_requests
       SET title = ?, description = ?, status = ?,
           estimated_video_duration = ?, estimated_rushes_duration = ?,
           price_min = ?, price_max = ?, tags = ?, favorite = ?, thumbnail = ?
       WHERE id = ? AND creator_id = ?`,
      [
        title, description, status,
        estimated_video_duration, estimated_rushes_duration,
        price_min, price_max,
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
  const user_id = req.user.id;

  try {
    const videos = await query(
      "SELECT creator_id FROM video_requests WHERE id = ?",
      [video_id]
    );

    if (videos.length === 0) {
      return res.status(404).json({ error: "Vidéo non trouvée" });
    }

    const video_creator_id = videos[0].creator_id;

    if (video_creator_id === user_id) {
      return res.json({ result: "creator" });
    }


    const applications = await query(
      "SELECT * FROM applications WHERE video_id = ? AND applicant_id = ?",
      [video_id, user_id]
    );

    if (applications.length > 0) {
      // L’utilisateur a déjà postulé
      return res.json({ result: "exists", application: applications[0] });
    } else {
      // L’utilisateur n’a pas encore postulé
      return res.json({ result: "not_exists" });
    }

  } catch (err) {
    console.error("Erreur vérification candidature :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }

});


// Candidate à un souhait
app.post("/api/applications", authMiddleware, async (req, res) => {
  const { video_id, message } = req.body;
  const editor_id = req.user.id;
  const created_at = new Date();
  const statut = "pending";


  if (!message) return res.status(400).json({ error: "Message manquant" });
  if (!video_id) return res.status(400).json({ error: "ID vidéo manquant" });
  if (!editor_id) return res.status(400).json({ error: "ID éditeur manquant" });


  try {
    const existingApps = await query(
      "SELECT * FROM applications WHERE video_id = ? AND applicant_id = ?",
      [video_id, editor_id]
    );

    if (existingApps.length > 0) {
      return res.status(400).json({ error: "Vous avez déjà postulé à cette vidéo" });
    }

    if (editor_id === existingApps[0]?.video_creator_id) {
      return res.status(400).json({ error: "Vous ne pouvez pas postuler à votre propre vidéo" });
    }



    const result = await query(
      "INSERT INTO applications (video_id, applicant_id, message, created_at, statut, seen_by_creator) VALUES (?,?,?,?,?,?)",
      [video_id, editor_id, message, created_at, statut, 0]
    );

    const newApp = await query("SELECT * FROM applications WHERE id = ? AND applicant_id = ?", [result.insertId, editor_id]);
    res.json(newApp[0]);
    console.log("Nouvelle candidature :", newApp[0]);


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

    const existingApps = await query(
      "SELECT * FROM applications WHERE id = ? AND applicant_id = ?",
      [applicationId, editor_id]
    );

    if (editor_id === existingApps[0]?.video_creator_id) {
      return res.status(400).json({ error: "Vous ne pouvez pas modifier une candidature à votre propre vidéo" });
    }

    const result = await query(
      "UPDATE applications SET message = ? WHERE id = ? AND applicant_id = ?",
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



// --- MESSAGERIE ---

app.get("/api/other_user/:discussionId", authMiddleware, async (req, res) => {
  const discussionId = req.params.discussionId;
  const userId = req.user.id;

  try {
    const otherUser = await query(`
      SELECT users.id, users.username
      FROM users
      JOIN discussions ON users.id = discussions.editor_id OR users.id = discussions.creator_id
      WHERE users.id = (
          CASE 
            WHEN discussions.editor_id = ? THEN discussions.creator_id 
            ELSE discussions.editor_id 
          END
      )
      AND discussions.id = ?
    `, [userId, discussionId]);

    console.log("Autre utilisateur récupéré :", otherUser);

    if (!otherUser[0]) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    res.json(otherUser[0]);
  } catch (err) {
    console.error("Erreur récupération autre utilisateur :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.get("/api/applications_list", authMiddleware, async (req, res) => {

  const creator_id = req.user.id;

  try {
    const applications = await query(`
      SELECT applications.*, applications.video_id AS application_video_id, applications.id AS application_id, users.id AS user_id, users.username
      FROM applications 
      JOIN video_requests ON applications.video_id = video_requests.id 
      JOIN users ON applications.applicant_id = users.id
      WHERE video_requests.creator_id = ? AND applications.statut = 'pending' 
      ORDER BY applications.created_at DESC 
      `,
      [creator_id]
    );

    res.json({ applications });
  } catch (err) {
    console.error("Erreur récupération candidatures :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.put("/api/applications/:id/seen", authMiddleware, async (req, res) => {
  const applicationId = req.params.id;
  const creator_id = req.user.id;


  console.log("Marquer comme vue :", applicationId, "par le créateur", creator_id);

  try {

    const creator = await query(`
      SELECT creator_id
        FROM video_requests 
        JOIN applications ON video_requests.id = applications.video_id
        WHERE applications.id = ?`,
      [applicationId]
    );

    console.log("Vérification créateur :", creator);
    console.log("ID créateur connecté :", creator_id);
    if (creator.length === 0) {
      return res.status(404).json({ error: "Candidature non trouvée" });
    }

    if (creator[0].creator_id !== creator_id) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const result = await query(
      "UPDATE applications SET seen_by_creator = 1 WHERE id = ?",
      [applicationId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Candidature non trouvée" });
    }

    res.json({ message: "Candidature marquée comme vue" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.put("/api/applications/:id/accept", authMiddleware, async (req, res) => {
  const applicationId = req.params.id;
  const creator_id = req.user.id;


  try {
    const creator = await query(`
      SELECT creator_id
        FROM video_requests 
       WHERE id = (SELECT video_id FROM applications WHERE id = ?)`,
      [applicationId]
    );

    if (creator.length === 0) {
      return res.status(404).json({ error: "Candidature non trouvée" });
    }

    if (creator[0].creator_id !== creator_id) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const result = await query(
      "UPDATE applications SET statut = 'accepted' WHERE id = ?",
      [applicationId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Candidature non trouvée" });
    }

    const applicant_id = await query(
      "SELECT applicant_id FROM applications WHERE id = ?",
      [applicationId]
    );

    await query(
      `INSERT INTO discussions (application_id, editor_id, creator_id)
       VALUES (?, ?, ?)`,
      [applicationId, applicant_id[0].applicant_id, creator_id]
    );

    await query(
      `INSERT INTO messages (is_creator, discussion_id, content)
   VALUES (1, (SELECT id FROM discussions WHERE application_id = ? LIMIT 1), ?)`,
      [applicationId, " d "]
    );


    console.log("Discussion créée pour la candidature :", applicationId, "entre l'éditeur", applicant_id[0].applicant_id, "et le créateur", creator_id);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.put("/api/applications/:id/reject", authMiddleware, async (req, res) => {
  const applicationId = req.params.id;
  const creator_id = req.user.id;
  try {
    const creator = await query(`
      SELECT creator_id
        FROM video_requests
       WHERE id = (SELECT video_id FROM applications WHERE id = ?)`,
      [applicationId]
    );

    if (creator.length === 0) {
      return res.status(404).json({ error: "Candidature non trouvée" });
    }

    if (creator[0].creator_id !== creator_id) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const result = await query(
      "UPDATE applications SET statut = 'rejected' WHERE id = ?",
      [applicationId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Candidature non trouvée" });
    }

    res.json({ message: "Candidature refusée" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


app.get("/api/discussions_list", authMiddleware, async (req, res) => {

  const userId = req.user.id;

  console.log("Récupérer les discussions pour l'utilisateur :", userId);

  try {
    const discussions = await query(`
      SELECT d.id AS discussion_id,
             d.application_id,
             d.editor_id,
             d.creator_id,
             m.content AS last_message,
             m.created_at AS last_message_date,
             u.username AS other_username
      FROM discussions d
      JOIN messages m ON d.id = m.discussion_id
      JOIN users u ON u.id = (
          CASE 
            WHEN d.editor_id = ? THEN d.creator_id 
            ELSE d.editor_id 
          END
      )
      WHERE m.id IN (
        SELECT MAX(id)
        FROM messages
        WHERE discussion_id = d.id
      )

      AND (d.editor_id = ? OR d.creator_id = ?)


    `, [userId, userId, userId, userId]);


    console.log("Discussions récupérées :", discussions);
    if (discussions.length === 0) {
      return res.status(404).json({ error: "Aucune discussion trouvée" });
    }

    res.json({ discussions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.get("/api/discussions/:discussionId", authMiddleware, async (req, res) => {
  const { discussionId } = req.params;
  const userId = req.user.id;

  console.log("Récupérer la discussion :", discussionId, "pour l'utilisateur :", userId);

  try {
    const messages = await query(`
      SELECT discussions.id AS discussion_id, application_id, editor_id, creator_id, content, messages.created_at, is_creator
      FROM discussions
      JOIN messages ON discussions.id = messages.discussion_id

      WHERE discussions.id = ? 
      ORDER BY messages.created_at ASC
    `, [discussionId, userId, userId]);

    console.log("Discussion récupérée :", messages);

    if (messages.length === 0) {
      return res.status(404).json({ error: "Discussion non trouvée" });
    }

    res.json({ discussion: messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});



// ------------------- LANCEMENT -------------------


