import * as React from 'react';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import { FormControl, InputLabel, MenuItem, Select, Stack, Slide } from '@mui/material';
import SaveButton from '../BasicButtons/SaveButton';
import UndoButton from '../BasicButtons/UndoButton';
import Zoom from '@mui/material/Zoom';
import Fade from '@mui/material/Fade';

const publicationFrequencies = [
  'Personnalisée',
  'Hebdomadaire',
  'Mensuelle',
  'Quotidienne',
  'Une fois',
  'Occasionnelle',
];

export default function BtnFrequences({ modifDetails, activeDetailsFreq, setActiveDetailsFreq, formData, setFormData }) {
  const [open, setOpen] = React.useState(false);
  const [dialogValue, setDialogValue] = React.useState('');

  const handleClose = () => {
    setDialogValue('');
    setOpen(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (dialogValue.trim() !== '') {
      if (!publicationFrequencies.includes(dialogValue)) {
        publicationFrequencies.push(dialogValue);
        setActiveDetailsFreq(dialogValue);
      }
      else{
        setActiveDetailsFreq(dialogValue);
      }
      
    }
    handleClose();
  };

  React.useEffect(() => {
    formData.details.frequence === undefined ? handleClose() : console.log('formData.details.frequence : ', formData.details.frequence);
  }
  , [formData.details.frequence])
    ;

  React.useEffect(() => {
    console.log('details : ', formData.details.frequence);
  }, [formData.details.frequence]);

  return (
    <>
      <FormControl fullWidth>
        <InputLabel>Fréquence</InputLabel>
        <Select
          value={activeDetailsFreq || formData.details.frequence || ''}
          label="Fréquence"
          disabled={!modifDetails}
          onChange={(event) => {
            const newValue = event.target.value;
            if (newValue === 'Personnalisée') {
              setDialogValue('');
              setOpen(true);
            } else {
              setActiveDetailsFreq(newValue);
            }
          }}
        >
          {publicationFrequencies.map((freq, index) => (
            <MenuItem key={index} value={freq}>
              {freq}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    
    
      <Dialog open={open} TransitionComponent={Zoom} onClose={handleClose}>
        <DialogTitle>Ajouter une option</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            value={dialogValue}
            onChange={(event) => setDialogValue(event.target.value)}
            label="Nouvelle fréquence"
            type="text"
            fullWidth
          />
        </DialogContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} sx={{ p: 2 }}>
          <SaveButton onClick={handleSubmit} />
          <UndoButton onClick={handleClose} />
        </Stack>
      </Dialog>
    </>
  );
}