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
  Tooltip,
  InputBase,
  AppBar,
  Toolbar,
  Stack
} from "@mui/material";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";

import { useNavigate } from "react-router-dom";
import { video } from "framer-motion/client";

import MyDrawer from "../components/MyDrawer";
import MyAppBar from "../components/ForumComponents/MyAppBar";
import { grey } from "@mui/material/colors";

function Forum() {
  const [videos, setVideos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPrice, setSelectedPrice] = useState([0, 100]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);

  // Filtrage local des vidéos
  const filteredVideos = videos.filter(video => {
    const matchesSearch =
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = selectedStatus === "" || video.status === selectedStatus;

    const matchesPrice =
      !selectedPrice || // si aucun filtre n’est appliqué
      (
        video.price[1] >= selectedPrice[0] && // max vidéo ≥ min sélectionné
        video.price[0] <= selectedPrice[1]    // min vidéo ≤ max sélectionné
      );

    return matchesSearch && matchesStatus && matchesPrice;
  });


  const items = ["620 - Montage", "132 - Motion Design", "Autre", "Autre 2", "Autre 3", "Autre 4", "Autre 5", "Autre 6", "Autre 7", "Autre 8", "Autre 9", "Autre 10"];


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



      <Box sx={{ display: "flex" }}>
        <Box sx={{ justifyContent: "center", alignItems: "center", flexGrow: 1 }}>

          <Typography
            variant="h4"
            color="white"
            gutterBottom
            sx={{ fontWeight: 600, textAlign: "left", mb: 4 }}
          >
            Forum – Propositions de vidéos
          </Typography>

          <Box m={2}>

            <MyAppBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectedPrice={selectedPrice} setSelectedPrice={setSelectedPrice} items={items} selectedItems={selectedItems} setSelectedItems={setSelectedItems}></MyAppBar>

          </Box>

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
                      <Avatar sx={{ bgcolor: "#89CE94", mr: 2 }}>
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

                    <Stack direction="row" justifyContent="space-between" gap={2} >
                      <Stack direction="column">
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
                      </Stack>

                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Prix estimé :{" "}
                        <span style={{ color: "#58a6ff" }}>
                          {video.price[0]} - {video.price[1]} €
                        </span>
                      </Typography>


                    </Stack>

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
      </Box>
    </>
  );
}

export default Forum;
