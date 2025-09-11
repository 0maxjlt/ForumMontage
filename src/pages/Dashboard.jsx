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

export const DashboardContext = createContext();

function Dashboard() {
    const [user, setUser] = useState(null);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("http://localhost:3001/api/video_requests", {
                    method: "GET",
                    credentials: "include" // ⚡ envoie le cookie
                });

                if (res.status === 401) {
                    navigate("/login"); // pas connecté
                    return;
                }

                const data = await res.json();

                setVideos(data); // toutes les vidéos reçues
                
                // Définir l'utilisateur connecté à partir de la première vidéo (si elle existe)
                if (data.length > 0) {
                    setUser({
                        id: data[0].creator_id,
                        username: data[0].creator_name,
                    });
                } else {
                    // si pas de vidéo, faire un fetch sur /api/me pour récupérer le user
                    const meRes = await fetch("http://localhost:3001/api/me", {
                        method: "GET",
                        credentials: "include"
                    });
                    if (meRes.status === 200) {
                        const meData = await meRes.json();
                        setUser(meData);
                    }
                }

            } catch (err) {
                console.error("Erreur fetch vidéos :", err);
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!user) return <p>Redirection...</p>;

    console.log("User:", user);

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
                    <>
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


                        <Typography variant="body1" color="text.secondary" mt={10} >
                            Ajouter une nouvelle vidéo à produire
                        </Typography>


                    </>
                ) : (

                    <Typography variant="body1" color="text.secondary" mt={10}>
                        Vous n’avez encore créé aucune vidéo. Cliquez sur “Créer une vidéo” pour commencer !
                    </Typography>

                )}

                <Box display="flex" flexDirection="column" alignItems="center" textAlign="center" sx={{ mt: 1 }}>

                    <Box justifyContent="center" alignItems="center" sx={{ m: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={async () => {
                                try {
                                    const res = await fetch("http://localhost:3001/api/video_requests", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        credentials: "include", // ⚡ envoie le cookie
                                        body: JSON.stringify({
                                            title: "Nouvelle vidéo",
                                            description: "",
                                            script: "",
                                            date: new Date(),
                                            status: "open",
                                            estimated_video_duration: "",
                                            estimated_rushes_duration: "",
                                            price_min: null,
                                            price_max: null,
                                            frequence: "",
                                        }),
                                    });

                                    if (!res.ok) {
                                        console.error("Erreur création vidéo :", await res.json());
                                        return;
                                    }

                                    const newVideo = await res.json();

                                    // Naviguer vers la page de la nouvelle vidéo
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


            </Container>
        </DashboardContext.Provider>
    );
}

export default Dashboard;
