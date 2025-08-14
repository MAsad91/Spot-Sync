import React, { useState, useRef, useEffect } from "react";
import MDButton from "components/MDButton";
import { SketchPicker } from "react-color";
import { Tooltip } from "@mui/material";
import MDBox from "components/MDBox";

const InputPicker = ({ id, label, customColor, handleQrCustom }) => {
  const [state, setState] = useState({
    showBGPicker: false,
    showQRPicker: false,
  });
  const pickerRef = useRef(null);

  const handleClickOutside = (event) => {
    if (pickerRef.current && !pickerRef.current.contains(event.target)) {
      setState({ showBGPicker: false, showQRPicker: false });
    }
  };

  useEffect(() => {
    window.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleTogglePicker = (picker) => {
    setState((prevState) => ({
      showBGPicker: picker === "bg" ? !prevState.showBGPicker : false,
      showQRPicker: picker === "qr" ? !prevState.showQRPicker : false,
    }));
  };

  return (
    <MDBox ref={pickerRef}>
      <Tooltip title={`Customize ${label}`} placement="top">
        <MDButton
          id={id}
          name={id}
          variant="contained"
          sx={{ border: `1px solid gray` }}
          style={{ background: customColor }}
          onClick={() => handleTogglePicker(id === "qrBgColor" ? "bg" : "qr")}
        ></MDButton>
      </Tooltip>

      {state.showBGPicker && (
        <div style={{ position: "absolute", zIndex: 1000 }}>
          <SketchPicker
            presetColors={["#000000", "#FFFFFF"]}
            color={customColor}
            onChange={handleQrCustom}
          />
        </div>
      )}
      {state.showQRPicker && (
        <div style={{ position: "absolute", zIndex: 1000 }}>
          <SketchPicker
            presetColors={["#000000", "#FFFFFF"]}
            color={customColor}
            onChange={handleQrCustom}
          />
        </div>
      )}
    </MDBox>
  );
};

export default InputPicker;
