import React, { use, useEffect, useState } from 'react';
import {
    Stack,
    Typography,
    TextField,
    Button,
    Card,
    CardContent,
    Chip,
    Box,
    CircularProgress,
    Avatar,
    Divider,
    Tooltip
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageContext } from "../components/Context";
import PersonIcon from "@mui/icons-material/Person";
import { s } from 'framer-motion/client';

const VideoAppli = () => {
    const [motivation, setMotivation] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);



    const { setMessage } = React.useContext(MessageContext);
    const { username, videoId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const res = await fetch(`http://localhost:3001/api/videos/${username}/${videoId}`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!res.ok) throw new Error(`Vidéo introuvable ou non autorisée (status ${res.status})`);
                const data = await res.json();
                setVideo(data);
            } catch (err) {
                setMessage({ text: "Merci de vous connecter pour accéder à cette vidéo.", target: 'login' });
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchVideo();
    }, [username, videoId]);

    useEffect(() => {
        fetch(`http://localhost:3001/api/applications/${videoId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        })
            .then((res) => {
                if (!res.ok) throw new Error(`Erreur lors de la vérification de la candidature (status ${res.status})`);
                return res.json();
            })
            .then((data) => {
                if (data.result === 'exists') {
                    console.log(data.created);
                    setMotivation(data.application.message);
                    setSubmitted(true);
                }
            })
            .catch((err) => {
                console.error(err);
            });
    }, [navigate]);


    const handleSubmit = (e) => {
        e.preventDefault();

        fetch(`http://localhost:3001/api/applications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                video_id: videoId,
                message: motivation,
            }),
        })
            .then((res) => {
                if (!res.ok) throw new Error(`Erreur lors de l'envoi de la candidature (status ${res.status})`);
                
                setSubmitted(true);
                console.log("Candidature envoyée :", { video_id: videoId, motivation });
                
            })
            .catch((err) => {
                setMessage({ text: err.message || "Erreur lors de l'envoi de la candidature.", target: 'video' });
                setSubmitted(false);
            });

    };

    return (
        <Box
            sx={{
                display: 'flex',
                minHeight: '100vh',
                color: '#fff',
                p: { xs: 2, md: 6 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {loading && <CircularProgress color="secondary" sx={{ mt: 4 }} />}

            {video && (
                <Card
                    sx={{
                        width: '100%',
                        maxWidth: 720,

                        mb: 4,
                        borderRadius: 3,
                        overflow: 'hidden',
                        bgcolor: '#050505ff',

                    }}
                >
                    {/* Thumbnail */}
                    {video.thumbnail && (
                        <Box
                            component="img"
                            src={video.thumbnail}
                            alt="Miniature"
                            sx={{
                                width: "100%",
                                aspectRatio: "16 / 9",   // garde un format constant
                                objectFit: "cover",      // remplit sans déformer
                                maxHeight: 300,
                            }}
                        />


                    )}

                    <CardContent>
                        {/* Header */}
                        <Box display="flex" alignItems="center" flexDirection="row" mb={2}>
                            <Avatar sx={{ bgcolor: "#89CE94", mr: 2 }}>
                                <PersonIcon />
                            </Avatar>
                            <Box
                                display="flex"
                                flexDirection="row"
                                justifyContent="space-between"
                                width="100%"
                            >
                                <Typography fontWeight={500} variant="body1" noWrap>
                                    {video.creator_name}
                                </Typography>
                                <Typography variant="caption" color="gray">
                                    {video.video_created_at?.split("T")[0]}
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ bgcolor: "#2d2d2d", mb: 2 }} />

                        {/* Title + Description */}
                        <Box display="flex" flexDirection="column" sx={{ minWidth: 0 }}>
                            <Tooltip title={video.title}>
                                <Typography
                                    variant="h5"
                                    fontWeight="600"
                                    align="left"
                                    sx={{
                                        whiteSpace: 'pre-line',
                                        overflowWrap: 'anywhere',   // meilleure compatibilité moderne
                                        wordBreak: 'break-word',
                                        hyphens: 'auto',
                                        width: '100%',
                                        minWidth: 0,
                                    }}
                                >
                                    {video.title}
                                </Typography>
                            </Tooltip>

                            <Tooltip title={video.description}>
                                <Typography
                                    variant="body2"
                                    color="gray"
                                    align="left"
                                    sx={{
                                        whiteSpace: 'pre-line',
                                        overflowWrap: 'anywhere',
                                        wordBreak: 'break-word',
                                        hyphens: 'auto',
                                        width: '100%',
                                        minWidth: 0,
                                    }}
                                >
                                    {video.description}
                                </Typography>
                            </Tooltip>
                        </Box>
                        <Divider sx={{ bgcolor: "#2d2d2d", my: 2 }} />

                        {/* Durées + Prix */}
                        <Stack
                            display="flex"
                            flexDirection="row"
                            justifyContent="space-between"
                        >
                            <Stack display="flex" flexDirection="column">
                                <Typography display="flex" variant="body2">
                                    Durée estimée:&nbsp;
                                    <span style={{ color: "#58a6ff" }}>
                                        {video.estimated_video_duration || 0} min
                                    </span>
                                </Typography>
                                <Typography display="flex" variant="body2">
                                    Durée rushs:&nbsp;
                                    <span style={{ color: "#58a6ff" }}>
                                        {video.estimated_rushes_duration || 0} min
                                    </span>
                                </Typography>
                            </Stack>

                            <Typography display="flex" variant="body2">
                                Prix estimé:&nbsp;
                                <span style={{ color: "#58a6ff" }}>
                                    {video.price_min || 0} - {video.price_max || 0} €
                                </span>
                            </Typography>
                        </Stack>

                        {/* Tags */}
                        <Stack
                            display="flex"
                            flexDirection="row"
                            flexWrap="wrap"
                            gap={1}
                            mt={2}
                        >
                            {video.tags?.length > 0 ? (
                                <Tooltip title={video.tags.join(", ")}>
                                    <Stack display="flex" flexWrap="wrap" flexDirection="row" gap={1}>
                                        {video.tags.map((tag, index) => (
                                            <Chip
                                                key={index}
                                                label={tag}
                                                sx={{
                                                    bgcolor: "#385a3b",
                                                    color: "white",
                                                    maxWidth: 200,
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                }}
                                            />
                                        ))}
                                    </Stack>
                                </Tooltip>
                            ) : (
                                <Typography variant="body2" color="gray">
                                    Aucun tag
                                </Typography>
                            )}
                        </Stack>
                    </CardContent>
                </Card>
            )}


            {submitted && !loading && video && (
                <Stack>
                    <Typography variant="body2" color="gray">
                        {motivation}
                    </Typography>
                </Stack>
            )}

            {/* Formulaire de candidature */}
            {!submitted && !loading && video && (
                <Card
                    sx={{
                        width: '100%',
                        maxWidth: 720,
                        p: 4,
                        borderRadius: 3,
                        bgcolor: '#050505ff',
                    }}
                >
                    <Typography variant="h5" fontWeight="400" justifyContent={"flex-start"} mb={3}>
                        Envoyer une message au créateur
                    </Typography>

                    {submitted ? (
                        <Stack spacing={2} alignItems="center">
                            <Typography color="green">{motivation}</Typography>
                        </Stack>

                    ) : (
                        <form onSubmit={handleSubmit}>
                            <Stack spacing={3}>
                                <TextField
                                    label="Message"
                                    value={motivation}
                                    onChange={(e) => setMotivation(e.target.value)}
                                    required
                                    multiline
                                    rows={6}
                                    fullWidth
                                    variant="filled"
                                    placeholder={"Explique en quelques lignes pourquoi tu serais le monteur idéal pour cette vidéo..."}
                                    helperText="Un message clair et complet aide le créateur à mieux te connaître."
                                    InputProps={{
                                        sx: { bgcolor: '#1a1a1a', color: 'white', borderRadius: 2 },
                                    }}
                                    InputLabelProps={{ sx: { color: '#aaa' } }}
                                />

                                <Button
                                    type="submit"
                                    sx={{
                                        background: '#46965eff',
                                        color: 'white',
                                        fontWeight: 700,
                                        py: 1.5,
                                        mt: 1,
                                        '&:hover': {
                                            background: '#357e4bff',
                                            transform: 'scale(1.02)',
                                        },
                                        transition: 'all 0.2s ease-in-out',
                                    }}
                                >
                                    Envoyer la candidature
                                </Button>
                            </Stack>
                        </form>
                    )}
                </Card>
            )}
        </Box>
    );
};

export default VideoAppli;
