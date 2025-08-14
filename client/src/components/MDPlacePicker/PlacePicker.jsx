import React, { useEffect, useState } from "react";
import { Autocomplete } from "@mui/material";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import {
  getPlaces,
  setPlaceData,
  setSelectedPlace,
} from "store/slice/places/placeSlice";
import MDBadge from "components/MDBadge";
import { getPlaceById } from "store/slice/places/placeSlice";
import { setSinglePlace } from "store/slice/places/placeSlice";

const PlacePicker = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const placesData = useSelector((state) => state.places.placeData).filter(
    (item) => item.status === 10
  );
  const [selectedPlaceId, setSelectedPlaceId] = useState("");

  useEffect(() => {
    handleGetPlaces();
  }, [placesData.length, selectedPlaceId]);

  const handleGetPlaces = async () => {
    try {
      // Check if placesData already has data, if so, skip the API call
      if (placesData.length === 0) {
        const response = await dispatch(getPlaces()).unwrap();
        if (response?.success) {
          const transformedPlaces = response?.places
            .filter((item) => item.status === 10)
            .map((item) => ({
              ...item,
              title: item.google.formatted_address,
            }));
          dispatch(setPlaceData(transformedPlaces));
          setDefaultPlaceId();
        }
      } else {
        setDefaultPlaceId();
      }
    } catch (error) {
      console.error("Error getting places:", error);
    }
  };

  const setDefaultPlaceId = () => {
    const storedPlaceId = localStorage.getItem("placeId");
    if (storedPlaceId) {
      setSelectedPlaceId(storedPlaceId);
      dispatch(getPlaceById(storedPlaceId))
      .unwrap()
      .then((res) => {
        if (res?.success) {
          dispatch(setSinglePlace(res?.place));
          dispatch(setSelectedPlace(res?.place));
        }
      });
    } else if (placesData.length > 0) {
      let placeId = new URLSearchParams(location?.search).get("placeId");
      let place = placesData.find((item) => item._id === placeId);

      if (placeId && place) {
        setSelectedPlaceId(placeId);
        dispatch(setSelectedPlace(place));
        dispatch(placeId)
        .unwrap()
        .then((res) => {
          if (res?.success) {
            dispatch(setSinglePlace(res?.place));
            dispatch(setSelectedPlace(res?.place));
          }
        });
      } else {
        setSelectedPlaceId(placesData[0]._id);
        dispatch(getPlaceById(placesData[0]._id))
        .unwrap()
        .then((res) => {
          if (res?.success) {
            dispatch(setSinglePlace(res?.place));
            dispatch(setSelectedPlace(res?.place));
          }
        });
      }
    }
  };

  const handleOptionChange = (_, selectedOption) => {
    if (selectedOption) {
      localStorage.setItem("placeId", selectedOption._id);
      setSelectedPlaceId(selectedOption._id);
      dispatch(setSelectedPlace(selectedOption));
      dispatch(getPlaceById(selectedOption._id))
        .unwrap()
        .then((res) => {
          console.log("res ===>",res)
          if (res?.success) {
            console.log("YOYO, Response", res?.place);
            dispatch(setSinglePlace(res?.place));
            dispatch(setSelectedPlace(res?.place));
          }
        });
    }
  };

  return (
    <MDBox height="100%" mt={0.5} lineHeight={1}>
      <Autocomplete
        options={placesData}
        getOptionLabel={(option) => {
          return (
            `( ${option.parkingCode} ) - ${option?.google?.formatted_address} (${option.timeZoneId})` ??
            option
          );
        }}
        renderOption={(props, option) => (
          <li {...props}>
            <div>
              <MDBadge
                badgeContent={<p>{option.parkingCode.toString()}</p>}
                color="secondary"
                variant="gradient"
                size="md"
              />
              {" | "}
              {option?.google?.formatted_address}
            </div>
          </li>
        )}
        name="place"
        autoHighlight
        disableClearable
        size="small"
        value={
          placesData.find((option) => option._id === selectedPlaceId) || null
        }
        onChange={handleOptionChange}
        renderInput={(params) => (
          <MDInput
            label="Place"
            fullWidth
            inputProps={{
              ...params.inputProps,
              autoComplete: "new-password",
            }}
            {...params}
          />
        )}
      />
    </MDBox>
  );
};

export default PlacePicker;
