import { Server as SocketIOServer } from "socket.io";
import jwt from "jsonwebtoken";
import { query } from "./db.js";
import { create } from "domain";


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
        socket.on("new_message", async ({ discussionId, applicationId, text, userId }) => {
            console.log("Événement new_message reçu", { discussionId, applicationId, text, userId });
            try {
                if (!userId || !discussionId || !text || text.trim().length === 0) return;

                console.log("Nouveau message reçu", { discussionId, from: socket.userId, text });

                const video = await query(
                    "SELECT applicant_id from applications WHERE id = ?",
                    [applicationId]
                );

                console.log("Données de la vidéo récupérées :", video);

                const applicant_id = video[0]?.applicant_id;

                if (!applicant_id) {
                    console.log("Vidéo non trouvée pour userId:", userId);
                    return;
                }

                if (socket.userId !== applicant_id && socket.userId !== userId) {
                    console.log("Utilisateur non autorisé à envoyer ce message");
                    return;
                }

                const is_creator = socket.userId === applicant_id ? 0 : 1;
                const newDate = new Date();

                // Enregistrer en DB
                await query(
                    "INSERT INTO messages (is_creator, discussion_id, content, created_at) VALUES (?, ?, ?, ?)",
                    [is_creator, discussionId, text, newDate]
                );

                console.log("Message sauvegardé en DB ",  text );

                // Récupérer l’application pour savoir qui est impliqué
                const [discData] = await query(
                    "SELECT editor_id, creator_id FROM discussions WHERE application_id = ?",
                    [applicationId]
                );

                console.log("Données de la discussion récupérées :", discData);

                if (!discData) return;

                // Envoyer au bon utilisateur 
                const receivers = [discData.creator_id, discData.editor_id];
                console.log("Envoi du message aux utilisateurs :", receivers);
                

                receivers.forEach((uid) => {
                    const targetSocket = onlineUsers.get(uid);
                    if (targetSocket) {
                        targetSocket.emit("new_message", {
                            text,
                            is_creator,
                            created_at: newDate,
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
