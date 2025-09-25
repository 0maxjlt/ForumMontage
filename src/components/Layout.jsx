import React from "react";
import { Outlet } from "react-router-dom";
import MyBreadcrumbs from "./Header";
import MyDrawer from "./MyDrawer";
import { Box } from "@mui/material";

import MyAppBar from "./MyAppBar";

function Layout() {
  return (
    <Box sx={{ display: "flex" }}>
      {/* Drawer fixe à gauche */}



      <MyDrawer />
      <MyAppBar />
      {/* Contenu principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { sm: `260px` }, // pour laisser la place au drawer sur desktop
          mt: 8, // pour laisser la place à l'appbar
        }}
      >
        {/* En-tête de page 
        <MyBreadcrumbs />

        
        <hr />
        <br />
        */}

        {/* Contenu dynamique (Forum, Dashboard...) */}
        <Outlet />
      </Box>
    </Box>
  );
}

export default Layout;
