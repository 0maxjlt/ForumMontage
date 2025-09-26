import React, { useState, useEffect, use } from 'react';

import { useNavigate } from 'react-router-dom';

import { Card, CardContent, CardHeader, Button, Divider, Stack, Typography, Box } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import PersonIcon from '@mui/icons-material/Person';
import { nav } from 'framer-motion/client';


function Discussions() {
    const [discussions, setDiscussions] = useState([]);
    const [applications, setApplications] = useState([]);
    const [selectedApp, setSelectedApp] = useState(null);

    const navigate = useNavigate();



    useEffect(() => {

        fetch("/api/applications_list", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(
                        `Erreur lors de la récupération des candidatures (status ${response.status})`
                    );
                }
                return response.json();
            })
            .then((data) => {
                if (data.applications) {
                    console.log("Candidatures récupérées :", data.applications);
                    setApplications(data.applications);
                }
            })
            .catch((err) => console.error(err));
    }, []);



    return (
        <Stack spacing={2} sx={{ p: 0, m: 0 }}>
            {/* Titre */}
            <Typography variant="h4">Demandes de message</Typography>

            {/* Message si aucune demande */}
            {applications.length === 0 && (
                <Typography>Aucune demande de message.</Typography>
            )}

            {/* Layout responsive */}
            <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
               
            >
                {/* Colonne gauche - Liste */}
                <Stack
                    spacing={2}
                    sx={{
                        width: { xs: "100%", md: "300px" },

                        display: selectedApp && { xs: "none", md: "flex" }, // 👉 cacher la liste en mobile si détail ouvert
                    }}
                >
                    {applications.map((app) => (
                        <Card
                            key={app.id}
                            sx={{
                                bgcolor: "#030303ff",
                                p: 2,
                                transition:
                                    "transform 0.3s ease-in-out, background-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                                ":hover": {
                                    transform: "scale(1.02)",
                                    boxShadow: 6,
                                    bgcolor: "#1e1e1e",
                                },
                                cursor: "pointer",
                                minWidth: { xs: "100%", sm: "300px" },
                                height: 120,
                            }}
                            onClick={() => setSelectedApp(app)}
                        >
                            <Stack spacing={1}>
                                <Stack direction="row" spacing={1} alignItems="flex-start">
                                    <Avatar sx={{ bgcolor: "#89CE94" }}>
                                        <PersonIcon />
                                    </Avatar>
                                    <Stack direction="column" spacing={0.5} flexGrow={1}>
                                        <Stack
                                            direction="row"
                                            justifyContent="space-between"
                                            width="100%"
                                        >
                                            <Stack direction="column" alignItems="flex-start">
                                                <Typography sx={{ fontSize: "1rem", fontWeight: 500 }}>
                                                    {app.username || "Utilisateur"}
                                                </Typography>
                                                <Typography
                                                    sx={{
                                                        fontSize: "0.9rem",
                                                        color: "text.secondary",
                                                        fontWeight: 300,
                                                    }}
                                                >
                                                    {app.created_at?.split("T")[0]}
                                                </Typography>
                                            </Stack>
                                            <Typography
                                                sx={{
                                                    fontSize: "0.9rem",
                                                    color: "text.secondary",
                                                    fontWeight: 300,
                                                }}
                                            >
                                                {`Statut: ${app.statut}`}
                                            </Typography>
                                        </Stack>
                                        <Divider sx={{ width: "100%" }} />
                                        <Stack direction="row" alignItems="flex-start" pt={1} >
                                            <Typography
                                                sx={{
                                                    fontSize: "0.95rem",
                                                    fontWeight: 200,
                                                    color: "text.secondary",
                                                    textAlign: "left",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    display: "-webkit-box",
                                                    WebkitLineClamp: 1,
                                                    WebkitBoxOrient: "vertical",
                                                }}
                                            >
                                                {app.message}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                </Stack>
                            </Stack>
                        </Card>
                    ))}
                </Stack>

                {/* Colonne droite - Détails */}
                <Card
                    sx={{
                        flexGrow: 1,
                        bgcolor: "#121212", // fond sombre
                        color: "#f5f5f5",
                        height: { xs: "100vh", md: "70vh" },
                        minHeight: 400,
                        display: selectedApp ? { xs: "flex", md: "flex" } : { xs: "none", md: "flex" },
                        flexDirection: "column",
                        borderRadius: 3,
                        boxShadow: 6,
                        p: 0,
                        overflow: "hidden",
                    }}
                >
                    {selectedApp ? (
                        <>
                            {/* HEADER FIXE */}
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                    px: 2,
                                    py: 1.5,
                                    borderBottom: "1px solid #333",
                                    bgcolor: "#1e1e1e",
                                }}
                            >
                                <Avatar sx={{ bgcolor: "#89CE94" }}>
                                    <PersonIcon />
                                </Avatar>
                                <Stack direction="column" alignItems="flex-start">
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                        {selectedApp.username || "Utilisateur"}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{ color: "gray", fontSize: "0.8rem" }}
                                    >
                                        {selectedApp.created_at?.split("T")[0]}
                                    </Typography>
                                </Stack>
                            </Box>

                            {/* CONTENU MESSAGES */}
                            <Stack
                                spacing={2}
                                sx={{
                                    flexGrow: 1,
                                    overflowY: "auto",
                                    px: 2,
                                    py: 2,
                                    bgcolor: "#0d0d0d",
                                }}
                            >
                                {/* Message reçu */}
                                <Box
                                    sx={{
                                        alignSelf: "flex-start",
                                        maxWidth: "80%",
                                        bgcolor: "#1e1e1e",
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
                                        {selectedApp.message}
                                    </Typography>
                                </Box>
                            </Stack>

                            <Stack direction="row" justifyContent="space-between" sx={{borderTop: "1px solid #333", bgcolor: "#1e1e1e" }}>
                                <Button sx={{  px: 2, py: 1, flexGrow: 1 }} variant="text" color="primary"> Accepter </Button>
                                <Button sx={{  px: 2, py: 1, flexGrow: 1 }} variant="text" color="error"> Refuser </Button>
                            </Stack>

                            {/* FOOTER MOBILE - RETOUR */}
                            <Box
                                sx={{
                                    px: 2,
                                    py: 1.5,
                                    borderTop: "1px solid #333",
                                    display: { xs: "flex", md: "none" },
                                    justifyContent: "center",
                                    bgcolor: "#1e1e1e",
                                }}
                            >
                                <Typography
                                    onClick={() => setSelectedApp(null)}
                                    sx={{
                                        color: "#89CE94",
                                        fontWeight: 500,
                                        cursor: "pointer",
                                    }}
                                >
                                    ← Retour aux demandes
                                </Typography>
                            </Box>
                        </>
                    ) : (
                        <Stack
                            alignItems="center"
                            justifyContent="center"
                            sx={{ flexGrow: 1 }}
                        >
                            <Typography variant="h6" color="gray">
                                Sélectionnez une demande pour voir les détails
                            </Typography>
                        </Stack>
                    )}
                </Card>

            </Stack>
        </Stack>


    );
}

export default Discussions;
