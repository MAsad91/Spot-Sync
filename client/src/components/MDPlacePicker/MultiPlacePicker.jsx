import React, { useEffect, useState } from "react";
import { Autocomplete } from "@mui/material";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import { useDispatch, useSelector } from "react-redux";
import { getPlaces, setPlaceData, setMultiSelectedPlaces } from "store/slice/places/placeSlice";
import MDBadge from "components/MDBadge";
import { find } from "lodash";

const MultiPlacePicker = (props) => {
  const { notDefaultPlace } = props;
  const dispatch = useDispatch();
  let placesData = useSelector((state) => state.places.placeData).filter((item) => item.status === 10);
  const [selectedPlaceId, setSelectedPlaceId] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  notDefaultPlace && placesData.length > 1 && (placesData = [{ title: "All places", parkingCode: "All Places", _id: "all" }].concat(placesData));

  useEffect(() => {
    handleGetPlaces()
  }, [placesData.length]);

  const handleGetPlaces = async () => {
    try {
      const response = await dispatch(getPlaces()).unwrap();
      if (response?.success) {
        const transformedPlaces = response?.places
          .filter((item) => item.status === 10)
          .map((item) => ({ ...item, title: item.google.formatted_address }));
       await dispatch(setPlaceData(transformedPlaces));
        setDefaultPlaceId();
      }
    } catch (error) {
      console.error("Error getting places:", error);
    }
  };

  const setDefaultPlaceId = () => {
    const storedPlaceId = localStorage.getItem("placeId");
    if (storedPlaceId) {
      setSelectedPlaceId([storedPlaceId]);
      dispatch(setMultiSelectedPlaces([find(placesData, { _id: storedPlaceId })]));
    } else if (placesData.length > 0) {
      setSelectedPlaceId([placesData[placesData.length === 1 ? 0 : 1]._id]);
      dispatch(setMultiSelectedPlaces([placesData[placesData.length === 1 ? 0 : 1]]));
    }
  };

  const handleOptionChange = (_, selectedOption, reason, detail) => {
    if (notDefaultPlace) {
      if (reason === 'selectOption') {
        if (detail.option._id === 'all') {
          setSelectedPlaceId(['all']);
          dispatch(setMultiSelectedPlaces([detail.option]));
        } else {
          if (selectedPlaceId.includes('all')) {
            const updatedSelectedPlaces = selectedOption.filter(option => option._id !== 'all');
            setSelectedPlaceId(updatedSelectedPlaces.map(option => option._id));
            dispatch(setMultiSelectedPlaces(updatedSelectedPlaces));
          } else {
            setSelectedPlaceId([...selectedPlaceId, ...selectedOption.map(option => option._id)]);
            dispatch(setMultiSelectedPlaces(selectedOption));
          }
        }
      } else if (reason === 'removeOption') {
        const updatedSelectedPlaceId = selectedPlaceId.filter(id => id !== detail.option._id);
        if (updatedSelectedPlaceId.length === 0) {
          setSelectedPlaceId(['all']);
          dispatch(setMultiSelectedPlaces([placesData.find(place => place._id === 'all')]));
        } else {
          setSelectedPlaceId(updatedSelectedPlaceId);
          dispatch(setMultiSelectedPlaces(selectedOption.filter(option => option._id !== detail.option._id)));
        }
      } else if (reason === 'clear') {
        setSelectedPlaceId(['all']);
        dispatch(setMultiSelectedPlaces([placesData.find(place => place._id === 'all')]));
      }
    } else {
      if (selectedPlaceId.length > 1 && selectedPlaceId.includes('all')) {
        setSelectedPlaceId(selectedPlaceId.filter(id => id !== 'all'));
        dispatch(setMultiSelectedPlaces(selectedPlaceId.filter(id => id !== 'all')));
      }
      if (selectedOption.length > 0) {
        selectedOption.forEach((option) => {
          if (!selectedPlaceId.includes(option._id)) {
            setSelectedPlaceId([...selectedPlaceId, option._id]);
          }
        });
        dispatch(setMultiSelectedPlaces(selectedOption));
      }
    }
  };

  return (
    <MDBox height="100%" mt={0.5} lineHeight={1}>
      <Autocomplete
        multiple
        disableCloseOnSelect
        options={placesData}
        getOptionLabel={(option) => {
          return (option.parkingCode) ?? option;
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
        value={placesData.filter((option) => selectedPlaceId.includes(option._id)) || []}
        onChange={(_, option, reason, detail) => {
          handleOptionChange(_, option, reason, detail);
        }}
        renderInput={(params) => (
          <MDInput
            label="Place"
            fullWidth
            inputProps={{ ...params.inputProps, autoComplete: "new-password" }}
            {...params}
          />
        )}
      />
    </MDBox>
  );
};

export default MultiPlacePicker;
