import React, { use, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Divider,
  Box,
  Tooltip,
  Stack,
  Chip,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate } from "react-router-dom";

import MyAppBar from "../components/ForumComponents/MyAppBar";

function Forum() {
  const [videos, setVideos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPrice, setSelectedPrice] = useState([0, 100]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);

  const navigate = useNavigate();

  const items = [
    "620 - Montage",
    "132 - Motion Design",
    "Autre",
    "Autre 2",
    "Autre 3",
    "Autre 4",
    "Autre 5",
    "Autre 6",
    "Autre 7",
    "Autre 8",
    "Autre 9",
    "Autre 10",
  ];

  useEffect(() => {
    fetch("http://localhost:3001/api/publicVideos")
      .then((res) => res.json())
      .then((data) => setVideos(data))
      .catch((err) => console.error(err));
  }, [navigate]);


  useEffect(() => {
    console.log("Vidéos chargées :", videos);
  }, [videos]);

  // Filtrage local des vidéos
  const filteredVideos = videos.filter((video) => {
    const matchesSearch =
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus =
      selectedStatus === "" || video.status === selectedStatus;

    const matchesPrice =
      !selectedPrice ||
      (video.price_max >= selectedPrice[0] && video.price_min <= selectedPrice[1]);

    return matchesSearch && matchesStatus && matchesPrice;
  });

  return (
    <>
      <Typography
        variant="h4"
        color="white"
        gutterBottom
        sx={{ fontWeight: 600, mb: 4 }}
      >
        Forum – Propositions de vidéos
      </Typography>


      <MyAppBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedPrice={selectedPrice}
        setSelectedPrice={setSelectedPrice}
        items={items}
        selectedItems={selectedItems}
        setSelectedItems={setSelectedItems}
      />


      <Stack
        direction="row"
        flexWrap="wrap"
        justifyContent="center"
        gap={4} // espace horizontal et vertical entre les cards
      >
        {filteredVideos.map((video) => (
          <Box
            key={video.id}
            onClick={() => navigate(`/video/${video.username}/${video.video_id}`)}
          >
            <Card
              sx={{
                width: 400,
                height: 270,
                bgcolor: "#161b22",
                color: "white",
                borderRadius: 5,
                boxShadow: "0px 4px 20px rgba(0,0,0,0.3)",
                transition:
                  "transform 0.3s ease-in-out, background-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                "&:hover": {
                  transform: "scale(1.025)",
                  boxShadow: "0px 4px 30px rgba(0,0,0,0.5)",
                  bgcolor: "#21262d",
                },
                cursor: "pointer",
              }}
            >
              <CardContent>
                {/* Header */}
                <Box display="flex" alignItems="center" flexDirection="row" mb={2}>

                  <Avatar sx={{ bgcolor: "#89CE94", mr: 2 }}>
                    <PersonIcon />
                  </Avatar>
                  <Box display="flex" flexDirection="row" justifyContent="space-between" width="100%">
                    <Typography fontWeight={500} variant="body1" noWrap>
                      {video.username}
                    </Typography>
                    <Typography variant="caption" color="gray">
                      {video.video_created_at.split("T")[0]}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ bgcolor: "#2d2d2d", mb: 2 }} />

                <Box display="flex" flexDirection="column" >
                  <Tooltip title={video.title}>
                    <Typography
                      
                      variant="h6"
                      fontWeight="400"
                      noWrap
                      align="left"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "100%", // important pour que l'ellipsis s'applique
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
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "100%", // pareil ici
 
                    }}
                  >
                    {video.description}
                  </Typography>
                  </Tooltip>
                </Box>



                <Divider sx={{ bgcolor: "#2d2d2d", my: 2 }} />

                <Stack display="flex" flexDirection="row" justifyContent="space-between" >
                  <Stack display="flex" flexDirection="column"  >
                    <Typography display="flex" variant="body2">
                      Durée estimée: &nbsp; <span style={{ color: "#58a6ff" }}>{video.estimated_video_duration || 0} min </span>
                    </Typography>
                    <Typography display="flex" variant="body2">
                      Durée rushs: &nbsp; <span style={{ color: "#58a6ff" }}>{video.estimated_rushes_duration || 0} min </span>
                    </Typography>
                  </Stack>

                  <Typography display="flex" variant="body2">
                    Prix estimé: &nbsp; <span style={{ color: "#58a6ff" }}> {video.price_min || 0} - {video.price_max || 0} € </span>
                  </Typography>
                </Stack>



                <Stack display={"flex"} flexDirection="row" flexWrap="wrap" gap={1} mt={1}>

                  {video.tags.length > 0 ? (
                    <Tooltip title={video.tags.join(", ")}>
                      <Stack display="flex" flexWrap="wrap" flexDirection="row" gap={1}>
                        {video.tags.map((tag, index) => (
                          <Chip
                            key={index}
                            label={tag}
                            sx={{
                              bgcolor: "#385a3bff",
                              mbg: 0.5,
                              color: "white",
                              maxWidth: 200,             // largeur max d’un chip
                              textOverflow: "ellipsis",  // coupe le texte avec …
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                            }} />
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
          </Box>
        ))}
      </Stack>


    </>
  );
}

export default Forum;
