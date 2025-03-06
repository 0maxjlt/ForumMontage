import React from 'react';  // Correct import
import { Breadcrumbs } from '@mui/material';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { useNavigate, useLocation} from "react-router-dom";
import Button from '@mui/material/Button';


function MyBreadcrumbs() {  // Déclaration correcte du composant et destructuration de props

    const navigate = useNavigate();
    const location = useLocation(); // Récupère la localisation actuelle
    const pathnames = location.pathname.split('/').filter((x) => x); // Découpe le chemin en segments

    return (
        <>
            <Breadcrumbs separator="/" aria-label="breadcrumb">
            
                {pathnames.map((item, index) => {
                    console.log(item);
                    return (
                        <Button 
                            key={index}  // Ajout de "key" pour éviter les avertissements dans la console
                            color="inherit"
                            onClick={() => navigate("/" + item)}  // Naviguer vers l'URL correspondante
                        >
                            {item}  {/* Afficher le texte du breadcrumb */}

                        </Button>
                    );
                })}
            </Breadcrumbs>
        </>

    );
}

export default MyBreadcrumbs;
