import React, { useState, useEffect, use } from 'react';
import { Card, Stack, Typography, Box, Avatar, Divider, Button, Badge } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function Discussions() {
    const [discussions, setDiscussions] = useState([]);
    const [selectedDiscussion, setSelectedDiscussion] = useState(null);
    const [user, setUser] = useState(null);

    const navigate = useNavigate();
    



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
            })
            .catch((err) => console.error(err));
    }, []);

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
            {discussions.length === 0 && (
                <Typography>Aucune discussion disponible.</Typography>
            )}

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
                                        {selectedDiscussion.other_username || "Utilisateur"}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: "gray", fontSize: "0.8rem" }}>
                                        {selectedDiscussion.created_at?.split("T")[0]}
                                    </Typography>
                                </Stack>
                            </Box>

                            {/* Contenu des messages */}
                            <Stack spacing={2} sx={{ flexGrow: 1, overflowY: "auto", px: 2, py: 2, bgcolor: "#0d0d0d" }}>
                                {selectedDiscussion.map((msg, index) => (

                                    <Box
                                        key={index}
                                        sx={{
                                            alignSelf: msg.from_user ? "flex-end" : "flex-start",
                                            maxWidth: "80%",
                                            bgcolor: msg.from_user ? "#89CE94" : "#1e1e1e",
                                            px: 2,
                                            py: 1.5,
                                            borderRadius: "16px 16px 16px 4px",
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
                                    </Box>
                                ))}
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

