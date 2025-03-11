import { Button } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';

function DeleteIconButton({ onClick }) {
    return (
        <Button
            variant="contained"
            color="error"
            onClick={onClick}
           
        >
            <DeleteIcon />
        </Button>
    );
}

export default DeleteIconButton;