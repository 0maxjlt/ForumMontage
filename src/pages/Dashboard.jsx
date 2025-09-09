import { useEffect, useState, createContext } from "react";
import { useNavigate } from "react-router-dom";
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    CardActionArea,
    Grid,
    Container,
    CircularProgress,
    Box,
    Button,
} from '@mui/material';

// Contexte global pour le Dashboard (si tu veux le passer à d'autres composants)
export const DashboardContext = createContext();

function Dashboard() {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            navigate("/login");
            return;
        }

        const userParsed = JSON.parse(storedUser);
        if (!userParsed.email) {
            navigate("/login");
            return;
        }
        setUser(userParsed);

        // Récupérer les vidéos créées par l'utilisateur
        const fetchVideos = async () => {
            try {
                const res = await fetch("http://localhost:3001/api/video_requests");
                const allVideos = await res.json();
                const userVideos = allVideos.filter(v => v.creator_id === userParsed.id);
                setVideos(userVideos);
            } catch (err) {
                console.error("Erreur fetch vidéos :", err);
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, [navigate]);

    if (!user) return <p>Chargement...</p>;
    if (loading) return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
            <CircularProgress />
        </Box>
    );

    return (
        <DashboardContext.Provider value={{ user, videos }}>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Tableau de bord
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Bienvenue, {user.username} ! Voici vos prochaines vidéos à produire.
                </Typography>

                {videos.length > 0 ? (
                    <Grid container spacing={3} sx={{ mt: 2 }}>
                        {videos.map(video => (
                            <Grid item key={video.id} xs={12} sm={6} md={4} lg={3}>
                                <Card
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '100%',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-5px)',
                                            boxShadow: 6,
                                        }
                                    }}
                                >
                                    <CardActionArea onClick={() => navigate(`/dashboard/${video.id}`)}>
                                        <CardMedia
                                            component="img"
                                            height="180"
                                            image={video.thumbnail || "/src/assets/image.png"}
                                            alt={video.title || "Pas de miniature"}
                                        />
                                        <CardContent>
                                            <Typography
                                                gutterBottom
                                                variant="h6"
                                                sx={{
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                            >
                                                {video.title}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                            >
                                                {video.description || "Pas de description"}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{ mt: 1, display: 'block' }}
                                            >
                                                Statut : {video.status || "open"}
                                            </Typography>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Box
                        display={"flex"}
                        flexDirection="column"
                        alignItems="center"
                        textAlign="center"
                        sx={{ mt: 4 }}
                    >
                        <Box display="flex" flexDirection="column" alignItems="center" textAlign="center" sx={{ mt: 4 }}>
                            <Typography variant="body1" color="text.secondary" sx={{ m: 10 }}>
                                Vous n’avez encore créé aucune vidéo. Cliquez sur “Créer une vidéo” pour commencer !
                            </Typography>

                            <Box justifyContent="center" alignItems="center" sx={{ m: 2 }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={async () => {
                                        try {
                                            const storedUser = localStorage.getItem("user");
                                            if (!storedUser) return navigate("/login");
                                            const user = JSON.parse(storedUser);

                                            const res = await fetch("http://localhost:3001/api/video_requests", {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({
                                                    title: "Nouvelle vidéo",
                                                    description: "",
                                                    creator_id: user.id,
                                                }),
                                            });

                                            const newVideo = await res.json();

                                            // Navigue vers la page du dashboard avec l'id réel généré
                                            navigate(`/dashboard/${newVideo.id}`);
                                        } catch (err) {
                                            console.error("Erreur création vidéo :", err);
                                        }
                                    }}
                                >
                                    Créer une vidéo
                                </Button>
                            </Box>
                        </Box>

                    </Box>

                )}
            </Container>
        </DashboardContext.Provider>
    );
}

export default Dashboard;
