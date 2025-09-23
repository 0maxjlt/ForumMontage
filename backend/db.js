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

    await query(`
    CREATE TABLE IF NOT EXISTS messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL, -- discussion liée à une candidature
    sender_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id),
    FOREIGN KEY (sender_id) REFERENCES users(id)
    );
  `);
}

// Lancer l'init au démarrage
initDb().catch(err => console.error("Erreur initialisation BDD :", err));
