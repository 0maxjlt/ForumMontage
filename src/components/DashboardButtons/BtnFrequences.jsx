import * as React from 'react';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Autocomplete from '@mui/material/Autocomplete';
import { Grow, Stack } from '@mui/material';
import SaveButton from '../BasicButtons/SaveButton';
import UndoButton from '../BasicButtons/UndoButton';

const publicationFrequencies = [
  'Personnalisée',
  'Hebdomadaire',
  'Mensuelle',
  'Quotidienne',
  'Une fois',
  'Occasionnelle',
];



export default function BtnFrequences({ modifDetails, formData, setFormData, activeDetails, setActiveDetails }) {
  const [open, setOpen] = React.useState(false);
  const [dialogValue, setDialogValue] = React.useState('');
  const [load, setLoad] = React.useState(false);
  const [tempDialogValue, setTempDialogValue] = React.useState('');


  const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  });

  const handleClose = () => {
    setDialogValue('');
    setOpen(false);
    setActiveDetails('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormData({ ...formData, details: { ...formData.details, frequence: dialogValue } });

    handleClose();
  };

  React.useEffect(() => {
    console.log('details : ', formData.details.frequence);
  }
    , [formData.details.frequence]);

  return (
    <>

      <Autocomplete
        value={formData != "" ? formData.details.frequence : activeDetails}
        onChange={(event, newValue) => {
          if (newValue == 'Personnalisée') { setDialogValue(''); setOpen(true); }

          else {
            console.log('newValue : ', newValue);
            if (newValue == '' || newValue == null) {
              setOpen(false);
            }
            else {
              setActiveDetails(newValue);
              setDialogValue(newValue);
            }
          }
        }}
        disabled={!modifDetails}
        options={publicationFrequencies}
        renderInput={(params) => <TextField {...params} label="Fréquence de publication" />}

        sx={{ width: "100%" }}

      />
      <Dialog open={open}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Ajouter une option</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              value={tempDialogValue}
              onChange={(event) => { setTempDialogValue(event.target.value) }}
              label="Nouvelle fréquence"
              type="text"
              fullWidth              
            />
          </DialogContent>

        </form>
        <Stack display={'flex'} direction={'row'} justifyContent={'space-between'} alignItems={'center'} spacing={2} sx={{ p: 2 }}>
          <SaveButton onClick={{handleSubmit, handleClose }} />
          <UndoButton onClick={handleClose} />
        </Stack>
      </Dialog>
    </>
  );
}
