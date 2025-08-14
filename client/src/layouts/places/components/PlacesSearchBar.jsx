import React, { useState, useEffect } from "react";
import Input from "@mui/material/Input";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import ClearIcon from "@mui/icons-material/Clear";

const PlacesSearchBar = ({ placesList, setFilteredPlaces }) => {
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const filterplaces = () => {
      const normalizedSearchTerm = searchTerm.toLowerCase();

      const filtered = placesList.filter((item) => {
        const { parkingCode, paymentGateway, google, brandId } = item;
        return (
          google?.formatted_address
            ?.toLowerCase()
            .includes(normalizedSearchTerm) ||
          parkingCode?.toLowerCase().includes(normalizedSearchTerm) ||
          paymentGateway?.includes(normalizedSearchTerm) ||
          brandId?.brandName.includes(normalizedSearchTerm)
        );
      });

      setFilteredPlaces(filtered);
    };

    filterplaces();
  }, [searchTerm, setFilteredPlaces, placesList]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  console.log("filteredPlaces ---->", placesList);

  return (
    <>
      <Input
        placeholder="Search"
        value={searchTerm}
        onChange={handleSearch}
        endAdornment={
          <InputAdornment position="end">
            {searchTerm && (
              <IconButton color="secondary" onClick={clearSearch} size="medium">
                <ClearIcon />
              </IconButton>
            )}
            <IconButton color="secondary" size="medium">
              <SearchIcon />
            </IconButton>
          </InputAdornment>
        }
      ></Input>
    </>
  );
};

export default PlacesSearchBar;
