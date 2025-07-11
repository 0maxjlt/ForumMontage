import React from "react";
import { Outlet } from "react-router-dom";
import MyBreadcrumbs from "./Header";
import MyDrawer from "./MyDrawer";
import { Box } from "@mui/material";

function Layout() {
  return (
    <Box sx={{ display: "flex" }}>
      {/* Drawer fixe à gauche */}
      <MyDrawer />

      {/* Contenu principal */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        {/* En-tête de page */}
        <MyBreadcrumbs />

        {/* Séparateur */}
        <hr />
        <br />

        {/* Contenu dynamique (Forum, Dashboard...) */}
        <Outlet />
      </Box>
    </Box>
  );
}

export default Layout;
