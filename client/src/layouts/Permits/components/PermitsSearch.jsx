import React, { useState, useEffect } from "react";
import Input from "@mui/material/Input";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import ClearIcon from "@mui/icons-material/Clear";

const PermitSearchBar = ({
  permitList,
  setFilteredPermit,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => {
    const filterSpermit = () => {
      const normalizedSearchTerm = searchTerm.toLowerCase();

      const filtered = permitList.filter((item) => {
        const { permitNumber, internalId, licensePlate, assignedName, email, phoneNo, status } = item;
        return (
          permitNumber?.includes(normalizedSearchTerm) ||
          internalId?.includes(normalizedSearchTerm) ||
          assignedName?.toLowerCase().includes(normalizedSearchTerm) ||
          email?.toLowerCase().includes(normalizedSearchTerm) ||
          phoneNo?.includes(normalizedSearchTerm) ||
          licensePlate?.some((plate) =>
            plate.toLowerCase().includes(normalizedSearchTerm)
          )
        );
      });
      setFilteredPermit(filtered);
    };
    filterSpermit();
  }, [searchTerm, setFilteredPermit, permitList]);

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

export default PermitSearchBar;
