import { Server as SocketIOServer } from "socket.io";
import jwt from "jsonwebtoken";
import { query } from "./db.js";


const onlineUsers = new Map();


export function initSocketServer(server, SECRET) {
    const io = new SocketIOServer(server, {
        cors: { origin: "http://localhost:5173", credentials: true }
    });

    io.use((socket, next) => {
        try {
            const cookieHeader = socket.handshake.headers.cookie || "";
            const cookies = Object.fromEntries(cookieHeader.split("; ").map(c => c.split("=")));
            const token = cookies.token;

            if (!token) return next(new Error("Auth error"));

            const decoded = jwt.verify(token, SECRET);
            socket.userId = decoded.id;

            console.log("Token details:", decoded);

            next();
        } catch (err) {
            next(new Error("Auth error"));
        }
    });

    io.on("connection", async (socket) => {
        console.log("✅ User connecté id :", socket.userId);
        onlineUsers.set(socket.userId, socket);
        console.log("Utilisateurs en ligne :", Array.from(onlineUsers.keys()));

        // Chat privé
        socket.on("new_message", async ({ applicationId, text }) => {
            try {
                if (!applicationId || !text || text.trim().length === 0) return;

                console.log("Nouveau message reçu", { applicationId, from: socket.userId, text });

                // Enregistrer en DB
                await query(
                    "INSERT INTO messages (application_id, sender_id, content, created_at) VALUES (?, ?, ?, NOW())",
                    [applicationId, socket.userId, text]
                );

                console.log("Message sauvegardé en DB", { applicationId, from: socket.userId, text });

                // Récupérer l’application pour savoir qui est impliqué
                const [appData] = await query(
                    "SELECT video_creator_id, editor_id FROM applications WHERE id = ?",
                    [applicationId]
                );

                if (!appData) return;

                // Envoyer au bon utilisateur 
                const receivers = [appData.video_creator_id, appData.editor_id];
                console.log("Envoi du message aux utilisateurs :", receivers);
                

                receivers.forEach((uid) => {
                    const targetSocket = onlineUsers.get(uid);
                    if (targetSocket) {
                        targetSocket.emit("new_message", {
                            applicationId,
                            from: socket.userId,
                            text,
                        });
                    }
                });

                console.log(
                    `💬 Message [app=${applicationId}] de ${socket.userId} : ${text}`
                );
            } catch (err) {
                console.error("Erreur envoi message:", err);
            }
        });

        socket.on("disconnect", () => {
            onlineUsers.delete(socket.userId);
            console.log("❌ User déconnecté :", socket.username);
        });
    });
}
