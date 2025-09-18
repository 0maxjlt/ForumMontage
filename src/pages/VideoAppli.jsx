import React, { useEffect, useState } from 'react';
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

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',

                color: '#fff',
                p: { xs: 2, md: 6 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
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
                        bgcolor: 'rgba(20, 20, 20, 0.9)',
                        backdropFilter: 'blur(6px)',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.6)',
                        border: '1px solid #333',
                    }}
                >
                    {/* Thumbnail */}
                    {video.thumbnail && (
                        <Box
                            component="img"
                            src={video.thumbnail}
                            alt="Miniature"
                            sx={{
                                width: '100%',
                                maxHeight: 280,
                                objectFit: 'cover',
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
                        <Box display="flex" flexDirection="column">
                            <Tooltip title={video.title}>
                                <Typography
                                    variant="h5"
                                    fontWeight="600"
                                    noWrap
                                    align="left"
                                    sx={{
                                        whiteSpace: 'pre-line',     // <-- Respecte les retours à la ligne de ta DB
                                        overflowWrap: 'break-word',
                                        maxWidth: "100%",
                                        color: "#f0f0f0",
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
                                        whiteSpace: 'pre-line',     // <-- Respecte les retours à la ligne de ta DB
                                        overflowWrap: 'break-word',
                                        maxWidth: "100%",
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

            {/* Formulaire de candidature */}
            <Card
                sx={{
                    width: '100%',
                    maxWidth: 720,
                    p: 4,
                    borderRadius: 3,
                    bgcolor: 'rgba(20, 20, 20, 0.85)',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid #333',
                }}
            >
                <Typography variant="h5" fontWeight="700" mb={3}>
                    Appliquer pour cette offre
                </Typography>

                {submitted ? (
                    <Typography color="success.main" sx={{ mt: 2 }}>
                        Merci pour votre candidature !
                    </Typography>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <Stack spacing={3}>
                            <TextField
                                label="Motivation"
                                value={motivation}
                                onChange={(e) => setMotivation(e.target.value)}
                                required
                                multiline
                                rows={5}
                                fullWidth
                                variant="filled"
                                InputProps={{
                                    sx: { bgcolor: '#1a1a1a', color: 'white', borderRadius: 2 },
                                }}
                                InputLabelProps={{ sx: { color: '#aaa' } }}
                            />
                            <Button
                                type="submit"
                                sx={{
                                    background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
                                    color: 'white',
                                    fontWeight: 700,
                                    py: 1.5,
                                    mt: 1,
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #1976d2, #21CBF3)',
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
        </Box>
    );
};

export default VideoAppli;
