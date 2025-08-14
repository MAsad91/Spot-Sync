import { useRef } from "react";
import { StandaloneSearchBox, LoadScript } from "@react-google-maps/api";
import { memo } from "react";
import MDInput from "components/MDInput";

const libraries = ["places"];
const GooglePlacePicker = (props) => {
  const { label, name, values, setFieldValue, handleBlur, handleChange } =
    props;
  const inputRef = useRef();

  const handlePlaceChanged = () => {
    const [place] = inputRef.current.getPlaces();
    if (place) {
      setFieldValue(name, place);
    }
  };
  return (
    <LoadScript
      googleMapsApiKey="AIzaSyApoEp1t737jcn-IhHPHngBPZCuSAvrqkk"
      libraries={libraries}
    >
      <StandaloneSearchBox
        onLoad={(ref) => (inputRef.current = ref)}
        onPlacesChanged={handlePlaceChanged}
      >
        <MDInput
          name={name}
          value={values}
          onChange={handleChange}
          onBlur={handleBlur}
          label={label}
          error={props.errors[name] && props.touched[name] ? true : false}
          success={props.errors[name] && props.touched[name] ? false : true}
          helperText={
            props.errors[name] && props.touched[name]
              ? props.errors[name]
              : null
          }
        />
      </StandaloneSearchBox>
    </LoadScript>
  );
};

export default memo(GooglePlacePicker);
