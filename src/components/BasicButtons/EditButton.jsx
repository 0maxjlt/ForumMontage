import { Button, Icon } from "@mui/material";
import BuildIcon from '@mui/icons-material/Build';
import { Build } from "@mui/icons-material";

function EditButton({onClick}) {
  return (
    <>

    <Button onClick={onClick} startIcon={<BuildIcon />} variant="contained" color="secondary" size="small">
      Modifier
    </Button>

    </>
  );
 
}

export default EditButton;