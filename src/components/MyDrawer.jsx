import React, { useState, useEffect } from "react";
import {
    Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
    Toolbar, Typography, Box, Collapse, Divider, IconButton, AppBar
} from "@mui/material";
import {
    Home as HomeIcon,
    Work as WorkIcon,
    People as PeopleIcon,
    Info as InfoIcon,
    AccountCircle as AccountCircleIcon,
    Settings as SettingsIcon,
    ExpandLess,
    ExpandMore,
    PostAdd as PostAddIcon,
    ManageAccounts as ManageAccountsIcon,
    Folder as FolderIcon,
    Search as SearchIcon,
    Logout as LogoutIcon,
    Login as LoginIcon,
    PersonAdd as PersonAddIcon,
    Menu as MenuIcon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { tr } from "framer-motion/client";

export default function MyDrawer() {
    const drawerWidth = 260;
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [openCreators, setOpenCreators] = useState(true);
    const [openEditors, setOpenEditors] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);


    const handleLogout = () => {
        fetch("http://localhost:3001/api/logout", {
            method: "POST",
            credentials: "include",
        })
            .then(() => setUser(null))
            .catch(err => console.error("Erreur déconnexion", err));

        navigate("/login");
        setMobileOpen(false); // ferme le drawer mobile après logout
    };

    const toggleDrawer = () => setMobileOpen(!mobileOpen);

    const drawerContent = (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
            {/* Contenu principal */}
            <Box>
                <Toolbar>
                    <Typography variant="h6" sx={{ fontWeight: "bold", color: "#fff" }}>
                        🎬 ForumMontage
                    </Typography>
                </Toolbar>

                <Box sx={{ flexGrow: 1, overflow: "auto" }}>
                    <List>
                        <ListItem disablePadding>
                            <ListItemButton onClick={() => { navigate("/"); setMobileOpen(false); }}>
                                <ListItemIcon><HomeIcon sx={{ color: "white" }} /></ListItemIcon>
                                <ListItemText primary="Accueil" />
                            </ListItemButton>
                        </ListItem>


                        <>
                            {/* Espace Créateurs */}
                            <ListItem disablePadding>
                                <ListItemButton open={openCreators} onClick={() => setOpenCreators(!openCreators)}>
                                    <ListItemIcon><WorkIcon sx={{ color: "white" }} /></ListItemIcon>
                                    <ListItemText primary="Espace Créateurs" />
                                    {openCreators ? <ExpandLess /> : <ExpandMore />}
                                </ListItemButton>
                            </ListItem>
                            <Collapse in={openCreators} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding sx={{ pl: 4 }}>
                                    <ListItemButton onClick={() => { navigate("/forum"); setMobileOpen(false); }}>
                                        <ListItemIcon><SearchIcon sx={{ color: "white" }} /></ListItemIcon>
                                        <ListItemText primary="Voir les offres" />
                                    </ListItemButton>
                                    <ListItemButton onClick={() => { navigate("/dashboard"); setMobileOpen(false); }}>
                                        <ListItemIcon><ManageAccountsIcon sx={{ color: "white" }} /></ListItemIcon>
                                        <ListItemText primary="Gérer mes offres" />
                                    </ListItemButton>
                                </List>
                            </Collapse>

                            {/* Espace Monteurs */}
                            <ListItem disablePadding>
                                <ListItemButton onClick={() => setOpenEditors(!openEditors)}>
                                    <ListItemIcon><PeopleIcon sx={{ color: "white" }} /></ListItemIcon>
                                    <ListItemText primary="Espace Monteurs" />
                                    {openEditors ? <ExpandLess /> : <ExpandMore />}
                                </ListItemButton>
                            </ListItem>
                            <Collapse in={openEditors} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding sx={{ pl: 4 }}>
                                    <ListItemButton onClick={() => setMobileOpen(false)}>
                                        <ListItemIcon><SearchIcon sx={{ color: "white" }} /></ListItemIcon>
                                        <ListItemText primary="Voir les offres" />
                                    </ListItemButton>
                                    <ListItemButton onClick={() => setMobileOpen(false)}>
                                        <ListItemIcon><FolderIcon sx={{ color: "white" }} /></ListItemIcon>
                                        <ListItemText primary="Mon portfolio" />
                                    </ListItemButton>
                                </List>
                            </Collapse>
                        </>


                        {/* À propos */}
                        <ListItem disablePadding>
                            <ListItemButton onClick={() => setMobileOpen(false)}>
                                <ListItemIcon><InfoIcon sx={{ color: "white" }} /></ListItemIcon>
                                <ListItemText primary="À propos" />
                            </ListItemButton>
                        </ListItem>
                    </List>
                </Box>
            </Box>

            {/* Section Profil / Paramètres / Déconnexion en bas */}
            <Box sx={{ mt: "auto" }}>
                <Divider sx={{ bgcolor: "gray" }} />
                <List>
                    {user ? (
                        <>
                            <ListItem disablePadding>
                                <ListItemButton onClick={() => setMobileOpen(false)}>
                                    <ListItemIcon><AccountCircleIcon sx={{ color: "white" }} /></ListItemIcon>
                                    <ListItemText primary="Profil" />
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton onClick={() => setMobileOpen(false)}>
                                    <ListItemIcon><SettingsIcon sx={{ color: "white" }} /></ListItemIcon>
                                    <ListItemText primary="Paramètres" />
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton onClick={handleLogout}>
                                    <ListItemIcon><LogoutIcon sx={{ color: "white" }} /></ListItemIcon>
                                    <ListItemText primary="Déconnexion" />
                                </ListItemButton>
                            </ListItem>
                        </>
                    ) : (
                        <>
                            <ListItem disablePadding>
                                <ListItemButton onClick={() => { navigate("/login"); setMobileOpen(false); }}>
                                    <ListItemIcon><LoginIcon sx={{ color: "white" }} /></ListItemIcon>
                                    <ListItemText primary="Connexion" />
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton onClick={() => { navigate("/register"); setMobileOpen(false); }}>
                                    <ListItemIcon><PersonAddIcon sx={{ color: "white" }} /></ListItemIcon>
                                    <ListItemText primary="Inscription" />
                                </ListItemButton>
                            </ListItem>
                        </>
                    )}
                </List>
            </Box>
        </Box>
    );

    return (
        <>
            {/* AppBar pour bouton burger */}
            <AppBar position="fixed" sx={{ display: { sm: "none" }, bgcolor: "#161616ff" }}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={toggleDrawer}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ ml: 2 }}>
                        🎬 ForumMontage
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* Drawer permanent sur desktop */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: "none", sm: "block" },
                    "& .MuiDrawer-paper": { width: drawerWidth, bgcolor: "#161616ff" }
                }}
                open
            >
                {drawerContent}
            </Drawer>

            {/* Drawer temporaire sur mobile */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={toggleDrawer}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: "block", sm: "none" },
                    "& .MuiDrawer-paper": { width: drawerWidth, bgcolor: "#161616ff" }
                }}
            >
                {drawerContent}
            </Drawer>
        </>
    );
}
