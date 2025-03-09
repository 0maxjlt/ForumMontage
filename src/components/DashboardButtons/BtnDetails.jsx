import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import { Stack } from '@mui/material';

function BtnDetails() {
    const [value, setValue] = React.useState([0, 5]); // Min and max indices

    // List of actual values
    const realValues = [0, 1, 2, 3, 4, 5, 10, 15, 20, 25, 30, 40, 50, 60, 90, "120+"];

    // Convert index to real value
    const scale = (index) => realValues[index];

    // Convert real value to index
    const unscale = (realValue) => realValues.indexOf(realValue);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Stack spacing={2} display="flex" direction="row" alignItems="center"  sx={{ width: "100%" }}>
            <Stack display="flex" direction="column" alignItems="center" justifyContent="space-between" sx={{ width: "50%" }}>

            <Typography variant='button' sx={{
                color: 'text.secondary',
                width: '100%',
                
             }}>
                {scale(value[0]) === scale(value[1])
                    ? scale(value[0]) == 1 ? `${scale(value[0])} minute` :
                        `${scale(value[0])} minutes`
                    : `${scale(value[0])} - ${scale(value[1])} minutes`}
            </Typography>
            </Stack>
            <Slider

                min={0}
                max={realValues.length - 1} // Max index
                step={1}
                value={value}
                color='secondary'
                onChange={handleChange}
                valueLabelDisplay="auto"
                valueLabelFormat={(index) => scale(index)} // Display real values
                
            />
        </Stack>
    );
}

export default BtnDetails;
