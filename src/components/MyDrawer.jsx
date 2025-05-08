import React from "react";
import { Box, Typography, List, ListItem, ListItemText } from "@mui/material";
import { Drawer } from "@mui/material";
import { useNavigate } from "react-router-dom";


function MyDrawer() {
    
    return (
    <Drawer
        variant="permanent"
        anchor="left"
        sx={{
            width: 240,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
                width: 240,
                boxSizing: "border-box",

                color: "white",
                p: 2,
            },
        }}
    >
        <Typography variant="h6" gutterBottom>
            Navigation
        </Typography>

        <List>
            <ListItem button>
                <ListItemText primary="Mon profil" />
            </ListItem>
            <ListItem button>
                <ListItemText primary="Créer une vidéo" />
            </ListItem>
            <ListItem button>
                <ListItemText primary="Mes vidéos" />
            </ListItem>
            <ListItem button>
                <ListItemText primary="Déconnexion" />
            </ListItem>
        </List>
    </Drawer>
)}

export default MyDrawer;