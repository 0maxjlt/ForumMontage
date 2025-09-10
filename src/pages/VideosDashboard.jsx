import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  TextField,
  Button,
  Stack,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grow,
  Box,
  Select,
  MenuItem,
  CardHeader,
} from "@mui/material";
import Slider from "@mui/material/Slider";
import { green } from "@mui/material/colors";

function VideoDashboard() {
  const { id } = useParams(); // id de la vidéo
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
        // Récupérer le user depuis le cookie
        const meRes = await fetch("http://localhost:3001/api/me", {
          method: "GET",
          credentials: "include", // ⚡ cookie envoyé
        });

        if (meRes.status === 401) {
          console.log(meRes);
          navigate("/login");
          return;
        }

        const meData = await meRes.json();
        setUser(meData);

        // Récupérer la vidéo
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

  const handleSave = () => {
    setFormData((prev) => ({
      ...prev,
      ...activeFields,
      details: {
        ...prev.details,
        ...activeFields.details,
      },
    }));
    setActiveFields({});
    setModif(false);
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
        <Stack
          width={{ xs: "100%", md: "25%" }} // 100% sur petit écran, 25% sur grand
        >
          <Grow in={cardsVisibility[0]}>
            <Card
              sx={{
                ...cardStyle,
                height: 200, // fixe la hauteur
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#353831",
              }}
            >
              <CardHeader title="Titre" sx={{ bgcolor: "#2D2D2A" }} />
              <CardContent
                sx={{

                }}
              >
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
                  <Typography
                    color="grey.300"


                  >
                    {formData.title || "Sans titre"}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grow>
        </Stack>

        {/* Description */}
        <Stack
          width={{ xs: "100%", md: "70%" }} // 100% sur petit écran, 75% sur grand
        >
          <Grow in={cardsVisibility[1]}>
            <Card
              sx={{
                ...cardStyle,
                height: 200,
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#2D2D2A",
              }}
            >
              <CardHeader title="Description" sx={{ bgcolor: "#1E1E1E" }} />
              <CardContent
              >
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
                  <Typography
                    color="white"

                  >
                    {formData.description || "Aucune description"}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grow>
        </Stack>


        {/* STATUT */}
        <Stack xs={12} md={6}>
          <Grow in={cardsVisibility[3]}>
            <Card
              sx={{
                ...cardStyle,
                height: 250,
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#38423B",

              }}

            >

              <CardHeader title="Statut" sx={{ bgcolor: "#2D2D2A" }} />

              <CardContent >
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

        {/* DÉTAILS */}


        <Stack xs={12} md={12} >
          <Grow in={cardsVisibility[5]}>
            <Card
              sx={{
                ...cardStyle,
                height: 300, // hauteur fixe
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#3F5E5A",
              }}
            >
              <CardHeader
                title="Détails"
                sx={{bgcolor: "#2D2D2A", color: "white" }}
              />
              <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 2 }}>
                <Stack spacing={3} sx={{ width: "100%" }}>
                  {/* Durée rushs */}
                  <Stack spacing={1} sx={{ width: "100%", pl: 1, pr: 1 }}>
                    <Typography color="white" >Durée rushs estimée</Typography>
                    <Typography color="white" textAlign="center" fontWeight="bold">
                      {activeFields.details?.rushs !== undefined
                        ? activeFields.details.rushs
                        : formData.details?.rushs !== undefined
                          ? formData.details.rushs
                          : scale(0)}
                      {activeFields.details?.rushs !== 1 ? " minutes" : " minute"}
                    </Typography>
                    <Slider
                      disabled={!modif}
                      min={0}
                      max={realValues.length - 1}
                      step={1}
                      value={
                        activeFields.details?.rushs !== undefined
                          ? unscale(activeFields.details.rushs)
                          : formData.details?.rushs !== undefined
                            ? unscale(formData.details.rushs)
                            : 0
                      }
                      onChange={(e, newValue) =>
                        setActiveFields((prev) => ({
                          ...prev,
                          details: { ...prev.details, rushs: scale(newValue) },
                        }))
                      }
                      valueLabelDisplay="auto"
                      valueLabelFormat={(index) => scale(index)}
                 
                    />
                  </Stack>

                  {/* Durée vidéo */}
                  <Stack spacing={1} sx={{ width: "100%" , pl: 1, pr: 1  }}>
                    <Typography color="white">Durée vidéo estimée</Typography>
                    <Typography color="white" textAlign="center" fontWeight="bold">
                      {activeFields.details?.video !== undefined
                        ? activeFields.details.video
                        : formData.details?.video !== undefined
                          ? formData.details.video
                          : scale(0)}
                      {activeFields.details?.video !== 1 ? " minutes" : " minute"}
                    </Typography>
                    <Slider
                      disabled={!modif}
                      min={0}
                      max={realValues.length - 1}
                      step={1}
                      value={
                        activeFields.details?.video !== undefined
                          ? unscale(activeFields.details.video)
                          : formData.details?.video !== undefined
                            ? unscale(formData.details.video)
                            : 0
                      }
                      onChange={(e, newValue) =>
                        setActiveFields((prev) => ({
                          ...prev,
                          details: { ...prev.details, video: scale(newValue) },
                        }))
                      }
                      valueLabelDisplay="auto"
                      valueLabelFormat={(index) => scale(index)}
                    />
                  </Stack>

                  {/* Fréquence */}
                  <Stack spacing={1} sx={{ width: "100%" }}>
                    <Typography color="white">Fréquence</Typography>
                    <FormControl fullWidth>
                      <Select
                        value={activeFields.details?.frequence ?? formData.details?.frequence ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "Personnalisée") {
                            setActiveFields((prev) => ({
                              ...prev,
                              details: { ...prev.details, frequence: "", customFrequence: true },
                            }));
                          } else {
                            setActiveFields((prev) => ({
                              ...prev,
                              details: { ...prev.details, frequence: value, customFrequence: false },
                            }));
                          }
                        }}
                        disabled={!modif}
                      >
                        <MenuItem value="Hebdomadaire">Hebdomadaire</MenuItem>
                        <MenuItem value="Mensuelle">Mensuelle</MenuItem>
                        <MenuItem value="Quotidienne">Quotidienne</MenuItem>
                        <MenuItem value="Une fois">Une fois</MenuItem>
                        <MenuItem value="Occasionnelle">Occasionnelle</MenuItem>
                        <MenuItem value="Personnalisée">Personnalisée</MenuItem>
                      </Select>
                    </FormControl>

                    {(activeFields.details?.customFrequence ||
                      formData.details?.customFrequence) && (
                        <TextField
                          fullWidth
                          label="Fréquence personnalisée"
                          value={activeFields.details?.frequence ?? formData.details?.frequence ?? ""}
                          onChange={(e) =>
                            setActiveFields((prev) => ({
                              ...prev,
                              details: { ...prev.details, frequence: e.target.value, customFrequence: true },
                            }))
                          }
                          InputProps={{ style: { color: "white" } }}
                          InputLabelProps={{ style: { color: "lightgray" } }}
                          disabled={!modif}
                        />
                      )}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grow>
        </Stack>



        {/* CRÉATEUR */}
        <Stack xs={12}>
          <Grow in={cardsVisibility[8]}>
            <Card sx={cardStyle}>
              <CardContent>
                <Typography variant="h6" color="white">
                  Créateur : <strong>{video.creator_name}</strong>
                </Typography>
                <Typography variant="body2" color="gray">
                  Créé le : {new Date(video.created_at).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grow>
        </Stack>
      </Stack>

      {/* Boutons globaux */}
      <Stack direction="row" spacing={2} justifyContent="center" mt={4}>
        {!modif ? (
          <Button
            sx={buttonStyle}
            color="primary"
            variant="contained"
            onClick={() => setModif(true)}
          >
            Modifier
          </Button>
        ) : (
          <>
            <Button
              sx={buttonStyle}
              color="success"
              variant="contained"
              onClick={handleSave}
            >
              Enregistrer
            </Button>
            <Button
              sx={buttonStyle}
              color="error"
              variant="contained"
              onClick={handleUndo}
            >
              Annuler
            </Button>
          </>
        )}
      </Stack>
    </Box>
  );
}

export default VideoDashboard;
