import React, { useState, useEffect } from "react";
import Input from "@mui/material/Input";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import ClearIcon from "@mui/icons-material/Clear";

const ValidationSearchBar = ({ validationData, setFilteredValidation }) => {
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const filtervalidation = () => {
      const normalizedSearchTerm = searchTerm.toLowerCase();

      const filtered = validationData.filter((item) => {
        const { validationCode, rateId, quantity, discount } = item;
        return (
          validationCode?.toLowerCase().includes(normalizedSearchTerm) ||
          rateId?.displayName.toLowerCase().includes(normalizedSearchTerm) ||
          quantity?.toString().includes(normalizedSearchTerm) ||
          discount?.toString().includes(normalizedSearchTerm)
        );
      });

      setFilteredValidation(filtered);
    };

    filtervalidation();
  }, [searchTerm, setFilteredValidation, validationData]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

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

export default ValidationSearchBar;
