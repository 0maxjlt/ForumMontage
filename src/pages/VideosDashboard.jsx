import React, { act, use, useEffect, useState } from "react";
import { Form, useNavigate, useParams } from "react-router-dom";
import { CardContent, CardMedia, Divider, FormControl, FormLabel, Grid2, Radio, RadioGroup, Stack } from "@mui/material";
import { Input, Button, Paper, TextField, Typography, Card, Box, CardActions } from "@mui/material";
import { FormControlLabel } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Skeleton from "@mui/material/Skeleton";
import AddIcon from "@mui/icons-material/Add";
import Grow from '@mui/material/Grow';
import BtnDetails from "../components/DashboardButtons/BtnDetails";
import BtnFrequences from "../components/DashboardButtons/BtnFrequences";

import EditButton from "../components/BasicButtons/EditButton";
import SaveButton from "../components/BasicButtons/SaveButton";
import UndoButton from "../components/BasicButtons/UndoButton";
import AddButton from "../components/BasicButtons/AddButton";
import DeleteIconButton from "../components/BasicButtons/DeleteIconButton";
import { color } from "framer-motion";

function VideoDashboard() {
  console.log("Re-render détecté"); // ✅ Vérifier si le composant se rafraîchit en boucle
  const { id } = useParams();
  const [user, setUser] = useState();

  const [formData, setFormData] = useState({
    title: undefined,
    description: undefined,
    script: "",
    date: "",
    statut: null,
    tags: [],
    minia: undefined,
    details: {
      rushs: undefined,
      video: undefined,
      frequence: undefined
    }
  });


  const [load, setLoad] = useState(false);
  const [cardsVisibility, setCardsVisibility] = useState([false, false, false, false, false]);

  const [activeTitle, setActiveTitle] = useState(null);
  const [modifTitle, setModifTitle] = useState(false);

  const [activeDesc, setActiveDesc] = useState(null);
  const [modifDescription, setModifDescription] = useState(false);

  const [activestatut, setActivestatut] = useState("Terminé");
  const [modifstatut, setModifstatut] = useState(false);

  const [activeMinia, setActiveMinia] = useState(null);
  const [modifMinia, setModifMinia] = useState(false);

  const [modifDetails, setModifDetails] = useState(false);
  const [activeDetailsSlide1, setActiveDetailsSlide1] = useState(null);
  const [activeDetailsSlide2, setActiveDetailsSlide2] = useState(null);
  const [activeDetailsFreq, setActiveDetailsFreq] = useState(null);

  const [detSaved, setDetSaved] = useState(false);
  const [detUndone, setDetUndone] = useState(false);

  const navigate = useNavigate();

  const handleEdit = (setModifMod, setActiveDetailsSlide1, setActiveDetailsSlide2, setActiveDetailsFreq) => {

    setModifMod(true);
    setActiveDetailsFreq('');
    setActiveDetailsSlide1('');
    setActiveDetailsSlide2('');
    console.log("Edit");
  };

  const handleSave = (setModifMod, setActiveDetailsSlide1, setActiveDetailsSlide2, setActiveDetailsFreq) => {
    setModifMod(false);
    setActiveDetailsFreq(null);
    setActiveDetailsSlide1(null);
    setActiveDetailsSlide2(null);
    console.log("Sauvegardé");

    setFormData((prevData) => ({
      ...prevData,
      details: {
        rushs: activeDetailsSlide1,
        video: activeDetailsSlide2,
        frequence: activeDetailsFreq
      }
    }))
  }



  const handleUndo = (setModifMod, setActiveDetailsSlide1, setActiveDetailsSlide2, setActiveDetailsFreq) => {
    setModifMod(false);
    setActiveDetailsFreq(null);
    setActiveDetailsSlide1(null);
    setActiveDetailsSlide2(null);
    console.log("Annulé");
    setFormData((prevData) => ({
      ...prevData,
      details: {
        ...prevData.details
      }
    }))
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Crée une URL pour l'image sélectionnée
      const imageUrl = URL.createObjectURL(file);
      console.log("imageUrl", imageUrl);
      setActiveMinia(imageUrl); // Me t à jour l'état avec l'URL de l'image
    }
  };


  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userParsed = JSON.parse(storedUser);
      if (!userParsed.email) {
        navigate("/login");
      } else {
        if (!userParsed.videos.find(v => v.id === id)) {
          navigate("/dashboard");
        }
        setUser(userParsed);
        setLoad(true);

      }
    } else {
      navigate("/login");
    }
  }, [navigate, id]);

  useEffect(() => {
    console.log("formData", formData);
  }, [formData]);

  useEffect(() => {
    // Fonction pour afficher chaque carte après un délai
    cardsVisibility.forEach((_, index) => {
      setTimeout(() => {
        setCardsVisibility((prevVisibility) => {
          const newVisibility = [...prevVisibility]; // Crée une copie de l'état précédent
          newVisibility[index] = true;  // Change l'état pour rendre visible la carte à l'index actuel
          return newVisibility;  // Retourne la nouvelle liste de visibilités
        });
      }, index * 100); // Décalage de 1 seconde pour chaque carte (1s pour la 1ère, 2s pour la 2ème, etc.)
    });
  }, []);


  if (!user) {
    return <p>Chargement...</p>;
  }

  const video = user.videos.find(video => video.id === id);

  if (!video) {
    return <p>Vidéo non trouvée.</p>;
  }

  return (
    <>
      <Box sx={{
        position: 'relative',
        display: 'inline-block',
        textAlign: 'center',
        marginBottom: '20px', // Espacement en bas pour bien séparer du reste
        padding: '20px 0'
      }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{
            letterSpacing: 3,
            background: "linear-gradient(45deg,rgb(147, 87, 212),rgb(107, 161, 254))", // Dégradé de couleurs plus douces
            backgroundClip: "text",
            color: "transparent",
            fontSize: "3rem", // Augmenter la taille pour un effet imposant
            textTransform: "uppercase",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.6)", // Ombre du texte
            padding: "10px 0",
            transition: "all 0.5s ease-in-out", // Transition fluide pour les effets
            position: "relative",
            zIndex: 1,
            '&:hover': {
              textShadow: "4px 4px 8px rgba(0, 0, 0, 0.8)", // Ombre plus prononcée au survol
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.1,
              zIndex: -1,
              transition: "opacity 0.3s ease-in-out", // Effet d'opacité en transition
            },
            '&:hover::after': {
              opacity: 0.2, // L'ombre s'intensifie au survol
            }
          }}
        >
          Détails
        </Typography>

        {/* Optionnel : un petit icône en bas ou autour du titre */}
        <Box sx={{
          marginTop: '10px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Typography variant="subtitle1" sx={{ fontSize: '1.1rem', color: "#fff", fontWeight: 500 }}>
            Ajoutez une description et une miniature pour une meilleure présentation
          </Typography>
        </Box>
      </Box>



      <div className="wrapper">

        <Grow in={cardsVisibility[0]} style={{ transformOrigin: 'center' }} {...(load ? { timeout: 1000 } : {})}>

          <Card className="description" sx={{ height: 300, borderRadius: 3, textAlign: "center", transition: "all 0.3s ease-in-out", "&:hover": { transform: "scale(1.02)" } }}>
            <CardContent sx={{ flexGrow: 1 }}>
              {formData.description !== undefined || modifDescription ? (
                <Grow in={formData.description !== undefined || modifDescription} style={{ transformOrigin: 'center' }} {...(load ? { timeout: 1000 } : {})}>

                  <TextField
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                    label="Description"
                    variant="outlined"
                    multiline
                    rows={8}
                    value={activeDesc ?? formData.description}
                    onChange={(e) => setActiveDesc(e.target.value)}
                    disabled={!modifDescription}
                    sx={{

                      backgroundColor: modifDescription ? "#323232" : "transparent",
                      borderRadius: 1,
                      transition: "background-color 0.3s ease"
                    }}
                  />
                </Grow>
              ) : (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      // Crée une fonction pour mettre à jour l'état ici.
                      setFormData((prevState) => ({
                        ...prevState,
                        description: "", // Met la description à vide ou selon ton besoin
                      }));
                    }}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      height: 270,
                      width: "100%",
                    }}


                  >
                    <Typography variant="button" sx={{ fontWeight: 'bold' }}>
                      Ajouter description
                    </Typography>
                  </Button>
                </>
              )}

            </CardContent>
            {formData.description !== undefined || modifDescription ? (
              <CardActions sx={{ display: "flex", justifyContent: "center" }}>
                {!modifDescription ? (
                  <>
                    <Button
                      sx={{ width: "100%", height: '100%' }}
                      size="small"
                      variant="contained"
                      color="secondary"

                      onClick={() => {
                        setModifDescription(true);
                        setActiveDesc(null);
                      }}
                    >
                      Modifier
                    </Button>

                    <Button
                      size="small"
                      color="error"
                      variant="text"
                      onClick={() => {
                        setFormData((prevState) => ({
                          ...prevState,
                          description: undefined,
                        }));
                      }}
                      sx={{ width: '100%' }} // Prend toute la largeur
                    >
                      Supprimer
                    </Button>

                  </>

                ) : (
                  <>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={() => {
                        setModifDescription(false);
                        setFormData((prevState) => ({
                          ...prevState,
                          description: activeDesc
                        }));
                        setActiveDesc(null);
                      }}
                      disabled={activeDesc == null}
                    >
                      Enregistrer
                    </Button>

                    <Button
                      size="small"
                      color="error"
                      onClick={() => {
                        setModifDescription(false);
                        setActiveDesc(null);
                        setFormData((prevState) => ({
                          ...prevState
                        }));
                      }}
                    >
                      Annuler
                    </Button>
                  </>
                )}
              </CardActions>
            ) : (<></>)}
          </Card>
        </Grow>


        <Grow in={cardsVisibility[1]}
          style={{ transformOrigin: 'center' }}
          {...(load ? { timeout: 1000 } : {})}>
          <Card
            className="minia"
            sx={{

              borderRadius: 3,
              width: "100%",
              transition: "all 0.3s ease-in-out", "&:hover": { transform: "scale(1.02)" },
              height: 300,

            }}
          >

            {formData.minia !== undefined ? (
              <CardMedia
                component="img"
                image={modifMinia ? activeMinia : formData.minia}
              />) : (
              <>
                <CardContent sx={{ height: '100%' }}>
                  <>
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<AddIcon />}
                      onClick={() => setFormData((prevState) => ({ ...prevState, minia: "" }))}
                      sx={{ width: '100%', height: 270 }}
                    >
                      Ajouter une miniature
                    </Button>
                  </>
                </CardContent>
              </>)}

            <Stack direction="column" sx={{ padding: 2 }}>
              {!modifMinia ? (
                <>
                  {formData.minia === undefined ? (
                    <>
                    </>
                  ) : (
                    <>
                      <Input
                        type="file"
                        id="fileInput"
                        inputProps={{ accept: "image/*" }}
                        onChange={(event) => {
                          setModifMinia(true);
                          setActiveMinia(null);
                          handleFileChange(event);
                        }}
                        sx={{ display: 'none' }}
                      />
                      <label htmlFor="fileInput">
                        <Button
                          size="small"
                          variant="contained"
                          color="secondary"
                          component="span"
                          startIcon={<CloudUploadIcon />}
                          sx={{ width: '100%', height: '100%' }} // Prend toute la largeur
                        >
                          Sélectionner une image
                        </Button>
                      </label>
                    </>
                  )}

                  {formData.minia !== undefined && (
                    <Button
                      size="small"
                      color="error"
                      variant="text"
                      onClick={() => {
                        setFormData((prevState) => ({
                          ...prevState,
                          minia: undefined,
                        }));
                      }}
                      sx={{ width: '100%', mt: 1 }} // Prend toute la largeur
                    >
                      Supprimer
                    </Button>
                  )}
                </>
              ) : (
                <>

                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    onClick={() => {
                      setModifMinia(false);
                      setFormData((prevState) => ({
                        ...prevState,
                        minia: activeMinia,
                      }));
                      setActiveMinia(null);
                    }}
                    sx={{ width: '100%' }}
                  >
                    Enregistrer
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    variant="contained"
                    onClick={() => {
                      setModifMinia(false);
                      setActiveMinia(null);
                    }}
                    sx={{ width: '100%', mt: 1 }}
                  >
                    Annuler
                  </Button>
                </>
              )}
            </Stack>
          </Card>
        </Grow>


        <Grow in={cardsVisibility[2]}
          style={{ transformOrigin: 'center' }}
          {...(load ? { timeout: 1000 } : {})}>
          <Card className="titre" sx={{ display: 'flex', flexDirection: 'column', height: 160, borderRadius: 3, textAlign: "center", transition: "all 0.3s ease-in-out", "&:hover": { transform: "scale(1.02)" } }}>
            <CardContent sx={{ flexGrow: 1 }}>
              {formData.title !== undefined || modifTitle ? (
                <TextField
                  slotProps={{ inputLabel: { shrink: true } }}
                  fullWidth
                  label="Titre"
                  variant="outlined"
                  multiline
                  rows={2}
                  value={activeTitle ?? formData.title}
                  onChange={(e) => setActiveTitle(e.target.value)}
                  disabled={!modifTitle}
                  sx={{

                    backgroundColor: modifTitle ? "#323232" : "transparent",
                    borderRadius: 1,
                    transition: "background-color 0.3s ease"
                  }}
                />
              ) : (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      // Crée une fonction pour mettre à jour l'état ici.
                      setFormData((prevState) => ({
                        ...prevState,
                        title: "", // Met la description à vide ou selon ton besoin
                      }));
                    }}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',

                      height: 130,
                      width: "100%",

                    }}
                  >
                    <Typography variant="button" sx={{ fontWeight: 'bold' }}>
                      Ajouter titre
                    </Typography>
                  </Button>
                </>
              )}

            </CardContent>
            {formData.title !== undefined || modifTitle ? (
              <CardActions sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
                {!modifTitle ? (
                  <>
                    <Button
                      sx={{ width: '100%' }}
                      size="small"
                      variant="contained"
                      color="secondary"

                      onClick={() => {
                        setModifTitle(true);
                        setActiveTitle(null);
                      }}
                    >
                      Modifier
                    </Button>

                    <Button
                      size="small"
                      color="error"
                      variant="contained"
                      onClick={() => {
                        setFormData((prevState) => ({
                          ...prevState,
                          title: undefined,
                        }));
                      }}
                      sx={{ width: '100%' }} // Prend toute la largeur
                    >
                      Supprimer
                    </Button>

                  </>

                ) : (
                  <>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={() => {
                        setModifTitle(false);
                        setFormData((prevState) => ({
                          ...prevState,
                          title: activeTitle
                        }));
                        setActiveTitle(null);
                      }}
                      disabled={activeTitle == null}

                    >
                      Enregistrer
                    </Button>

                    <Button
                      size="small"
                      color="error"
                      onClick={() => {
                        setModifTitle(false);
                        setActiveTitle(null);
                        setFormData((prevState) => ({
                          ...prevState
                        }));
                      }}

                    >
                      Annuler
                    </Button>
                  </>
                )}
              </CardActions>
            ) : (<></>)}
          </Card>
        </Grow>

        <Grow in={cardsVisibility[3]}
          style={{ transformOrigin: 'center' }}
          {...(load ? { timeout: 1000 } : {})}>
          <Card elevation={2} className="statut" sx={{
            borderRadius: 2,
            transition: "all 0.3s ease-in-out",
            "&:hover": { transform: "scale(1.02)" },
            height: 300 // Permet à la Card de s'étendre entièrement dans son conteneur parent
          }} >
            <CardContent sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",

              padding: 2,
            }}>
              {formData.statut == undefined ? (
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    // Crée une fonction pour mettre à jour l'état ici.
                    setFormData((prevState) => ({
                      ...prevState,
                      statut: "", // Met la description à vide ou selon ton besoin
                    }));
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    height: 270,
                    justifyContent: 'center', // Centrer le contenu du bouton
                    width: "100%",  // Faire en sorte que le bouton prenne toute la largeur disponible
                  }}
                >
                  <Typography variant="button" sx={{ fontWeight: 'bold' }}>
                    Ajouter statut
                  </Typography>
                </Button>


              ) : (<>
                <FormControl>
                  <FormLabel sx={{ fontWeight: "bold", mb: 2 }}>STATUT</FormLabel>
                  <RadioGroup
                    value={modifstatut ? activestatut : formData.statut} // Utilis  e activestatut seulement en mode édition
                    onChange={(e) => setActivestatut(e.target.value)} // Mettre à jour activestatut
                  >
                    <FormControlLabel disabled={!modifstatut} value="En attente" control={<Radio />} label={
                      <Typography sx={{ color: formData.statut === "En attente" ? "warning.main" : "inherit" }}>
                        En attente
                      </Typography>
                    } />
                    <Divider />
                    <FormControlLabel disabled={!modifstatut} value="En cours" control={<Radio />} label={
                      <Typography sx={{ color: formData.statut === "En cours" ? "primary.main" : "inherit" }}>
                        En cours
                      </Typography>
                    } />
                    <Divider />
                    <FormControlLabel disabled={!modifstatut} value="Terminé" control={<Radio />} label={
                      <Typography sx={{ color: formData.statut === "Terminé" ? "success.main" : "inherit" }}>
                        Terminé
                      </Typography>
                    } />
                  </RadioGroup>
                </FormControl>

                {!modifstatut ? (
                  <>
                    <Button variant="contained" color="secondary" size="small"
                      onClick={() => {
                        setModifstatut(true);
                        setActivestatut(formData.statut); // Garde la valeur actuelle
                      }}
                      sx={{ width: '100%', mt: 1 }} // Prend toute la largeur
                    >
                      Modifier
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      variant="text"
                      onClick={() => {
                        setFormData((prevState) => ({
                          ...prevState,
                          statut: undefined,
                        }));
                      }}
                      sx={{ width: '100%', mt: 1 }} // Prend toute la largeur
                    >
                      Supprimer
                    </Button>
                  </>


                ) : (
                  <>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      onClick={() => {
                        setModifstatut(false);
                        setFormData((prevState) => ({
                          ...prevState,
                          statut: activestatut, // Enregistre la modification
                        }));
                      }}
                      disabled={!activestatut} // Désactive si aucune sélection
                      sx={{ mt: 1, width: '100%' }} // Prend toute la largeur
                    >
                      Enregistrer
                    </Button>
                    <Button
                      color="error"
                      size="small"
                      onClick={() => {
                        setModifstatut(false);
                        setActivestatut(formData.statut); // Remet l'ancienne valeur
                      }}
                      sx={{ mt: 1, width: '100%' }} // Prend toute la largeur
                    >
                      Annuler
                    </Button>
                  </>
                )}
              </>)}
            </CardContent>
          </Card>
        </Grow>


        <Grow in={cardsVisibility[4]}
          style={{ transformOrigin: 'center' }}
          {...(load ? { timeout: 1000 } : {})}>
          <Card elevation={2} sx={{ borderRadius: 2 }} className="card4">
            <CardContent>
              <TextField
                fullWidth
                label="Date"
                type="date"
                variant="outlined"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </CardContent>
          </Card>
        </Grow>

        <Grow in={cardsVisibility[4]}
          style={{ transformOrigin: 'center' }}
          {...(load ? { timeout: 1000 } : {})}>
          <Card className="details" sx={{ height: 300 }}>
            <CardContent >
              <Stack>
                {formData.details.frequence !== undefined && formData.details.rushs !== undefined && formData.details.video !== undefined ? (
                  <Stack display={"flex"} direction="column" spacing={2} alignItems={"center"} sx={{ width: "100%" }}>
                    <Stack direction="row" spacing={2} sx={{ width: "100%" }}>
                      <Stack direction="column" spacing={1} sx={{ width: "50%" }}>
                        <Typography variant="h6" color="textPrimary" sx={{ textAlign: "left" }}>
                          Durée rushs estimée
                        </Typography>
                        <BtnDetails modifDetails={modifDetails} activeDetailsSlide1={activeDetailsSlide1} setActiveDetailsSlide1={setActiveDetailsSlide1} formData={formData} setFormData={setFormData} />
                        <Divider />
                        <Typography variant="h6" color="textPrimary" sx={{ textAlign: "left" }}>
                          Durée vidéo estimée
                        </Typography>
                        <BtnDetails modifDetails={modifDetails} activeDetailsSlide1={activeDetailsSlide1} setActiveDetailsSlide1={setActiveDetailsSlide1} formData={formData} setFormData={setFormData} />
                      </Stack>
                      <Divider orientation="vertical" flexItem />
                      <Box sx={{ width: "50%", display: "flex" }}>



                        <Stack direction="column" spacing={1} sx={{ width: "100%" }}>
                          <BtnFrequences setModifDetails={setModifDetails} modifDetails={modifDetails} activeDetailsFreq={activeDetailsFreq} setActiveDetailsFreq={setActiveDetailsFreq} formData={formData} setFormData={setFormData} detSaved={detSaved} detUndone={detUndone} setDetSaved={setDetSaved} setDetUndone={setDetUndone}/>
 
                          {!modifDetails ? (<></>
                          ) : (
                            <Stack direction="row" spacing={1}>

                              <SaveButton onClick={() => { handleSave(setModifDetails, setActiveDetailsFreq, setActiveDetailsSlide1, setActiveDetailsSlide2); }} />
                              <UndoButton onClick={() => { handleUndo(setModifDetails, setActiveDetailsFreq, setActiveDetailsSlide1, setActiveDetailsSlide2) }} />
                            </Stack>
                          )}
                        </Stack>

                      </Box>
                    </Stack>
                    <Stack display={"flex"} direction="row" spacing={2} sx={{ width: "30%" }}>

                      {!modifDetails ? (
                        <>
                          <EditButton onClick={() => handleEdit(setModifDetails, setActiveDetailsFreq, setActiveDetailsSlide1, setActiveDetailsSlide2)} />

                          <DeleteIconButton onClick={() => {
                            setFormData((prevState) => ({
                              ...prevState,
                              details: {
                                rushs: undefined,
                                video: undefined,
                                frequence: undefined
                              }
                            }))
                          }}

                          />
                        </>) : (<>
                          <SaveButton onClick={() => {setDetSaved(true)}} />
                          <UndoButton onClick={() => {setDetUndone(true)}} />
                        </>)}

                    </Stack>
                  </Stack>
                ) : (
                  <AddButton
                    onClick={() =>
                      setFormData((prevState) => ({
                        ...prevState,
                        details: {
                          ...prevState.details,  // Conserve les autres valeurs de details
                          rushs: "",
                          video: "",
                          frequence: ""
                        }
                      }))
                    }
                    text={"Ajouter des détails"}
                  />
                )}
              </Stack>



            </CardContent>
          </Card>
        </Grow>


        <Card elevation={2} sx={{ borderRadius: 2 }} className="card5">
          <CardContent>
            <TextField
              fullWidth
              label="Statut"
              variant="outlined"
              value={formData.statut}
              onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
            />
          </CardContent>
        </Card>

        <Card elevation={2} sx={{ borderRadius: 2 }} className="card6">
          <CardContent>
            <TextField
              fullWidth
              label="Tags (séparés par des virgules)"
              variant="outlined"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            />
          </CardContent>
        </Card>



        <Card elevation={2} sx={{ borderRadius: 2 }} className="card5">
          <CardContent>
            <TextField
              fullWidth
              label="guez"
              variant="outlined"
              value={formData.statut}
              onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
            />
          </CardContent>
        </Card>

        <Card elevation={2} sx={{ borderRadius: 2 }} className="card6">
          <CardContent>
            <TextField
              fullWidth
              label="Tags (séparés par des virgules)"
              variant="outlined"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            />


          </CardContent>
        </Card>


      </div >

    </>
  );
}

export default VideoDashboard;
