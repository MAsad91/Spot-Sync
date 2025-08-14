import React from "react";
import { Tooltip, MenuItem, FormControl } from "@mui/material";
import MDDropDown from "components/MDDropDown";

const SelectField = ({ name, value, options, handleQrCustom }) => {
  return (
    <div>
      <Tooltip title={`Customize ${name}`} placement="top">
        <FormControl>
          <MDDropDown
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            name={name}
            value={value === "squares" ? "Squares" : "Dots"}
            onChange={handleQrCustom}
          >
            {options.map((option, index) => (
              <MenuItem key={index} value={option}>
                {option}
              </MenuItem>
            ))}
          </MDDropDown>
        </FormControl>
      </Tooltip>
    </div>
  );
};

export default SelectField;
