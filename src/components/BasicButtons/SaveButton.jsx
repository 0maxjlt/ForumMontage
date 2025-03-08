    import { Button } from "@mui/material";

    function SaveButton({onClick}) {
    return (
        <Button onClick={onClick} variant="contained" color="success" size="small" sx={{ width: '100%' }}>
        Sauvegarder
        </Button>
    );
    }

    export default SaveButton;