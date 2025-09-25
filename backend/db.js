import mariadb from "mariadb";

// Pool de connexions
export const pool = mariadb.createPool({
  host: "localhost",
  user: "root",
  password: "azerty",
  database: "forumdb",
  connectionLimit: 5,
  port: 3306,
});

// Fonction utilitaire pour exécuter des requêtes
export async function query(sql, params = []) {
  let conn;
  try {
    conn = await pool.getConnection();
    const res = await conn.query(sql, params);
    return res;
  } finally {
    if (conn) conn.release();
  }
}

// Initialisation des tables
export async function initDb() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS video_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      status ENUM('open', 'in_progress', 'closed') DEFAULT 'closed',
      tags TEXT,
      estimated_video_duration VARCHAR(50),
      estimated_rushes_duration VARCHAR(50),
      price_min INT,
      price_max INT,
      creator_id INT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      favorite BOOLEAN,
      thumbnail VARCHAR(255),
      FOREIGN KEY (creator_id) REFERENCES users(id)
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS applications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      video_id INT NOT NULL,
      applicant_id INT NOT NULL,
      message TEXT,
      statut ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (video_id) REFERENCES video_requests(id),
      FOREIGN KEY (applicant_id) REFERENCES users(id)
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS discussions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT,
    editor_id INT,
    creator_id INT,
    FOREIGN KEY (application_id) REFERENCES applications(id),
    FOREIGN KEY (editor_id) REFERENCES users(id),
    FOREIGN KEY (creator_id) REFERENCES users(id)
  );
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS messages(
      id INT AUTO_INCREMENT PRIMARY KEY,
      is_creator BIT,
      discussion_id INT,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (discussion_id) REFERENCES discussions(id)
  );
  `);
}

// Lancer l'init au démarrage
initDb().catch(err => console.error("Erreur initialisation BDD :", err));
