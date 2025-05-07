import React, { use, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Grid2,
  Divider,
  Chip,
  Box,
  Tooltip
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import MenuIcon from "@mui/icons-material/Menu";
import {
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  InputBase,
  AppBar,
  Toolbar
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import { useNavigate } from "react-router-dom";
import { video } from "framer-motion/client";

function Forum() {
  const [videos, setVideos] = useState([]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrage local des vidéos
  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );


  const navigate = useNavigate();



  // Pas besoin de serv ici, on peut directement faire la requête

  useEffect(() => {
    fetch("http://localhost:3001/forum", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setVideos(data.data);
        } else {
          console.log("Aucune vidéo trouvée");
        }
      })
      .catch((err) => {
        console.error("Erreur lors de la récupération des vidéos :", err);
      });
  }, []);

  return (
    <>

      <IconButton
        edge="start"
        color="inherit"
        aria-label="menu"
        onClick={() => setDrawerOpen(true)}
        sx={{ mr: 2 }}
      >
        <MenuIcon />
      </IconButton>

      <Drawer
        variant="permanent"
        anchor="left"
        sx={{
          width: 240,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: 240,
            boxSizing: "border-box",
            backgroundColor: "#0d1117",
            color: "white",
            p: 2,
          },
        }}
      >
        <Typography variant="h6" gutterBottom>
          Navigation
        </Typography>

        {/* Barre de recherche */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            bgcolor: "#161b22",
            p: "2px 8px",
            borderRadius: 2,
            mb: 2,
          }}
        >
          <SearchIcon sx={{ color: "gray", mr: 1 }} />
          <InputBase
            placeholder="Rechercher une vidéo"
            sx={{ color: "white", flex: 1 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Box>

        <List>
          <ListItem button>
            <ListItemText primary="Mon profil" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Créer une vidéo" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Mes vidéos" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Déconnexion" />
          </ListItem>
        </List>
      </Drawer>


      <Box sx={{ padding: 20, justifyContent: "center", alignItems: "center" }}>
        <Typography
          variant="h4"
          color="white"
          gutterBottom
          sx={{ fontWeight: 600, textAlign: "left", mb: 4 }}
        >
          Forum – Propositions de vidéos
        </Typography>

        <Grid2 container spacing={4} justifyContent={"center"} textAlign={"left"}>

          {filteredVideos.map((video) => (
            <Grid2 item xs={12} sm={6} md={4} key={video.id} maxWidth={400} onClick={() => navigate(`/forum/${video.id}`)}>
              <Card
                sx={{
                  bgcolor: "#161b22",
                  color: "white",
                  borderRadius: 3,
                  boxShadow: "0px 4px 20px rgba(0,0,0,0.3)",
                  transition: "transform 0.3s ease-in-out, background-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                  "&:hover": {
                    transform: "scale(1.025)",
                    boxShadow: "0px 4px 30px rgba(0,0,0,0.5)",
                    bgcolor: "#21262d",
                  },
                  cursor: "pointer",
                }}


              >

                <CardContent >
                  {/* Header */}
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ bgcolor: "#30363d", mr: 2 }}>
                      <PersonIcon />
                    </Avatar>
                    <Box >
                      <Typography
                        fontWeight={500}
                        variant="body1"
                        noWrap
                        sx={{ maxWidth: 180 }}
                      >
                        {video.username}
                      </Typography>
                      <Typography variant="caption" color="gray">
                        {video.date}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ bgcolor: "#2d2d2d", mb: 2 }} />

                  {/* Titre */}
                  <Tooltip title={video.title}>
                    <Typography
                      variant="h6"
                      fontWeight="600"
                      noWrap

                    >
                      {video.title}
                    </Typography>
                  </Tooltip>

                  {/* Description */}
                  <Typography
                    variant="body2"
                    color="gray"
                    noWrap
                  >
                    {video.description}
                  </Typography>

                  <Divider sx={{ bgcolor: "#2d2d2d", my: 2 }} />

                  {/* Durées */}
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Durée estimée :{" "}
                    <span style={{ color: "#58a6ff" }}>
                      {video.estimatedVideoDuration}
                    </span>
                  </Typography>
                  <Typography variant="body2">
                    Durée rushs :{" "}
                    <span style={{ color: "#58a6ff" }}>
                      {video.estimatedRushesDuration}
                    </span>
                  </Typography>

                  {/* Tags + Status */}
                  <Box
                    mt={2}
                    display="flex"
                    flexWrap="wrap"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box display="flex" flexWrap="wrap" maxWidth="70%">
                      {video.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          sx={{
                            bgcolor: "#238636",
                            color: "white",
                            fontSize: "0.75rem",
                            mr: 1,
                            mb: 1,
                          }}
                        />
                      ))}
                    </Box>
                    <Typography
                      variant="body2"
                      fontStyle="italic"
                      sx={{ color: "#c9d1d9", whiteSpace: "nowrap" }}
                    >
                      {video.status}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid2>
          ))}
        </Grid2>
      </Box>
    </>
  );
}

export default Forum;
