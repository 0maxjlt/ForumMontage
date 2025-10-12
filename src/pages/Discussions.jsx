import React, { useState, useEffect, use } from 'react';
import { Card, Stack, Typography, Box, Avatar, Divider, Button, Badge, TextField, IconButton } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';

import { io } from 'socket.io-client';
import { useRef } from 'react';
import { nav } from 'framer-motion/client';

function Discussions() {
    const [discussions, setDiscussions] = useState([]);
    const [selectedDiscussion, setSelectedDiscussion] = useState(null);
    const [user, setUser] = useState(null);
    const [otherUser, setOtherUser] = useState(null);
    const [newMessage, setNewMessage] = useState("");
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);

    const [creatorId, setCreatorId] = useState(null);
    const [editorId, setEditorId] = useState(null);


    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Scroller en bas à chaque nouveau message
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
        }
    }, [messages]);


    useEffect(() => {
        console.log("Récupération de l'utilisateur...");
        fetch("/api/me", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        })
            .then((response) => {
                if (!response.ok) throw new Error(`Erreur lors de la récupération de l'utilisateur (status ${response.status})`);
                return response.json();
            })
            .then((data) => {
                if (data) {
                    console.log("Utilisateur récupéré :", data);
                    setUser(data);
                }

                else {
                    console.log("Aucun utilisateur trouvé");
                    navigate("/login");
                }

            })
            .catch((err) => console.error(err));
    }, []);


    useEffect(() => {
        if (selectedDiscussion) {
            fetch(`/api/other_user/${selectedDiscussion[0].discussion_id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            })
                .then((response) => {
                    if (!response.ok) throw new Error(`Erreur lors de la récupération de l'autre utilisateur (status ${response.status})`);
                    return response.json();
                })
                .then((data) => {
                    if (data) {
                        console.log("Autre utilisateur récupéré :", data);
                        setOtherUser(data);
                        setCreatorId(selectedDiscussion[0].creator_id);
                        setEditorId(selectedDiscussion[0].editor_id);
                    }
                })
                .catch((err) => console.error(err));
        }
    }, [selectedDiscussion]);

    useEffect(() => {
        fetch("/api/discussions_list", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        })
            .then((response) => {
                if (!response.ok) throw new Error(`Erreur lors de la récupération des discussions (status ${response.status})`);
                return response.json();
            })
            .then((data) => {
                if (data.discussions) {
                    console.log("Discussions récupérées :", data.discussions);
                    setDiscussions(data.discussions);
                }
            })
            .catch((err) => console.error(err));
    }, []);

    useEffect(() => {
        const s = io("http://localhost:3001", {
            withCredentials: true, // pour envoyer le cookie JWT
        });

        s.on("connect", () => {
            console.log("✅ Connecté au serveur socket");
        });

        s.on("new_message", (msg) => {
            console.log("📩 Nouveau message :", msg);
            setMessages((prev) => [...prev, msg]);
            console.log("Messages mis à jour :", messages);

        });

        setSocket(s);
        return () => s.disconnect();
    }, []);

    const sendMessage = () => {
        console.log("Envoi du message :", newMessage);
        if (!newMessage.trim() || !socket) return;

        console.log("Envoi du message :", newMessage);

        console.log("Données de la discussion sélectionnée :", selectedDiscussion);

        socket.emit("new_message", {
            discussionId: selectedDiscussion[0].discussion_id,
            applicationId: selectedDiscussion[0].application_id,
            text: newMessage,
            userId: user.id,
        });

        setNewMessage("");
    };

    const handleSelectDiscussion = (discussion_id) => {
        console.log("Sélection de la discussion ID :", discussion_id);
        fetch(`/api/discussions/${discussion_id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        })
            .then((response) => {
                if (!response.ok) throw new Error(`Erreur lors de la récupération des messages (status ${response.status})`);
                return response.json();
            })
            .then((data) => {
                setSelectedDiscussion(data.discussion);
                console.log("Messages récupérés pour la discussion :", data.discussion);

            })
            .catch((err) => console.error(err));

        //handleMarkSeen(discussion_id);
    };

    {/*const handleMarkSeen = (discussionId) => {
        fetch(`/api/discussions/${discussionId}/seen`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        })
            .then((response) => {
                if (!response.ok) throw new Error(`Erreur lors de la mise à jour (status ${response.status})`);
                return response.json();
            })
            .then((data) => {
                setDiscussions((prev) =>
                    prev.map((d) => (d.id === discussionId ? { ...d, seen_by_user: 1 } : d))
                );
            })
            .catch((err) => console.error(err));
    };
    */}

    return (
        <Stack spacing={2} sx={{ p: 0, m: 0 }}>


            <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
            >
                {/* Colonne gauche - Liste des discussions */}
                <Stack
                    spacing={2}
                    sx={{
                        width: { xs: "100%", md: "420px" },
                        display: selectedDiscussion ? { xs: "none", md: "flex" } : "flex",
                        height: { xs: "auto", md: "80vh" },
                        minWidth: "420px",
                    }}
                >
                    <Typography variant="h6" sx={{ mb: 1 }}>
                        Vos discussions
                    </Typography>



                    <Stack direction="row" sx={{ pr: 2 }}>
                        <Button endIcon={<ArrowForwardIcon />}
                            sx={{ width: "100%", p: 4, color: "white", backgroundColor: "#273529ff", "&:hover": { backgroundColor: "#354d3dff" } }}
                            variant="contained"
                            onClick={() => navigate('/messagerie/demandes')}
                        >
                            Voir les demandes d'application
                        </Button>
                    </Stack>

                    {discussions.length === 0 && (
                        <Typography>Aucune discussion disponible.</Typography>
                    )}

                    <Stack spacing={2} sx={{ overflowY: "auto", pr: 2 }}>
                        {discussions.map(disc => (
                            <Card
                                key={disc.discussion_id}
                                sx={{
                                    bgcolor: disc.seen_by_user === 0 ? "#141414ff" : selectedDiscussion ? selectedDiscussion[0].discussion_id === disc.id ? "#292e24ff" : "#030303ff" : "#030303ff",
                                    p: 2,
                                    transition: "transform 0.3s ease-in-out, background-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                                    ":hover": {
                                        transform: "scale(1.02)",
                                        boxShadow: 6,
                                        bgcolor: selectedDiscussion ? selectedDiscussion[0].discussion_id === disc.id ? "#292e24ff" : "#1e1e1e" : "#1e1e1e",
                                    },
                                    cursor: "pointer",
                                    height: 120,
                                    minHeight: 120,
                                }}
                                onClick={() => {
                                    handleSelectDiscussion(disc.discussion_id);
                                    //handleMarkSeen(disc.id);
                                }}
                            >
                                <Stack spacing={1}>
                                    <Stack direction="row" spacing={1} alignItems="flex-start">
                                        <Avatar sx={{ bgcolor: "#89CE94" }}>
                                            <PersonIcon />
                                        </Avatar>
                                        <Stack direction="column" spacing={0.5} flexGrow={1}>
                                            <Stack direction="row" justifyContent="space-between" width="100%">
                                                <Stack direction="column" alignItems="flex-start">
                                                    <Typography sx={{ fontSize: "1rem", fontWeight: 500 }}>
                                                        {disc.other_username || "Utilisateur"}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: "0.9rem", color: "text.secondary", fontWeight: 300 }}>
                                                        {disc.last_message_date?.split("T")[0]}
                                                    </Typography>
                                                </Stack>
                                                {disc.seen_by_user === 0 && <Badge color="primary" variant="dot" />}
                                            </Stack>
                                            <Divider sx={{ width: "100%" }} />
                                            <Typography
                                                sx={{
                                                    fontSize: "0.95rem",
                                                    fontWeight: 200,
                                                    color: "text.secondary",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    display: "-webkit-box",
                                                    WebkitLineClamp: 1,
                                                    WebkitBoxOrient: "vertical",
                                                    pt: 1,
                                                    textAlign: "left",
                                                }}
                                            >
                                                {disc.last_message}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                </Stack>
                            </Card>
                        ))}
                    </Stack>
                </Stack>


                {/* Colonne droite - Détails de la discussion */}
                <Card
                    sx={{
                        flexGrow: 1,
                        bgcolor: "#121212",
                        color: "#f5f5f5",
                        height: { xs: "100vh", md: "85vh" },
                        minHeight: 400,
                        display: selectedDiscussion ? { xs: "flex", md: "flex" } : { xs: "none", md: "flex" },
                        flexDirection: "column",
                        borderRadius: 3,
                        boxShadow: 6,
                        p: 0,
                        overflow: "hidden",

                    }}
                >
                    {selectedDiscussion ? (
                        <>
                            {/* Header */}
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2, px: 2, py: 1.5, borderBottom: "1px solid #333", bgcolor: "#1e1e1e" }}>
                                <Avatar sx={{ bgcolor: "#89CE94" }}>
                                    <PersonIcon />
                                </Avatar>
                                <Stack direction="column" alignItems="flex-start">
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                        {otherUser ? otherUser.username : "Utilisateur"}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: "gray", fontSize: "0.8rem" }}>
                                        {selectedDiscussion.created_at?.split("T")[0]}
                                    </Typography>
                                </Stack>
                            </Box>

                            {/* Contenu des messages */}
                            <Stack ref={messagesEndRef} spacing={5} sx={{ flexGrow: 1, overflowY: "auto", px: 2, py: 2, bgcolor: "#0d0d0d" }}>
                                {selectedDiscussion.map((msg, index) => (

                                    <Box
                                        key={index}
                                        sx={{
                                            alignSelf: msg.is_creator ? user.id === msg.creator_id ? "flex-end" : "flex-start" : user.id === msg.editor_id ? "flex-end" : "flex-start",
                                            maxWidth: "60%",
                                            bgcolor: msg.is_creator ? user.id === msg.creator_id ? "#3d5c42ff" : "#1e1e1e" : user.id === msg.editor_id ? "#3d5c42ff" : "#1e1e1e",
                                            px: 2,
                                            py: 1.5,
                                            borderRadius: msg.is_creator ? user.id === msg.creator_id ? "16px 16px 4px 16px" : "16px 16px 16px 4px" : user.id === msg.editor_id ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                                            boxShadow: 2,
                                        }}
                                    >

                                        <Typography
                                            variant="body1"
                                            sx={{
                                                whiteSpace: "pre-wrap",
                                                lineHeight: 1.5,
                                                fontSize: "0.95rem",
                                                textAlign: "left",
                                            }}
                                        >
                                            {msg.content}
                                        </Typography>

                                        <Typography variant="caption" sx={{ color: "#dadadaff" }}>
                                            {msg.created_at ? new Date(msg.created_at).toLocaleString().split(" ")[0] : ""}
                                        </Typography>
                                    </Box>
                                ))}

                                {messages.map((msg, index) => (

                                    <Box
                                        key={index}
                                        sx={{
                                            alignSelf: msg.is_creator ? user.id === creatorId ? "flex-end" : "flex-start" : user.id === editorId ? "flex-end" : "flex-start",
                                            maxWidth: "60%",
                                            bgcolor: msg.is_creator ? user.id === creatorId ? "#3d5c42ff" : "#1e1e1e" : user.id === editorId ? "#3d5c42ff" : "#1e1e1e",
                                            px: 2,
                                            py: 1.5,
                                            borderRadius: msg.is_creator ? user.id === creatorId ? "16px 16px 4px 16px" : "16px 16px 16px 4px" : user.id === editorId ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                                            boxShadow: 2,
                                        }}
                                    >
                                        <Typography variant="caption" sx={{ color: "#888" }}>
                                            {msg.created_at ? new Date(msg.created_at).toLocaleString().split(" ")[0] : ""}
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                whiteSpace: "pre-wrap",
                                                lineHeight: 1.5,
                                                fontSize: "0.95rem",
                                                textAlign: "left",
                                            }}
                                        >
                                            {msg.text}
                                        </Typography>
                                    </Box>
                                ))}

                            </Stack>
                            <Stack direction="row" alignItems="center" justifyContent="center" sx={{ mt: 0 }}>
                                <TextField
                                    placeholder="Écrire un message..."
                                    multiline
                                    minRows={1}
                                    maxRows={5}
                                    variant="filled"
                                    fullWidth

                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault(); // empêche le saut de ligne
                                            sendMessage(); // ta fonction d’envoi
                                        }
                                    }}
                                    sx={{
                                        p: 1,
                                        "& .MuiFilledInput-root": {

                                            borderRadius: "10px 10px 0 0",
                                            backgroundColor: "#1e1e1e",


                                            "&:before": { borderBottom: "1px solid #444" },
                                            "&:hover:before": { borderBottom: "2px solid #90caf9" },
                                            "&:after": { borderBottom: "2px solid #90caf9" },
                                        },
                                        "& .MuiFilledInput-input": {

                                            overflowY: "auto",
                                            maxHeight: 150,
                                            boxSizing: "border-box",
                                        },
                                    }}
                                />

                                <IconButton color="primary" sx={{ ml: 3, mr: 3 }}>
                                    <SendIcon />
                                </IconButton>
                            </Stack>


                        </>
                    ) : (
                        <Stack alignItems="center" justifyContent="center" sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" color="gray">
                                Sélectionnez une discussion pour voir les messages
                            </Typography>
                        </Stack>
                    )}
                </Card>
            </Stack>
        </Stack>

    );
}

export default Discussions;

