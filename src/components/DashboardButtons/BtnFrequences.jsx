import * as React from 'react';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Autocomplete from '@mui/material/Autocomplete';
import { Grow, Stack } from '@mui/material';

const publicationFrequencies = [
  'Personnalisée',
  'Hebdomadaire',
  'Mensuelle',
  'Quotidienne',
  'Une fois',
  'Occasionnelle',
 
];



export default function BtnFrequences({modifDetails, freqValue, setFreqValue}) {
  const [freqValue, setFreqValue] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [dialogValue, setDialogValue] = React.useState('');
  const [load, setLoad] = React.useState(false);

  const handleClose = () => {
    setDialogValue('');
    setOpen(false);
    setFreqValue(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFreqValue(dialogValue);
    handleClose();
  };

  React.useEffect(() => {
    console.log('value : ', value);
  }
    , [value]);


  return (
    <>

      <Autocomplete
        value={value}
        onChange={(event, newValue) => {
          if (newValue == 'Personnalisée'){setDialogValue(''); setOpen(true); }
          else if (!publicationFrequencies.includes(newValue)) {
            setDialogValue(newValue);
            setOpen(true);
          } else {
            setValue(newValue);
          }
        }}
        disabled={!modifDetails}
        options={publicationFrequencies}
        renderInput={(params) => <TextField {...params} label="Fréquence de publication" />}
        freeSolo
        sx={{ width: "100%" }}
        
      />
      <Dialog open={open} onClose={handleClose}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Ajouter une option</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              value={dialogValue}
              onChange={(event) => {setLoad(true); setDialogValue(event.target.value)}}
              label="Nouvelle fréquence"
              type="text"
              fullWidth
              
            />
          </DialogContent>
          <Stack spacing={2} display="flex" direction="row" justifyContent="center" alignItems="center">

          <DialogActions >
          <Button variant="contained" color="success" type="submit">
              Ajouter
            </Button>
          
            <Button variant="contained" color="error" onClick={handleClose}>
              Annuler
            </Button>
  
          </DialogActions>
          </Stack>
        </form>
      </Dialog>
    </>
  );
}
