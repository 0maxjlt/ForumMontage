import React from "react";
import { Link } from "react-router-dom";
import { Outlet } from "react-router-dom";
import MyBreadcrumbs from "./Breadcrumbs";

function Layout() {
  return (
    <div>
      {/* Menu de navigation commun */}
      <nav>
        <MyBreadcrumbs />
      </nav>

      {/* Séparateur */}
      <hr />
      <br/>
      

      {/* Zone où la page actuelle sera affichée */}
      <Outlet />
    </div>
  );
}

export default Layout;
