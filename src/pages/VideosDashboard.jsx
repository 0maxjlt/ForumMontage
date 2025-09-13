import React, { useEffect, useState } from "react";
import { Form, useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grow,
  Box,
  CardHeader,
  Chip,
} from "@mui/material";
import Slider from "@mui/material/Slider";

import DeleteIcon from "@mui/icons-material/Delete";
import { form } from "framer-motion/client";

function VideoDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({});
  const [modif, setModif] = useState(false);
  const [activeFields, setActiveFields] = useState({});
  const [cardsVisibility, setCardsVisibility] = useState(Array(9).fill(false));

  const realValues = [0, 1, 2, 3, 4, 5, 10, 15, 20, 25, 30, 40, 50, 60, 90, "120+"];
  const scale = (index) => realValues[index];
  const unscale = (realValue) => realValues.indexOf(realValue);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const meRes = await fetch("http://localhost:3001/api/me", {
          method: "GET",
          credentials: "include",
        });

        if (meRes.status === 401) {
          navigate("/login");
          return;
        }

        const meData = await meRes.json();
        setUser(meData);

        const videoRes = await fetch(`http://localhost:3001/api/video_requests/${id}`, {
          method: "GET",
          credentials: "include",
        });

        if (videoRes.status === 401) {
          navigate("/login");
          return;
        }

        const videoData = await videoRes.json();
        if (videoData.error) {
          navigate("/dashboard");
          return;
        }

        setVideo(videoData);
        setFormData(videoData);
      } catch (err) {
        console.error("Erreur fetch vidéo :", err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  useEffect(() => {
    cardsVisibility.forEach((_, index) => {
      setTimeout(() => {
        setCardsVisibility((prev) => {
          const copy = [...prev];
          copy[index] = true;
          return copy;
        });
      }, index * 100);
    });
  }, []);

  // --- Sauvegarde ---
  const handleSave = async () => {
    const newData = {
      ...formData,
      ...activeFields,
    };

    // 🔄 Conversion tags : string -> tableau
    if (typeof newData.tags === "string") {
      newData.tags = newData.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
    }

    if (newData.date) {
      const d = new Date(newData.date);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const hh = String(d.getHours()).padStart(2, "0");
      const min = String(d.getMinutes()).padStart(2, "0");
      const ss = String(d.getSeconds()).padStart(2, "0");
      newData.date = `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
    }

    console.log("Données envoyées au serveur :", newData);

    try {
      const res = await fetch(`http://localhost:3001/api/video_requests/${formData.id}`, {
        method: "PUT", // ⚡ PUT pour modification
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newData),
      });

      if (!res.ok) {
        console.error("Erreur mise à jour vidéo :", await res.json());
        return;
      }

      const updatedVideo = await res.json();
      console.log("Réponse serveur :", updatedVideo);

      setFormData(updatedVideo);
      setActiveFields({});
      setModif(false);

      navigate(`/dashboard/${updatedVideo.id}`);
    } catch (err) {
      console.error("Erreur mise à jour vidéo :", err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette vidéo ?")) return;

    try {
      const res = await fetch(`http://localhost:3001/api/video_requests/${formData.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        console.error("Erreur suppression vidéo :", await res.json());
        return;
      }

      console.log("Vidéo supprimée");
      navigate("/dashboard");
    } catch (err) {
      console.error("Erreur suppression vidéo :", err);
    }
  };

  const handleUndo = () => {
    setActiveFields({});
    setModif(false);
  };

  const cardStyle = {};
  const buttonStyle = { minWidth: 120 };

  if (loading) return <Typography color="white">Chargement...</Typography>;
  if (!video) return <Typography color="white">Vidéo introuvable</Typography>;

  return (
    <Box py={6} px={2} bgcolor="#121212" minHeight="100vh">
      <Typography variant="h4" fontWeight="bold" textAlign="center" color="white" mb={6}>
        Détail de la demande vidéo
      </Typography>

      <Stack display="flex" flexDirection="row" flexWrap="wrap" gap={4} justifyContent="center">

        {/* Titre */}
        <Stack width={{ xs: "100%", md: "25%" }}>
          <Grow in={cardsVisibility[0]}>
            <Card sx={{ ...cardStyle, height: 200, display: "flex", flexDirection: "column", backgroundColor: "#353831" }}>
              <CardHeader title="Titre" sx={{ bgcolor: "#2D2D2A" }} />
              <CardContent>
                {modif ? (
                  <TextField
                    fullWidth
                    label="Titre"
                    value={activeFields.title ?? formData.title}
                    onChange={(e) =>
                      setActiveFields((prev) => ({ ...prev, title: e.target.value }))
                    }
                    multiline
                    rows={3}
                  />
                ) : (
                  <Typography color="grey.300">
                    {formData.title || "Sans titre"}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grow>
        </Stack>

        {/* Description */}
        <Stack width={{ xs: "100%", md: "70%" }}>
          <Grow in={cardsVisibility[1]}>
            <Card sx={{ ...cardStyle, height: 200, display: "flex", flexDirection: "column", backgroundColor: "#2D2D2A" }}>
              <CardHeader title="Description" sx={{ bgcolor: "#1E1E1E" }} />
              <CardContent>
                {modif ? (
                  <TextField
                    rows={3}
                    fullWidth
                    multiline
                    label="Description"
                    value={activeFields.description ?? formData.description}
                    onChange={(e) =>
                      setActiveFields((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                ) : (
                  <Typography color="white">
                    {formData.description || "Aucune description"}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grow>
        </Stack>

        {/* Statut */}
        <Stack xs={12} md={6}>
          <Grow in={cardsVisibility[3]}>
            <Card sx={{ ...cardStyle, height: 250, display: "flex", flexDirection: "column", backgroundColor: "#38423B" }}>
              <CardHeader title="Statut" sx={{ bgcolor: "#2D2D2A" }} />
              <CardContent>
                <FormControl>
                  <RadioGroup
                    value={activeFields.status ?? formData.status}
                    onChange={(e) =>
                      setActiveFields((prev) => ({ ...prev, status: e.target.value }))
                    }
                    sx={{ pl: 1, pr: 1 }}
                  >
                    <FormControlLabel
                      value="open"
                      control={<Radio sx={{ color: "white" }} />}
                      label="Ouvert"
                      disabled={!modif}
                    />
                    <FormControlLabel
                      value="in_progress"
                      control={<Radio sx={{ color: "white" }} />}
                      label="En cours"
                      disabled={!modif}
                    />
                    <FormControlLabel
                      value="done"
                      control={<Radio sx={{ color: "white" }} />}
                      label="Terminé"
                      disabled={!modif}
                    />
                  </RadioGroup>
                </FormControl>
              </CardContent>
            </Card>
          </Grow>
        </Stack>

        {/* Détails (rushs + vidéo) */}
        <Stack xs={12} md={12}>
          <Grow in={cardsVisibility[5]}>
            <Card sx={{ ...cardStyle, height: 300, display: "flex", flexDirection: "column", backgroundColor: "#3F5E5A" }}>
              <CardHeader title="Détails" sx={{ bgcolor: "#2D2D2A", color: "white" }} />
              <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 2 }}>
                <Stack spacing={3} sx={{ width: "100%" }}>

                  {/* Durée rushs */}
                  <Stack spacing={1}>
                    <Typography color="white">Durée rushs estimée</Typography>
                    <Typography color="white" textAlign="center" fontWeight="bold">
                      {activeFields.rushs ?? formData.rushs ?? scale(0)}{" "}
                      {(activeFields.rushs ?? formData.rushs ?? 0) !== 1 ? "minutes" : "minute"}
                    </Typography>
                    <Slider
                      disabled={!modif}
                      min={0}
                      max={realValues.length - 1}
                      step={1}
                      value={
                        activeFields.rushs !== undefined
                          ? unscale(activeFields.rushs)
                          : formData.rushs !== undefined
                            ? unscale(formData.rushs)
                            : 0
                      }
                      onChange={(e, newValue) =>
                        setActiveFields((prev) => ({ ...prev, rushs: scale(newValue) }))
                      }
                      valueLabelDisplay="auto"
                      valueLabelFormat={(index) => scale(index)}
                    />
                  </Stack>

                  {/* Durée vidéo */}
                  <Stack spacing={1}>
                    <Typography color="white">Durée vidéo estimée</Typography>
                    <Typography color="white" textAlign="center" fontWeight="bold">
                      {activeFields.video ?? formData.video ?? scale(0)}{" "}
                      {(activeFields.video ?? formData.video ?? 0) !== 1 ? "minutes" : "minute"}
                    </Typography>
                    <Slider
                      disabled={!modif}
                      min={0}
                      max={realValues.length - 1}
                      step={1}
                      value={
                        activeFields.video !== undefined
                          ? unscale(activeFields.video)
                          : formData.video !== undefined
                            ? unscale(formData.video)
                            : 0
                      }
                      onChange={(e, newValue) =>
                        setActiveFields((prev) => ({ ...prev, video: scale(newValue) }))
                      }
                      valueLabelDisplay="auto"
                      valueLabelFormat={(index) => scale(index)}
                    />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grow>
        </Stack>

        {/* --- Prix --- */}
        <Stack xs={12} md={6}>
          <Grow in={cardsVisibility[6]}>
            <Card sx={{ ...cardStyle, height: 250, display: "flex", flexDirection: "column", backgroundColor: "#4B3F72" }}>
              <CardHeader title="Prix estimé (€)" sx={{ bgcolor: "#2D2D2A", color: "white" }} />
              <CardContent>
                <Typography color="white" textAlign="center" fontWeight="bold">
                  {activeFields.price_min ?? formData.price_min ?? 0} € - {activeFields.price_max ?? formData.price_max ?? 0} €
                </Typography>
                <Slider
                  disabled={!modif}
                  value={[
                    activeFields.price_min ?? formData.price_min ?? 0,
                    activeFields.price_max ?? formData.price_max ?? 1000,
                  ]}
                  onChange={(e, newValue) =>
                    setActiveFields((prev) => ({
                      ...prev,
                      price_min: newValue[0],
                      price_max: newValue[1],
                    }))
                  }
                  valueLabelDisplay="auto"
                  min={0}
                  max={1000}
                  step={10}
                />
              </CardContent>
            </Card>
          </Grow>
        </Stack>

        {/* --- Tags --- */}
        <Stack xs={12} md={6}>
          <Grow in={cardsVisibility[7]}>
            <Card sx={{ ...cardStyle, height: 200, display: "flex", flexDirection: "column", backgroundColor: "#72504B" }}>
              <CardHeader title="Tags" sx={{ bgcolor: "#2D2D2A", color: "white" }} />
              <CardContent>
                {modif ? (
                  <TextField
                    fullWidth
                    label="Tags (séparés par des virgules)"
                    value={
                      activeFields.tags !== undefined
                        ? Array.isArray(activeFields.tags)
                          ? activeFields.tags.join(", ")
                          : activeFields.tags
                        : Array.isArray(formData.tags)
                          ? formData.tags.join(", ")
                          : formData.tags ?? ""
                    }
                    onChange={(e) =>
                      setActiveFields((prev) => ({ ...prev, tags: e.target.value }))
                    }
                    multiline
                  />
                ) : (

                  <>
                    <Stack display={"flex"} flexDirection={"row"} flexWrap={"wrap"}>
                      {formData.tags.map((tag, index) => (

                        <Chip
                          key={index}
                          label={tag}
                          sx={{ mr: 1, mb: 1, bgcolor: "#2D2D2A", color: "white", boxShadow: 2 }}
                        />

                      ))}
                    </Stack>
                  </>
                )}
              </CardContent>
            </Card>
          </Grow>
        </Stack>

        {/* Créateur */}
        <Stack xs={12}>
          <Grow in={cardsVisibility[8]}>
            <Card sx={cardStyle}>
              <CardContent>
                <Typography variant="h6" color="white">
                  Créateur : <strong>{video.creator_name}</strong>
                </Typography>
                <Typography variant="body2" color="gray">
                  Créé le : {new Date(video.created_at).toISOString().slice(0, 19).replace("T", " ")}
                </Typography>
              </CardContent>
            </Card>
          </Grow>
        </Stack>
      </Stack>

      {/* Boutons globaux */}
      <Stack direction="row" spacing={2} justifyContent="center" mt={4}>
        {!modif ? (
          <>
            <Button sx={buttonStyle} color="primary" variant="contained" onClick={() => setModif(true)}>
              Modifier
            </Button>

            <Button sx={buttonStyle} color="error" variant="contained" onClick={handleDelete}>
              <DeleteIcon sx={{ mr: 1 }} />
              Supprimer
            </Button>
          </>

        ) : (
          <>
            <Button sx={buttonStyle} color="success" variant="contained" onClick={handleSave}>
              Enregistrer
            </Button>
            <Button sx={buttonStyle} color="error" variant="contained" onClick={handleUndo}>
              Annuler
            </Button>
          </>
        )}
      </Stack>
    </Box>
  );
}

export default VideoDashboard;
