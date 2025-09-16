import * as React from 'react';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close';

export default function TransitionAlerts({ message }) {
  const [open, setOpen] = React.useState(true);

  return (
    <Box
      sx={{
        position: "fixed", // pour que ça flotte au-dessus
        top: 100,       // distance depuis le haut
        left: { xs: 0, sm: 260 },
        right: 0,
        display: "flex",
        justifyContent: "center", // centré horizontalement
        zIndex: 1300, // au-dessus des autres composants
      }}
    >
      <Collapse in={open}>
        <Alert
          color="error"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setOpen(false)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ mb: 2 }}
        >
          {message}
        </Alert>
      </Collapse>
    </Box>
  );
}
