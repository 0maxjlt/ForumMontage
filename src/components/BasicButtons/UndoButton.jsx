import { Button } from "@mui/material";

function UndoButton({onClick}) {
  return (
    <Button onClick={onClick} variant="contained" color="error" size="small" sx={{ width: '100%' }}>
      Annuler
    </Button>
  );
}

export default UndoButton;