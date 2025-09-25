import React from "react";
import { AppBar, Toolbar, IconButton, Typography, Menu, MenuItem, Badge, Stack } from "@mui/material";
import {
    Notifications as NotificationsIcon,
    Mail as MailIcon,
    AccountCircle as AccountCircleIcon,
} from "@mui/icons-material";


import { useNavigate } from "react-router-dom";

export default function MyAppBar() {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const navigate = useNavigate();

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const isMenuOpen = Boolean(anchorEl);

    return (
        <>
            <AppBar sx={{ bgcolor: "#000000ff" }}>
                <Toolbar>

                    <Stack direction="row" justifyContent="right" spacing={2} sx={{ flexGrow: 1, mr: 2 }}>
                        {/* Icône notifications */}
                        <IconButton color="inherit">
                            <Badge badgeContent={3} color="error">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>

                        {/* Icône messages */}
                        <IconButton 
                            color="inherit"
                            onClick={() => { navigate('/messagerie'); }}
                        >
                            <Badge badgeContent={5} color="error">
                                <MailIcon />
                            </Badge>
                        </IconButton>

                        {/* Icône profil */}
                        <IconButton
                            edge="end"
                            color="inherit"
                            onClick={handleProfileMenuOpen}
                        >
                            <AccountCircleIcon />
                        </IconButton>
                    </Stack>
                </Toolbar>
            </AppBar>

            {/* Menu déroulant du profil */}
            <Menu
                anchorEl={anchorEl}
                open={isMenuOpen}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <MenuItem onClick={handleMenuClose}>Profil</MenuItem>
                <MenuItem onClick={handleMenuClose}>Paramètres</MenuItem>
                <MenuItem onClick={handleMenuClose}>Déconnexion</MenuItem>
            </Menu>

            {/* Décalage pour que le contenu principal ne soit pas sous l'AppBar */}
            <Toolbar />
        </>
    );
}
