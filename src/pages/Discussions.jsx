import React, { useState, useEffect, use } from 'react';

import { useNavigate } from 'react-router-dom';

import { Card, CardContent, CardHeader, Divider, Stack, Typography, Box } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import PersonIcon from '@mui/icons-material/Person';


function Discussions() {
    const [discussions, setDiscussions] = useState([]);
    const [applications, setApplications] = useState([]);


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
        <Stack spacing={2} padding={2}>
            <Typography variant="h4"> Demandes de message</Typography>
            {applications.length === 0 && <Typography>Aucune demande de message.</Typography>}
            <Stack spacing={2} display="flex" flexDirection="column">
                {applications.map((app) => (
                    <>
                        <Card key={app.id}
                            sx={{
                                bgcolor: "#030303ff", p: 2,
                                transition: "transform 0.3s ease-in-out, background-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                                ":hover": { transform: "scale(1.02)", boxShadow: 6, bgcolor: "#1e1e1e" }, cursor: "pointer"
                            }}
                            onClick={() => navigate(`/discussion/${app.application_id}`)}>

                            <Stack spacing={1}>

                                <Stack direction="row" spacing={1} alignItems="flex-start">

                                    <Avatar sx={{ bgcolor: "#89CE94", flexShrink: 0 }}>
                                        <PersonIcon />
                                    </Avatar>


                                    <Stack direction="column" spacing={0.5} flexGrow={1} alignItems={"flex-start"}>

                                        <Stack direction="row" justifyContent="space-between" width={"100%"}>
                                            <Stack direction="column" justifyContent="space-between" alignItems="flex-start">
                                                <Typography sx={{ fontSize: "1rem", fontWeight: 500 }}>
                                                    {app.username || "Utilisateur"}
                                                </Typography>
                                                <Typography sx={{ fontSize: "0.9rem", color: "text.secondary", fontWeight: 300 }}>
                                                    {`${app.created_at?.split("T")[0]} `}
                                                </Typography>
                                            </Stack>

                                            <Typography sx={{ fontSize: "0.9rem", color: "text.secondary", fontWeight: 300 }}>
                                                {`Statut: ${app.statut}`}
                                            </Typography>
                                        </Stack>
                                        <Divider sx={{ width: "100%" }} />
                                        <Typography sx={{ fontSize: "0.95rem", fontWeight: 400, color: "text.secondary", mt: 1 }}>
                                            {app.message}
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </Stack>
                        </Card>




                        <Divider />
                    </>

                ))}
            </Stack >
        </Stack>
    );
}

export default Discussions;
