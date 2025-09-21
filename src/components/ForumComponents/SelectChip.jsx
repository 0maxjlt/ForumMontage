import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Autocomplete,
  Box,
  Chip,
  TextField
} from '@mui/material';

import {useState, useEffect} from 'react';


import { s } from 'framer-motion/client';

const chipColors = [
  '#4CAF50', '#388E3C', '#2D6A4F', '#1B5E20', '#2C6B2F',
  '#558B2F', '#4E9F3D', '#7CB342', '#81C784', '#6BBF59'
];

export default function SelectChip({ items, selectedItems, setSelectedItems }) {
  const theme = useTheme();

  const [tags, setTags] = useState([]);

  // Supprime un tag (Chip) cliqué
  function handleDelete(tagToDelete) {
    const updatedItems = selectedItems.filter(item => item !== tagToDelete);
    setSelectedItems(updatedItems);
  }

  // Quand l'utilisateur ajoute/supprime une valeur
  function handleChange(event, newValue) {
    setSelectedItems(newValue);
  }

  // On transforme la liste de tags en dictionnaire { tag: count }


  // Crée la liste d'options uniques avec counts affichés
  const uniqueTags = Object.keys(items).map(tag => `${tag} (${items[tag]})`);
  const sortedUniqueTags = uniqueTags.sort((a, b) => {
    const countA = parseInt(a.match(/\((\d+)\)$/)[1], 10);
    const countB = parseInt(b.match(/\((\d+)\)$/)[1], 10);
    return countB - countA; // Tri décroissant par count
  });

  // Fonction pour créer les Chips à afficher
  function renderTags(value, getTagProps) {
    return value.map((tagWithCount, index) => {
      const tagKey = `${tagWithCount}-${index}`; // clé unique
      const allTagProps = getTagProps({ index });

      const otherProps = { ...allTagProps };
      delete otherProps.key;

      return (
        <Chip
          key={tagKey}
          label={tagWithCount}
          onDelete={() => handleDelete(tagWithCount)}
          sx={{
            backgroundColor: chipColors[index % chipColors.length],
            color: 'white',
            fontWeight: 'medium'
          }}
          {...otherProps}
        />
      );
    });
  }

  return (
    <Box>
      <Autocomplete
        multiple
        options={sortedUniqueTags}
        value={selectedItems}
        onChange={handleChange}
        renderTags={renderTags}
        renderInput={(params) => (
          <Box sx={{ overflow: 'auto', padding: 1 }}>
            <TextField
              {...params}
              label="Mots-clés"
              variant="outlined"
              sx={{
                borderRadius: 2,
                height: 70,
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#81C784" },
                  "&:hover fieldset": { borderColor: "#A5D6A7" },
                  "&.Mui-focused fieldset": { borderColor: "#66BB6A" },
                }
              }}
            />
          </Box>
        )}
      />
    </Box>
  );
}
