import { Button, Icon } from "@mui/material";
import BuildIcon from '@mui/icons-material/Build';
import { Build } from "@mui/icons-material";
import SettingsIcon from '@mui/icons-material/Settings';

function EditButton({onClick}) {
  return (
    <>

    <Button onClick={onClick} startIcon={<SettingsIcon />} variant="contained" color="secondary" size="small" sx={{height: 35, width: '100%'}}>
      Modifier
    </Button>

    </>
  );
 
}

export default EditButton;