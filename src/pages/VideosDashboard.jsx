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
  Grid,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grow,
  Box,
} from "@mui/material";

import BtnDetails from "../components/DashboardButtons/BtnDetails";
import BtnFrequences from "../components/DashboardButtons/BtnFrequences";

function VideoDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({});
  const [modif, setModif] = useState({ details: false }); // <--- ajouter details
  const [activeFields, setActiveFields] = useState({});
  const [cardsVisibility, setCardsVisibility] = useState(Array(9).fill(false));

  // États pour les détails
  const [modifDetails, setModifDetails] = useState(false);
  const [activeDetails, setActiveDetails] = useState({});
  const [detailsSaved, setDetailsSaved] = useState(false);
  const [detailsUndone, setDetailsUndone] = useState(false);
  const [activeDetailsSlide1, setActiveDetailsSlide1] = useState(null);
  const [activeDetailsSlide2, setActiveDetailsSlide2] = useState(null);
  const [activeDetailsFreq, setActiveDetailsFreq] = useState(null);
  const [detSaved, setDetSaved] = useState(false);
  const [detUndone, setDetUndone] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return navigate("/login");
    const userParsed = JSON.parse(storedUser);
    setUser(userParsed);

    fetch(`http://localhost:3001/api/video_requests/${userParsed.id}/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) return navigate("/dashboard");
        setVideo(data);
        setFormData(data);
        setLoading(false);
      })
      .catch(() => navigate("/dashboard"));
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

  const handleSaveField = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: activeFields[field] ?? prev[field],
    }));
    setModif((prev) => ({ ...prev, [field]: false }));
    setActiveFields((prev) => ({ ...prev, [field]: null }));
  };

  const handleUndoField = (field) => {
    setModif((prev) => ({ ...prev, [field]: false }));
    setActiveFields((prev) => ({ ...prev, [field]: null }));
  };

  const cardStyle = {
    borderRadius: 4,
    p: 3,
    boxShadow: "0 8px 16px rgba(0,0,0,0.5)",
    backgroundColor: "#1e1e1e",
    transition: "transform 0.2s, box-shadow 0.2s",
    "&:hover": {
      transform: "translateY(-5px)",
      boxShadow: "0 12px 24px rgba(0,0,0,0.7)",
    },
  };

  const buttonStyle = {
    textTransform: "none",
    fontWeight: 600,
  };

  if (loading) return <Typography color="white">Chargement...</Typography>;
  if (!video) return <Typography color="white">Vidéo introuvable</Typography>;

  return (
    <Box py={6} px={2} bgcolor="#121212" minHeight="100vh">
      <Typography variant="h3" fontWeight="bold" textAlign="center" color="white" mb={6}>
        Détail de la demande vidéo
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {/* TITRE */}
        <Grid xs={12} md={6}>
          <Grow in={cardsVisibility[0]}>
            <Card sx={cardStyle}>
              <CardContent>
                {modif.title ? (
                  <TextField
                    fullWidth
                    label="Titre"
                    value={activeFields.title ?? formData.title}
                    onChange={(e) =>
                      setActiveFields((prev) => ({ ...prev, title: e.target.value }))
                    }
                    InputProps={{ style: { color: "white" } }}
                    InputLabelProps={{ style: { color: "lightgray" } }}
                  />
                ) : (
                  <Typography variant="h5" fontWeight="medium" color="white">
                    {formData.title || "Sans titre"}
                  </Typography>
                )}
              </CardContent>
              <CardActions sx={{ justifyContent: "center" }}>
                {modif.title ? (
                  <Stack direction="row" spacing={2}>
                    <Button sx={buttonStyle} color="success" variant="contained" onClick={() => handleSaveField("title")}>
                      Enregistrer
                    </Button>
                    <Button sx={buttonStyle} color="error" variant="contained" onClick={() => handleUndoField("title")}>
                      Annuler
                    </Button>
                  </Stack>
                ) : (
                  <Button sx={buttonStyle} variant="outlined" onClick={() => setModif((prev) => ({ ...prev, title: true }))}>
                    Modifier
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grow>
        </Grid>

        {/* DESCRIPTION */}
        <Grid xs={12} md={6}>
          <Grow in={cardsVisibility[1]}>
            <Card sx={cardStyle}>
              <CardContent>
                {modif.description ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Description"
                    value={activeFields.description ?? formData.description}
                    onChange={(e) =>
                      setActiveFields((prev) => ({ ...prev, description: e.target.value }))
                    }
                    InputProps={{ style: { color: "white" } }}
                    InputLabelProps={{ style: { color: "lightgray" } }}
                  />
                ) : (
                  <Typography color="white">{formData.description || "Aucune description"}</Typography>
                )}
              </CardContent>
              <CardActions sx={{ justifyContent: "center" }}>
                {modif.description ? (
                  <Stack direction="row" spacing={2}>
                    <Button sx={buttonStyle} color="success" variant="contained" onClick={() => handleSaveField("description")}>
                      Enregistrer
                    </Button>
                    <Button sx={buttonStyle} color="error" variant="contained" onClick={() => handleUndoField("description")}>
                      Annuler
                    </Button>
                  </Stack>
                ) : (
                  <Button sx={buttonStyle} variant="outlined" onClick={() => setModif((prev) => ({ ...prev, description: true }))}>
                    Modifier
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grow>
        </Grid>

        {/* SCRIPT */}
        <Grid xs={12} md={6}>
          <Grow in={cardsVisibility[2]}>
            <Card sx={cardStyle}>
              <CardContent>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Script"
                  value={formData.script || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, script: e.target.value }))}
                  InputProps={{ style: { color: "white" } }}
                  InputLabelProps={{ style: { color: "lightgray" } }}
                />
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        {/* STATUT */}
        <Grid xs={12} md={6}>
          <Grow in={cardsVisibility[3]}>
            <Card sx={cardStyle}>
              <CardContent>
                <FormControl>
                  <FormLabel sx={{ color: "white" }}>Statut</FormLabel>
                  <RadioGroup
                    value={modif.status ? activeFields.status ?? formData.status : formData.status}
                    onChange={(e) =>
                      setActiveFields((prev) => ({ ...prev, status: e.target.value }))
                    }
                  >
                    <FormControlLabel value="open" control={<Radio sx={{ color: "white" }} />} label="Ouvert" disabled={!modif.status} />
                    <FormControlLabel value="in_progress" control={<Radio sx={{ color: "white" }} />} label="En cours" disabled={!modif.status} />
                    <FormControlLabel value="done" control={<Radio sx={{ color: "white" }} />} label="Terminé" disabled={!modif.status} />
                  </RadioGroup>
                </FormControl>
              </CardContent>
              <CardActions sx={{ justifyContent: "center" }}>
                {modif.status ? (
                  <Stack direction="row" spacing={2}>
                    <Button sx={buttonStyle} color="success" variant="contained" onClick={() => handleSaveField("status")}>
                      Enregistrer
                    </Button>
                    <Button sx={buttonStyle} color="error" variant="contained" onClick={() => handleUndoField("status")}>
                      Annuler
                    </Button>
                  </Stack>
                ) : (
                  <Button sx={buttonStyle} variant="outlined" onClick={() => setModif((prev) => ({ ...prev, status: true }))}>
                    Modifier
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grow>
        </Grid>

        {/* AUTRES CHAMPS */}
        {/* DÉTAILS */}
  
        <Grid xs={12} md={12}>
          <Grow in={cardsVisibility[5]}>
            <Card sx={cardStyle}>
              <CardContent>
                {formData.details?.frequence !== undefined &&
                  formData.details?.rushs !== undefined &&
                  formData.details?.video !== undefined ? (
                  <Stack spacing={2} alignItems="center" width="100%">
                    <Stack direction="row" spacing={2} width="100%">
                      {/* Rushs et Vidéo */}
                      <Stack direction="column" spacing={2} width="50%">
                        <Typography variant="h6" color="white">
                          Durée rushs estimée
                        </Typography>
                        <BtnDetails
                          modifDetails={modif.details}
                          activeDetailsSlide1={activeDetailsSlide1}
                          setActiveDetailsSlide1={setActiveDetailsSlide1}
                          formData={formData}
                          setFormData={setFormData}
                        />

                        <Typography variant="h6" color="white">
                          Durée vidéo estimée
                        </Typography>
                        <BtnDetails
                          modifDetails={modif.details}
                          activeDetailsSlide1={activeDetailsSlide2}
                          setActiveDetailsSlide1={setActiveDetailsSlide2}
                          formData={formData}
                          setFormData={setFormData}
                        />
                      </Stack>

                      {/* Fréquence */}
                      <Stack direction="column" spacing={2} width="50%">
                        <Typography variant="h6" color="white">
                          Fréquence
                        </Typography>
                        <BtnFrequences
                          modifDetails={modif.details}
                          setModifDetails={setModifDetails}
                          activeDetailsFreq={activeDetailsFreq}
                          setActiveDetailsFreq={setActiveDetailsFreq}
                          formData={formData}
                          setFormData={setFormData}
                          detSaved={detSaved}
                          setDetSaved={setDetSaved}
                          detUndone={detUndone}
                          setDetUndone={setDetUndone}
                        />
                      </Stack>
                    </Stack>

                    {/* Boutons Edit / Save / Undo */}
                    <Stack direction="row" spacing={2} width="30%">
                      {!modif.details ? (
                        <>
                          <Button
                            variant="outlined"
                            sx={buttonStyle}
                            onClick={() => setModif((prev) => ({ ...prev, details: true }))}
                          >
                            Modifier
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            sx={buttonStyle}
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                details: { rushs: undefined, video: undefined, frequence: undefined },
                              }))
                            }
                          >
                            Supprimer
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="contained"
                            color="success"
                            sx={buttonStyle}
                            onClick={() => {
                              setModif((prev) => ({ ...prev, details: false }));
                              setActiveDetailsSlide1(null);
                              setActiveDetailsSlide2(null);
                              setActiveDetailsFreq(null);
                            }}
                          >
                            Enregistrer
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            sx={buttonStyle}
                            onClick={() => {
                              setModif((prev) => ({ ...prev, details: false }));
                              // Annuler les modifications
                              setActiveDetailsSlide1(null);
                              setActiveDetailsSlide2(null);
                              setActiveDetailsFreq(formData.details.frequence);
                            }}
                          >
                            Annuler
                          </Button>
                        </>
                      )}
                    </Stack>
                  </Stack>
                ) : (
                  <Button
                    variant="contained"
                    sx={buttonStyle}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        details: { rushs: "", video: "", frequence: "" },
                      }))
                    }
                  >
                    Ajouter des détails
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grow>
        </Grid>



        {/* CRÉATEUR */}
        <Grid xs={12}>
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
        </Grid>
      </Grid>
    </Box>
  );
}

export default VideoDashboard;
