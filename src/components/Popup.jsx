import { useEffect, useState } from "react";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";

export default function Popup({ popup, setPopup }) {
    const [anchorEl, setAnchorEl] = useState(popup);

    useEffect(() => {
        setAnchorEl(popup);
    }, [popup]);

    const handleClose = () => {
        setAnchorEl(null);
        setPopup(null); 
    };

    const open = Boolean(anchorEl);
    const id = open ? "simple-popover" : undefined;

    return (
        <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
            }}
        >
            <Typography sx={{ p: 2 }}>Erreur de connexion. Veuillez réessayer.</Typography>
        </Popover>
    );
}
