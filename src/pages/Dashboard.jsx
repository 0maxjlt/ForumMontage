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
    Input,
    CardActions,
    Checkbox,
    FormControlLabel,
    Stack,
} from "@mui/material";
import { CheckBox, DeleteForeverOutlined, Favorite, FavoriteBorder } from "@mui/icons-material";
import { yellow, red } from "@mui/material/colors";
import { DeleteForever } from "@mui/icons-material";
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';




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

    const handleSelect = (videoId) => {
        setVideos(videos.map(video =>
            video.id === videoId ? { ...video, selected: !video.selected } : video
        ));
    }

    const handleDelete = async (videoId) => {
        try {
            const res = await fetch(`http://localhost:3001/api/video_requests/${videoId}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (res.ok) {
                setVideos(videos.filter(video => video.id !== videoId));
            } else {
                console.error("Erreur lors de la suppression :", res.statusText);
            }
        } catch (err) {
            console.error("Erreur fetch suppression :", err);
        }
    };

    return (
        <DashboardContext.Provider value={{ user, videos }}>
            <Container sx={{}}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Tableau de bord
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Bienvenue, {user.username} ! Voici vos prochaines vidéos à produire.
                </Typography>

                {videos.length > 0 ? (
                    <>
                        <Grid container sx={{ mt: 2, gap: 2 }} >
                            {videos.map(video => (
                                <Grid item key={video.id} >
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
                                        <CardActions>
                                            <Stack display={"flex"} flexDirection="row" width="100%">
                                                <Checkbox
                                                    onChange={() => handleSelect(video.id)}
                                                />
                                                <Stack direction="row" spacing={1} alignItems="right" ml="auto">
                                                    <Checkbox
                                                        icon={<FavoriteBorder />}
                                                        checkedIcon={<Favorite />}
                                                        sx={{
                                                            color: yellow[800],
                                                            "&.Mui-checked": { color: yellow[600] },
                                                        }}
                                                        checked={Boolean(video.favorite)}
                                                        onChange={async (e) => {
                                                            e.stopPropagation();
                                                            const newValue = !video.favorite;

                                                            try {
                                                                const res = await fetch(
                                                                    `http://localhost:3001/api/video_requests/${video.id}/favorite`,
                                                                    {
                                                                        method: "PUT",
                                                                        headers: { "Content-Type": "application/json" },
                                                                        body: JSON.stringify({ favorite: newValue }),
                                                                        credentials: "include",
                                                                    }
                                                                );

                                                                if (res.ok) {
                                                                    // On met à jour **toutes les vidéos** et on les trie
                                                                    setVideos(prevVideos => {
                                                                        // 1️⃣ Mettre à jour la vidéo cliquée
                                                                        const updatedVideos = prevVideos.map(v =>
                                                                            v.id === video.id ? { ...v, favorite: !v.favorite } : v
                                                                        );

                                                                        // 2️⃣ Créer un nouveau tableau avant de trier
                                                                        const sortedVideos = [...updatedVideos].sort((a, b) => {
                                                                            // Favoris en premier
                                                                            if (b.favorite !== a.favorite) return b.favorite - a.favorite;

                                                                            // Puis par date décroissante
                                                                            return new Date(b.created_at) - new Date(a.created_at);
                                                                        });

                                                                        // 3️⃣ Retourner ce nouveau tableau -> React re-render
                                                                        console.log("Vidéos triées :", sortedVideos);
                                                                        return sortedVideos;
                                                                    });



                                                                }
                                                            } catch (err) {
                                                                console.error("Erreur mise à jour favori :", err);
                                                            }
                                                        }}
                                                    />




                                                    <IconButton
                                                        aria-label="delete"
                                                    >
                                                        <DeleteIcon
                                                            color="error"
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                if (confirm("Êtes-vous sûr de vouloir supprimer cette vidéo ?")) {
                                                                    await handleDelete(video.id);
                                                                }
                                                            }}
                                                        />
                                                    </IconButton>
                                                </Stack>
                                            </Stack>

                                        </CardActions>
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

                <Box display="flex" flexDirection="column" alignItems="center" textAlign="center" sx={{ m: 1, gap: 2 }}>

                    <Box sx={{ m: 2, gap: 2, display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
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
                                            status: "open",
                                            estimated_video_duration: "",
                                            estimated_rushes_duration: "",
                                            price_min: null,
                                            price_max: null,
                                            frequence: "",
                                            tags: "",
                                            favorite: false,
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

                        {(videos.filter(video => video.selected).length > 0) ? (
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={async () => {
                                    try {
                                        // Récupérer les vidéos sélectionnées
                                        const selectedVideos = videos.filter(video => video.selected);
                                        if (selectedVideos.length === 0) {
                                            alert("Veuillez sélectionner au moins une vidéo à supprimer.");
                                            return;
                                        }

                                        if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedVideos.length} vidéo(s) ? Cette action est irréversible.`)) {
                                            return;
                                        }
                                        // Supprimer les vidéos sélectionnées
                                        await Promise.all(selectedVideos.map(video =>
                                            fetch(`http://localhost:3001/api/video_requests/${video.id}`, {
                                                method: "DELETE",
                                                credentials: "include",
                                            })
                                        ));

                                        // Mettre à jour la liste des vidéos
                                        setVideos(videos.filter(video => !video.selected));
                                        alert("Vidéos supprimées avec succès.");
                                    } catch (err) {
                                        console.error("Erreur suppression vidéo :", err);
                                    }
                                }}
                            >
                                Supprimer vidéo
                            </Button>
                        )
                            : null

                        }
                    </Box>
                </Box>


            </Container>
        </DashboardContext.Provider>
    );
}

export default Dashboard;
