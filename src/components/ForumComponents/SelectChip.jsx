import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import {
    Autocomplete,
    Box,
    Chip,
    TextField
} from '@mui/material';

const chipColors = [
    '#4CAF50', '#388E3C', '#2D6A4F', '#1B5E20', '#2C6B2F',
    '#558B2F', '#4E9F3D', '#7CB342', '#81C784', '#6BBF59'
];

export default function SelectChip({ items, selectedItems, setSelectedItems }) {
    const theme = useTheme();

    // Supprime un tag (Chip) cliqué
    function handleDelete(tagToDelete) {
        const updatedItems = selectedItems.filter(function (item) {
            return item !== tagToDelete;
        });
        setSelectedItems(updatedItems);
    }

    // Quand l'utilisateur ajoute/supprime une valeur
    function handleChange(event, newValue) {
        setSelectedItems(newValue);
    }

    // Fonction pour créer les Chips à afficher
    function renderTags(value, getTagProps) {
        const chipsToRender = [];

        for (let i = 0; i < value.length; i++) {
            const tag = value[i];
            const allTagProps = getTagProps({ index: i });

            const chipKey = allTagProps.key;
            const otherProps = { ...allTagProps };
            delete otherProps.key; // on enlève "key" de l'objet à spread

            const chip = (
                <Chip
                    key={chipKey} // ✅ passé directement
                    label={tag}
                    onDelete={function () {
                        handleDelete(tag);
                    }}
                    sx={{
                        backgroundColor: chipColors[i % chipColors.length],
                        color: 'white',
                        fontWeight: 'medium'
                    }}
                    {...otherProps} // ✅ "key" n'est plus dedans
                />
            );

            chipsToRender.push(chip);
        }

        return chipsToRender;
    }


    return (
        <Box>
            <Autocomplete
                multiple={true}
                options={items}
                value={selectedItems}
                onChange={handleChange}
                renderTags={renderTags}

                renderInput={function (params) {
                    return (
                        <Box sx={{ overflow: 'auto', padding: 1 }}>
                            <TextField
                                {...params}
                                label="Mots-clés"
                                variant="outlined"
                                sx={{
                                    borderRadius: 2,
                                    height: 70,
                                    "& .MuiOutlinedInput-root": {
                                        "& fieldset": {
                                            borderColor: "#81C784",
                                        },
                                        "&:hover fieldset": {
                                            borderColor: "#A5D6A7",
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderColor: "#66BB6A",
                                        },
                                    }
                                }}
                            />
                        </Box>

                    );
                }}
            />
        </Box>
    );
}
