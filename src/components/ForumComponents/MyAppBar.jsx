import {
  Box,
  Typography,
  InputBase,
  Slider,
  Button,
  ButtonGroup,
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
  setFilter,
  setOrder,
  order,
  filter,
}) {
  const [tempPrice, setTempPrice] = useState([0, 100]);

  const handleSortClick = (field) => {
    if (filter === field) {
      setOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setFilter(field);
      setOrder("asc");
    }
  };

  const getButtonStyle = (field) => {
    if (filter === field && order === "asc") {
      return { backgroundColor: "#81C784", color: "white" }; // vert clair
    }
    if (filter === field && order === "desc") {
      return { backgroundColor: "#455A64", color: "white" }; // gris foncé
    }
    return { backgroundColor: "#2C2C2C", color: "white" }; // neutre sobre
  };

  return (
    <Stack direction="row" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
      {/* Recherche */}
      <Box
        sx={{
          flex: "1 1 250px",
          p: 2,
          bgcolor: "#2C2C2C",
          borderRadius: 3,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <SearchIcon sx={{ color: "#B0BEC5" }} />
        <InputBase
          placeholder="Rechercher une vidéo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ color: "white", flex: 1 }}
        />
      </Box>

      {/* Prix */}
      <Box
        sx={{
          flex: "1 1 250px",
          p: 2,
          bgcolor: "#2C2C2C",
          borderRadius: 3,
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1, color: "#B0BEC5" }}>
          {tempPrice[1] == 500 ?  `Prix : ${tempPrice[0]} - 500+ €` : `Prix : ${tempPrice[0]} - ${tempPrice[1]} €`}
        </Typography>
        <Slider
          defaultValue={[0, 200]}
          value={tempPrice}
          onChange={(e, newValue) => setTempPrice(newValue)}
          valueLabelDisplay="auto"
          min={0}
          max={500}
          valueLabelFormat={(value) => (value === 500 ? "500+" : value)}
          sx={{
            color: "#81C784",
            "& .MuiSlider-thumb": { backgroundColor: "#81C784" },
          }}
        />
        <Button
          fullWidth
          variant="contained"
          sx={{
            mt: 1,
            bgcolor: "#81C784",
            color: "black",
            "&:hover": { bgcolor: "#66BB6A" },
          }}
          onClick={() => setSelectedPrice(tempPrice)}
        >
          Valider
        </Button>
      </Box>

      {/* Mots clés */}
      <Box
        sx={{
          flex: "1 1 250px",
          p: 2,
          bgcolor: "#2C2C2C",
          borderRadius: 3,
          maxHeight: 150,
          overflowY: "auto",
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1, color: "#B0BEC5" }}>
          Mots clés
        </Typography>
        <SelectChip
          items={items}
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
        />
      </Box>

      {/* Tri */}
      <Box
        sx={{
          flex: "1 1 250px",
          p: 2,
          bgcolor: "#2C2C2C",
          borderRadius: 3,
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1, color: "#B0BEC5" }}>
          Trier par
        </Typography>
        <ButtonGroup fullWidth variant="contained" sx={{ borderRadius: 2, overflow: "hidden" }}>
          <Button sx={getButtonStyle("created_at")} onClick={() => handleSortClick("created_at")}>
            {filter === "created_at"
              ? order === "asc"
                ? "↓ Date"
                : "↑ Date"
              : "Date"}
          </Button>
          <Button sx={getButtonStyle("price_max")} onClick={() => handleSortClick("price_max")}>
            {filter === "price_max"
              ? order === "asc"
                ? "↓ Prix"
                : "↑ Prix"
              : "Prix"}
          </Button>
          <Button sx={getButtonStyle("title")} onClick={() => handleSortClick("title")}>
            {filter === "title"
              ? order === "asc"
                ? "↓ Nom"
                : "↑ Nom"
              : "Nom"}
          </Button>
        </ButtonGroup>
      </Box>
    </Stack>
  );
}
