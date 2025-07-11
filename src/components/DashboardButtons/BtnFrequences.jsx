import * as React from 'react';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

const publicationFrequencies = [
  'Personnalisée',
  'Hebdomadaire',
  'Mensuelle',
  'Quotidienne',
  'Une fois',
  'Occasionnelle',
];

export default function BtnFrequences({ setModifDetails, modifDetails, activeDetailsFreq, setActiveDetailsFreq, formData, setFormData, detSaved, detUndone, setDetSaved, setDetUndone }) {
  const [open, setOpen] = React.useState(false);
  const [dialogValue, setDialogValue] = React.useState('');

  React.useEffect(() => {
    if (modifDetails && formData.details.frequence) {
      setActiveDetailsFreq(formData.details.frequence);
    }
  }, [modifDetails, formData.details.frequence, setActiveDetailsFreq]);

  const handleClose = () => {
    setDialogValue('');
    setOpen(false);
  };

  const handleSubmit = (event) => {
    event?.preventDefault();
    console.log('Submit');
    if (dialogValue.trim() !== '' && !publicationFrequencies.includes(dialogValue)) {
      publicationFrequencies.push(dialogValue);
    }
    setActiveDetailsFreq(dialogValue);
    handleClose();
  };

  React.useEffect(() => {
    if (detSaved) {
      setFormData({
        ...formData,
        details: {
          ...formData.details,
          frequence: activeDetailsFreq,
        },
      });
      setDetSaved(false);
    }
    if (detUndone) {
      setActiveDetailsFreq(formData.details.frequence);
      setDetUndone(false);
    }
  }, [detSaved, detUndone]);

  const handleSelectChange = (event) => {
    const newValue = event.target.value;
    if (newValue === 'Personnalisée') {
      setDialogValue('');
      setOpen(true);
    } else {
      setActiveDetailsFreq(newValue);
    }
  };

  React.useEffect(() => {
    if (detailsSaved) {
      handleSubmit();
    }
    if (detailsUndone) {
      handleClose();
    }
  }
  , [detailsSaved, detailsUndone])
    

  return (
    <>
      <FormControl fullWidth>
        <InputLabel>{formData.details.frequence == undefined ? 'Fréquence' : ''}</InputLabel>
        <Select
          value={activeDetailsFreq || formData.details.frequence || ''}
          label="|| "
          disabled={!modifDetails}
          onChange={handleSelectChange}
        >
          {publicationFrequencies.map((freq, index) => (
            <MenuItem key={index} value={freq}>
              {freq}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Ajouter une option</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <TextField
              margin="dense"
              value={dialogValue}
              onChange={(event) => setDialogValue(event.target.value)}
              label="Nouvelle fréquence"
              type="text"
              fullWidth
            />
            <Button type="submit" color="primary">Ajouter</Button>
            <Button onClick={handleClose} color="secondary">Annuler</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
