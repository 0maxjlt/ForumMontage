import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
function AddButton({ onClick, text }) {
    return (
        <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={onClick}
            sx={{ width: '100%', height: 270 }}
        >
            {text}
        </Button>

    );
}

export default AddButton;