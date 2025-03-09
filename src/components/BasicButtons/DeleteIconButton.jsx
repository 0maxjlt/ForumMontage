import { Button } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';

function DeleteIconButton({ onClick }) {
    return (
        <Button
            variant="contained"
            color="error"
            onClick={onClick}
            sx={{ display:"flex", justifyContent: "center", alignItems: "center", width: '10%' }}
        >
            <DeleteIcon />
        </Button>
    );
}

export default DeleteIconButton;