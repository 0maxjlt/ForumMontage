import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import Grid2 from '@mui/material/Grid2';
import MyBreadcrumbs from "../components/Breadcrumbs";

function Dashboard() {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    });
    
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        console.log(storedUser);
        if (storedUser) {
            const userParsed = JSON.parse(storedUser); // On parse la donnée JSON
            if (!userParsed.email) {
                navigate("/login");
            } else {
                setUser(userParsed);
            }
        } else {
            navigate("/login"); // Redirection si aucun user en localStorage
        }
    }, [navigate]);

    if (!user) {
        return <p>Chargement...</p>;
    }

    return (
        <>

        <div>
            <h1 className="text-2xl font-bold mb-4">Tableau de bord</h1>
            <p>Bienvenue, {user.email} !</p>
    
            <div className="mt-4">
                <h2 className="text-xl font-semibold mb-2">Vos vidéos :</h2>
    
                {user.videos.length > 0 ? (
                    <Grid2
                        sx={{ 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            gap: 3,
                            justifyContent: 'center', // Centre horizontalement
                            alignItems: 'center' // Centre verticalement
                        }}
                    >
                        {user.videos.map((video) => (
                            <Grid2 key={video.id}>
                                <Card sx={{ maxWidth: 350, minWidth: 280, width: '100%', display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <CardActionArea onClick={() => navigate(`/dashboard/${video.id}`)}>
                                        <CardMedia
                                            component="img"
                                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            image={video.thumbnail || "src/assets/image.png"}
                                            alt={video.title || "Pas de miniature"}
                                        />
                                        <CardContent >
                                            <Typography 
                                                gutterBottom 
                                                variant="h7" 
                                                component="div"
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
                                                    textOverflow: 'ellipsis'

                                                    
                                                }}
                                            >
                                                {video.description}
                                            </Typography>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Grid2>
                        ))}
                    </Grid2>
                ) : (
                    <p>Aucune vidéo disponible.</p>
                )}
            </div>
        </div>
        </>
    );
}    

export default Dashboard;
