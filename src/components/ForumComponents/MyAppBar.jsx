import {
    Box, Typography, InputBase, Slider, Paper, Button, Stack
} from "@mui/material";
import React, { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import SelectChip from "../ForumComponents/SelectChip";
import { useEffect } from "react";

export default function MyAppBar({ searchTerm, setSearchTerm, selectedPrice, setSelectedPrice, items, selectedItems, setSelectedItems }) {
    const [sort, setSort] = useState("date");
    const [tempPrice, setTempPrice] = useState([0, 100]);

    useEffect(() => {
        console.log("prix recherché", selectedPrice);
    }, [selectedPrice]);


    return (
        <Box sx={{ backgroundColor: "#121212", p: 3, width: "100%" }}>
            <Box sx={{ display: "flex", gap: 3, width: "100%" }}>

                {/* Recherche */}
                <Paper sx={{
                    p: 1.5, // Réduit le padding pour gagner de la place
                    backgroundColor: "#1C1C1C",
                    color: "white",
                    flex: 1,
                    borderRadius: 2,
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)"
                }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Filtrage de vos recherches</Typography>
                    <Stack direction="row" spacing={1}>
                        <SearchIcon sx={{ color: "#B0BEC5" }} />
                        <InputBase
                            placeholder="Rechercher une vidéo"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{
                                color: "white",
                                width: "100%",

                            }}
                        />
                    </Stack>
                </Paper>

                {/* Prix */}
                <Paper sx={{
                    // Réduit le padding pour gagner de la place
                    p: 1.5,
                    backgroundColor: "#1C1C1C",
                    color: "white",
                    flex: 1,
                    borderRadius: 2,
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)"

                }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        Prix {tempPrice[0]} - {tempPrice[1]}
                    </Typography>

                    <Stack direction="column" spacing={1} alignItems={"center"} sx={{ mb: 1 }}>
                        <Slider

                            value={tempPrice}
                            onChange={(e, newValue) => setTempPrice(newValue)}
                            valueLabelDisplay="auto"
                            
                            sx={{
                                width: "80%",
                                justifyContent: "center",
                                color: "#81C784",
                                mt: 1,
                                "& .MuiSlider-thumb": {
                                    backgroundColor: "#81C784",
                                },

                            }}
                            min={0}
                            max={500}
                        />

                        <Button color="success" onClick={() => setSelectedPrice(tempPrice)}>Valider</Button>
                    </Stack>
                </Paper>

                {/* Mots clés */}
                <Paper sx={{
                    p: 1.5, // Réduit le padding pour gagner de la place
                    backgroundColor: "#1C1C1C",
                    color: "white",
                    flex: 1,
                    borderRadius: 2,
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                    width: "100%",
                    overflowY: "auto", // Permet de scroller si nécessaire
                    maxHeight: 150 // Limite la hauteur pour éviter de prendre trop de place
                }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Mots clés</Typography>
                    <SelectChip
                        items={items}
                        selectedItems={selectedItems}
                        setSelectedItems={setSelectedItems}
                        sx={{ maxHeight: 100, overflowY: "auto", width:"100%" }} // Limite la hauteur pour les chips

                    />
                </Paper>

                {/* Tri */}
                <Paper sx={{
                    p: 1.5, // Réduit le padding pour gagner de la place
                    backgroundColor: "#1C1C1C",
                    color: "white",
                    flex: 1,
                    borderRadius: 2,
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)"
                }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Trier par</Typography>
                    <Box display="flex" flexDirection="row" gap={1}>
                        <Button
                            sx={{
                                color: "white",
                                flexGrow: 1,
                                "&:hover": { backgroundColor: "#388E3C" },
                            }}
                            onClick={() => setSort("date")}
                        >
                            ↑ Date
                        </Button>
                        <Button
                            sx={{
                                color: "white",
                                flexGrow: 1,
                                "&:hover": { backgroundColor: "#388E3C" },
                            }}
                            onClick={() => setSort("price")}
                        >
                            ↑ Prix
                        </Button>
                        <Button
                            sx={{
                                color: "white",
                                flexGrow: 1,
                                "&:hover": { backgroundColor: "#388E3C" },
                            }}
                            onClick={() => setSort("name")}
                        >
                            ↓ Nom
                        </Button>
                    </Box>
                </Paper>

            </Box>
        </Box>
    );
}
