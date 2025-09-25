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
    Step,
    Stepper,
    StepLabel,
    StepButton,
    MobileStepper,
  } from "@mui/material";
  import Slider from "@mui/material/Slider";

  import Draggable from "react-draggable";

  import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
  import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";

  import DeleteIcon from "@mui/icons-material/Delete";
  import { form, tr } from "framer-motion/client";

  import Cookies from "js-cookie";
  import { Cookie } from "@mui/icons-material";

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

    const [activeStep, setActiveStep] = React.useState(0);
    const [firstTime, setFirstTime] = useState(true);

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


          const hasVisited = Cookies.get(`hasVisited_${id}`);
          console.log("hasVisited cookie:", hasVisited);

          if (!hasVisited) {
            setFirstTime(true);
            console.log("Première visite détectée");
            setModif(true);

          } else {
            console.log("Visite précédente détectée");
            setFirstTime(false);
          }

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

    const [steps, setSteps] = useState([
      "Titre",
      "Description",
      "Statut",
      "Durée rushs",
      "Prix",
      "Tags",
      "Miniature",
    ]);

    const handleNext = () => {
      setActiveStep((prev) => prev + 1);
    };

    const handleLast = () => {
      setActiveStep(0);
      Cookies.set(`hasVisited_${id}`, "true", { expires: 7 });
      setFirstTime(false);
      handleSave();
    };

    const handleBack = () => {
      setActiveStep((prev) => prev - 1);
    };

    const handleReset = () => {
      setActiveStep(0);
    };

    const cardStyle = { backgroundColor: "#1E1E1E", borderRadius: 3 };
    const TextFieldStyle = { bgcolor: "#2A2A2A", borderRadius: 1.5, input: { color: "#FFFFFF" }, label: { color: "grey.400" } };

    const buttonStyle = { minWidth: 120 };

    if (loading) return <Typography color="white">Chargement...</Typography>;
    if (!video) return <Typography color="white">Vidéo introuvable</Typography>;

    return (
      <Box py={6} px={2} bgcolor="#121212" minHeight="100vh">
        <Typography variant="h4" fontWeight="bold" textAlign="center" color="white" mb={6}>
          Poster une offre
        </Typography>

        <Typography variant="body1" color="gray" textAlign="center" mb={2}>
          Bienvenue sur le tableau de bord de gestion des vidéos. Vous pouvez modifier les détails de votre vidéo, et gérer vos demandes de montage.
          <br /> N'hésitez pas à explorer les différentes sections pour personnaliser votre expérience.
        </Typography>


        {/* Étapes */}
        {firstTime && (
          <Box
            sx={{
              flexGrow: 1,
              p: 3,
              maxWidth: 600,
              mx: "auto",
            }}
          >
            {/* 👉 contenu de l’étape */}
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontWeight: 600,
                color: "primary.main",
                textAlign: "center",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              {steps[activeStep]}
            </Typography>
            <Typography
              sx={{
                mb: 3,
                color: "text.secondary",
                fontSize: 16,
                textAlign: "center",
                lineHeight: 1.6,
              }}
            >
              Contenu spécifique de l’étape {activeStep + 1}
            </Typography>

            {/* 👉 Mobile Stepper */}
            <MobileStepper
              variant="progress"
              steps={steps.length}
              position="static"
              activeStep={activeStep}

              nextButton={
                <>
                  {activeStep === steps.length - 1 ? (
                    <Button
                      size="small"
                      onClick={handleLast}
                      sx={{
                        textTransform: "none",
                        color: "white",
                        bgcolor: "primary.main",
                      }}
                    >
                      Terminer
                      <KeyboardArrowRight />
                    </Button>
                  ) : (
                    <Button

                      onClick={handleNext}
                      disabled={activeStep === steps.length - 1}
                    >
                      Suivant
                      <KeyboardArrowRight />
                    </Button>
                  )}
                </>
              }
              backButton={
                <Button

                  onClick={handleBack}
                  disabled={activeStep === 0}

                >
                  <KeyboardArrowLeft />
                  Retour
                </Button>
              }
            />
          </Box>
        )}


        <Stack display="flex" flexDirection="row" flexWrap="wrap" gap={4} justifyContent="center" >

          {/* Titre */}

          {(steps[activeStep] === "Titre" || !firstTime) && (
            <Stack width={{ xs: "100%", md: "25%" }}>
              <Grow in={cardsVisibility[0]}>
                <Card
                  sx={{
                    height: 200,
                    display: "flex",
                    flexDirection: "column",
                    ...cardStyle,
                  }}
                >
                  <CardHeader
                    title="Votre titre :"
                    sx={{
                      bgcolor: "#191920ff",
                      color: "#FFFFFF",
                      fontWeight: 600,
                      typography: "subtitle1",
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
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
                        variant="filled"
                        sx={{
                          ...TextFieldStyle
                        }}
                      />
                    ) : (
                      <Typography
                        color="grey.400"
                        sx={{
                          fontSize: 16,
                          lineHeight: 1.5,
                        }}
                      >
                        {formData.title || "Sans titre"}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grow>
            </Stack>

          )}

          {/* Description */}
          {(steps[activeStep] === "Description" || !firstTime) && (
            <Stack width={{ xs: "100%", md: "70%" }}>
              <Grow in={cardsVisibility[1]}>
                <Card sx={{ ...cardStyle, height: 200, display: "flex", flexDirection: "column" }}>
                  <CardHeader title="Description" sx={{ bgcolor: "#1b1920ff" }} />
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
                        variant="filled"
                        sx={{ ...TextFieldStyle }}
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
          )}

          {/* Statut */}
          {(steps[activeStep] === "Statut" || !firstTime) && (
            <Stack xs={12} md={6}>
              <Grow in={cardsVisibility[3]}>
                <Card sx={{ ...cardStyle, height: "100%", display: "flex", flexDirection: "column" }}>
                  <CardHeader title="Statut" sx={{ bgcolor: "#1e1920ff" }} />
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
                          value="closed"
                          control={<Radio sx={{ color: "white" }} />}
                          label="Fermé"
                          disabled={!modif}
                        />
                      </RadioGroup>
                    </FormControl>
                  </CardContent>
                </Card>
              </Grow>
            </Stack>
          )}

          {/* Détails (rushs + vidéo) */}
          {(steps[activeStep] === "Durée rushs" || !firstTime) && (
            <Stack xs={12} md={12}>
              <Grow in={cardsVisibility[5]}>
                <Card sx={{ ...cardStyle, width: 300, height: "100%", display: "flex", flexDirection: "column" }}>
                  <CardHeader title="Détails" sx={{ bgcolor: "#20191fff", color: "white" }} />
                  <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 2 }}>
                    <Stack spacing={3} pl={2} pr={2} sx={{ width: "100%" }}>

                      {/* Durée rushs */}
                      <Stack spacing={1} >
                        <Typography color="white">Durée rushs estimée : </Typography>
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
          )}

          {/* --- Prix --- */}
          {(steps[activeStep] === "Prix" || !firstTime) && (
            <Stack xs={12} md={6}>
              <Grow in={cardsVisibility[6]}>
                <Card sx={{ ...cardStyle, width: 300, height: "100%", display: "flex", flexDirection: "column" }}>
                  <CardHeader title="Prix estimé (€)" sx={{ bgcolor: "#20191dff", color: "white" }} />
                  <CardContent sx={{ pl: 4, pr: 4 }}>
                    <Typography color="white" textAlign="center" fontWeight="bold">
                      {activeFields.price_min ?? formData.price_min ?? 0} € - {activeFields.price_max ?? formData.price_max ?? 0} €
                    </Typography>
                    <Slider
                      disabled={!modif}
                      value={[
                        activeFields.price_min ?? formData.price_min ?? 0,
                        activeFields.price_max ?? formData.price_max ?? 500,
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
                      max={500}
                      step={1}
                    />
                  </CardContent>
                </Card>
              </Grow>
            </Stack>
          )}

          {/* --- Tags --- */}
          {(steps[activeStep] === "Tags" || !firstTime) && (
            <Stack xs={12} md={6}>
              <Grow in={cardsVisibility[7]}>
                <Card sx={{ ...cardStyle, width: 300, height: "100%", display: "flex", flexDirection: "column" }}>
                  <CardHeader title="Tags" sx={{ bgcolor: "#22171cff", color: "white" }} />
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
                              sx={{ mr: 1, mb: 1, bgcolor: "#201318ff", color: "white", boxShadow: 2 }}
                            />

                          ))}
                        </Stack>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grow>
            </Stack>
          )}

          {/* --- Miniature --- */}
          {(steps[activeStep] === "Miniature" || !firstTime) && (
            <Stack xs={12} md={6}>
              <Grow in={cardsVisibility[8]}>
                <Card sx={{ ...cardStyle, height: "100%", display: "flex", flexDirection: "column" }}>
                  <CardHeader title="Miniature" sx={{ bgcolor: "#291a1cff", color: "white" }} />
                  <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>

                    {/* Aperçu de la miniature si déjà présente */}
                    {formData.thumbnail ? (
                      <Box
                        component="img"
                        src={formData.thumbnail}
                        alt="Miniature"
                        sx={{ width: "100%", maxHeight: 150, objectFit: "cover", borderRadius: 2, mb: 2 }}
                      />
                    ) : (
                      <Typography color="gray" mb={2}>Aucune miniature pour le moment</Typography>
                    )}

                    {/* Input fichier pour changer la miniature */}
                    {modif && (
                      <Button variant="contained" component="label">
                        Importer une miniature
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={async (e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              const formDataToSend = new FormData();
                              formDataToSend.append("thumbnail", file);

                              try {
                                const res = await fetch("http://localhost:3001/api/upload/thumbnail", {
                                  method: "POST",
                                  body: formDataToSend,
                                  credentials: "include", // pour envoyer cookies JWT
                                });

                                const data = await res.json();
                                if (data.success) {
                                  // On met à jour le state avec l’URL renvoyée par le serveur
                                  setActiveFields((prev) => ({ ...prev, thumbnail: data.url }));
                                } else {
                                  console.error("Erreur upload miniature:", data.error);
                                }
                              } catch (err) {
                                console.error("Erreur réseau upload miniature:", err);
                              }
                            }
                          }}
                        />
                      </Button>



                    )}
                  </CardContent>
                </Card>
              </Grow>
            </Stack>
          )}



          {/* Créateur */}
          {!firstTime && (
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
          )}
        </Stack>

        {/* Boutons globaux */}
        {!firstTime && (
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
        )}

        {firstTime && (
          <Stack mt={4} alignItems="center">
            <Button variant="text" color="primary" onClick={() => {
              setFirstTime(false);
              handleSave();
              handleLast();
            }}>
              Passer
            </Button>
          </Stack>
        )}

      </Box>
    );
  }

  export default VideoDashboard;
