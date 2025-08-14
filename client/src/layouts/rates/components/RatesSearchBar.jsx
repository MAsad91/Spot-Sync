import React, { useState, useEffect } from "react";
import Input from "@mui/material/Input";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import ClearIcon from "@mui/icons-material/Clear";

const RatesSearchBar = ({ ratesData, setFilteredRates }) => {
  const [searchTerm, setSearchTerm] = useState("");
  console.log(ratesData, 13);
  useEffect(() => {
    const filterrates = () => {
      const normalizedSearchTerm = searchTerm.toLowerCase();

      const filtered = ratesData?.filter((item) => {
        const { displayName, amount, rateType, triggerName } = item;
        return (
          rateType.toLowerCase().includes(normalizedSearchTerm) ||
          displayName.toLowerCase().includes(normalizedSearchTerm) ||
          triggerName.includes(normalizedSearchTerm) ||
          amount?.toString().includes(normalizedSearchTerm)
        );
      });

      setFilteredRates(filtered);
    };

    filterrates();
  }, [searchTerm, setFilteredRates, ratesData]);

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

export default RatesSearchBar;
