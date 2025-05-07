import React, { useEffect, useState } from "react";
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

function Forum() {
  const [videos, setVideos] = useState([]);

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
    <Box sx={{ padding: 10 }}>
      <Typography
        variant="h4"
        color="white"
        gutterBottom
        sx={{ fontWeight: 600, textAlign: "left", mb: 4 }}
      >
        Forum – Propositions de vidéos
      </Typography>

      <Grid2 container spacing={4} justifyContent={"center"} textAlign={"left"}> 
        
        {videos.map((video) => (
          <Grid2 item xs={12} sm={6} md={4} key={video.id} maxWidth={400}>
            <Card
              sx={{
                bgcolor: "#161b22",
                color: "white",
                borderRadius: 3,
                boxShadow: "0px 4px 20px rgba(0,0,0,0.3)",
                transition: "transform 0.2s ease-in-out",
                "&:hover": {
                  transform: "scale(1.015)",
                },
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
  );
}

export default Forum;
