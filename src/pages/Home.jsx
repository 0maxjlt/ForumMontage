import React, { useState } from "react";
import { Box, Typography, Button, Collapse, Card, CardContent, Container } from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

export default function Accueil() {
  const [openChoices, setOpenChoices] = useState(false);
  const navigate = useNavigate();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Container maxWidth="lg" sx={{ py: 8, flexGrow: 1 }}>
        {/* Hero */}
        <Box
          textAlign="center"
          component={motion.div}
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.8 }}
          sx={{ mb: 10 }}
        >
          <Typography variant="h2" fontWeight="bold" gutterBottom>
            Bienvenue sur chepa frr
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: "auto", mb: 4 }}>
            Connectez créateurs et monteurs pour collaborer rapidement et efficacement.
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{ borderRadius: "25px", px: 5, py: 1.5, fontSize: "1.1rem" }}
            onClick={() => setOpenChoices(!openChoices)}
          >
            Commencer
          </Button>
        </Box>

        {/* Section déroulante */}
        <Collapse in={openChoices} timeout={600}>
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Typography variant="body" color="text.secondary" sx={{ m: 10 }}>
              Vous pouvez cliquer sur l’une des options pour explorer, ou ignorer et continuer à naviguer.
            </Typography>

            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", justifyContent: "center", mt: 4 }}>
              {[
                {
                  title: "Publier un CV de monteur",
                  text: "Mettez en avant vos compétences et projets pour être contacté par des créateurs.",
                  action: () => alert("Redirection vers publier un CV"),
                },
                {
                  title: "Publier une offre en tant que créateur",
                  text: "Trouvez rapidement un monteur qualifié pour vos projets vidéo.",
                  action: () => navigate("/dashboard"),
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <Card
                    onClick={item.action}
                    sx={{
                      width: 320,
                      minHeight: 180,
                      borderRadius: "20px",
                      boxShadow: 3,
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      cursor: "pointer",
                      "&:hover": { transform: "translateY(-8px)", boxShadow: 6 },
                    }}
                  >
                    <CardContent sx={{ textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", height: "100%" }}>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.text}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </Box>
          </Box>
        </Collapse>
      </Container>

      {/* Footer */}
      <Box textAlign="center" py={4} borderTop="1px solid #ddd">
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} zzz - Tous droits réservés
        </Typography>
      </Box>
    </Box>
  );
}
