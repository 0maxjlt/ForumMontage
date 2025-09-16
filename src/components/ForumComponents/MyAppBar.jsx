import {
  Box,
  Typography,
  InputBase,
  Slider,
  Paper,
  Button,
  Stack,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import SearchIcon from "@mui/icons-material/Search";
import SelectChip from "../ForumComponents/SelectChip";

export default function MyAppBar({
  searchTerm,
  setSearchTerm,
  selectedPrice,
  setSelectedPrice,
  items,
  selectedItems,
  setSelectedItems,
}) {
  const [sort, setSort] = useState("date");
  const [tempPrice, setTempPrice] = useState([0, 100]);

  useEffect(() => {
    console.log("Prix sélectionné :", selectedPrice);
  }, [selectedPrice]);

  return (
    <Stack
      direction="row"
      flexWrap="wrap"
      gap={2}
      sx={{ mb: 2 }}
    >
      {/* Recherche */}
      <Paper
        sx={{
          minWidth: 250,
          flex: "1 1 250px",
          p: 2,
          bgcolor: "#1C1C1C",
          color: "white",
          borderRadius: 2,
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Filtrage de vos recherches
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <SearchIcon sx={{ color: "#B0BEC5" }} />
          <InputBase
            placeholder="Rechercher une vidéo"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ color: "white", width: "100%" }}
          />
        </Stack>
      </Paper>

      {/* Prix */}
      <Paper
        sx={{
          minWidth: 250,
          flex: "1 1 250px",
          p: 2,
          bgcolor: "#1C1C1C",
          color: "white",
          borderRadius: 2,
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Prix {tempPrice[0]} - {tempPrice[1]}
        </Typography>
        <Stack direction="column" spacing={1} alignItems="center">
          <Slider
            value={tempPrice}
            onChange={(e, newValue) => setTempPrice(newValue)}
            valueLabelDisplay="auto"
            min={0}
            max={500}
            sx={{
              width: "80%",
              color: "#81C784",
              "& .MuiSlider-thumb": { backgroundColor: "#81C784" },
            }}
          />
          <Button
            color="success"
            onClick={() => setSelectedPrice(tempPrice)}
            sx={{ mt: 1 }}
          >
            Valider
          </Button>
        </Stack>
      </Paper>

      {/* Mots clés */}
      <Paper
        sx={{
          minWidth: 250,
          flex: "1 1 250px",
          p: 2,
          bgcolor: "#1C1C1C",
          color: "white",
          borderRadius: 2,
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          maxHeight: 150,
          overflowY: "auto",
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Mots clés
        </Typography>
        <SelectChip
          items={items}
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          sx={{ width: "100%", maxHeight: 100, overflowY: "auto" }}
        />
      </Paper>

      {/* Tri */}
      <Paper
        sx={{
          minWidth: 250,
          flex: "1 1 250px",
          p: 2,
          bgcolor: "#1C1C1C",
          color: "white",
          borderRadius: 2,
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Trier par
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            sx={{
              color: "white",
              flex: 1,
              "&:hover": { backgroundColor: "#388E3C" },
            }}
            onClick={() => setSort("date")}
          >
            ↑ Date
          </Button>
          <Button
            sx={{
              color: "white",
              flex: 1,
              "&:hover": { backgroundColor: "#388E3C" },
            }}
            onClick={() => setSort("price")}
          >
            ↑ Prix
          </Button>
          <Button
            sx={{
              color: "white",
              flex: 1,
              "&:hover": { backgroundColor: "#388E3C" },
            }}
            onClick={() => setSort("name")}
          >
            ↓ Nom
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
