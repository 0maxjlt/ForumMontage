import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Stack, Typography, Box } from '@mui/material';
import Popup from "../components/Popup";
import { useEffect } from "react";


function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fieldError, setFieldError] = useState(null); // pour les TextField
  const [popupMessage, setPopupMessage] = useState(null); // pour le Popup

  const navigate = useNavigate();

  useEffect(() => {
    // Déconnecter l'utilisateur automatiquement
    fetch("http://localhost:3001/api/logout", {
      method: "POST",
      credentials: "include"
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isRegister
      ? "http://localhost:3001/api/register"
      : "http://localhost:3001/api/login";

    try {
      const body = isRegister
        ? { username, email, password }
        : { email, password };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include" // pour envoyer les cookies
      });

      const result = await response.json();
      console.log("Réponse du serveur :", result);

      if (isRegister) {
        // --- INSCRIPTION ---
        if (!result.error) {
          setFieldError(null); // réinitialise les champs
          setPopupMessage("Inscription réussie ! Connectez-vous maintenant");
          setIsRegister(false); // bascule vers login
          setUsername("");
          setEmail("");
          setPassword("");
        } else {
          setFieldError(result.error);
          setPopupMessage(result.error);
        }
      } else {
        // --- LOGIN ---
        if (result.success) {
          setFieldError(null);
          navigate("/dashboard");
        } else {
          setFieldError(result.error || "Email ou mot de passe incorrect");
          setPopupMessage(result.error || "Email ou mot de passe incorrect");
        }
      }
    } catch (err) {
      console.error("Erreur lors de l'envoi :", err);
      setFieldError("Une erreur est survenue");
      setPopupMessage("Une erreur est survenue");
    }
  };

  return (
    <>
      {popupMessage && (
        <Popup popup={popupMessage} setPopup={setPopupMessage} />
      )}

      <Box display="flex" justifyContent="center" alignItems="center">
        <Box width={350} m={4} p={4} boxShadow={3}>
          <Typography variant="h5" textAlign="center" mb={3}>
            {isRegister ? "Inscription" : "Connexion"}
          </Typography>

          <Stack spacing={2}>
            {isRegister && (
              <TextField
                label="Nom d'utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                error={!!fieldError}
                helperText={fieldError && isRegister ? fieldError : ""}
              />
            )}

            <TextField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!fieldError}
              helperText={fieldError && !isRegister ? fieldError : ""}
            />

            <TextField
              label="Mot de passe"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!fieldError}
            />

            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={email.length === 0 || password.length === 0 || (isRegister && username.length === 0)}
            >
              {isRegister ? "S'inscrire" : "Se connecter"}
            </Button>

            <Button
              variant="text"
              color="secondary"
              onClick={() => {
                setIsRegister(!isRegister);
                setFieldError(null);
                setPopupMessage(null);
              }}
            >
              {isRegister
                ? "Vous avez déjà un compte ? Connectez-vous"
                : "Pas encore de compte ? Inscrivez-vous"}
            </Button>
          </Stack>
        </Box>
      </Box>
    </>
  );
}

export default Login;
