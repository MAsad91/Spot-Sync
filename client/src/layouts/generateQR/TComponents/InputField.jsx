import MDInput from "components/MDInput";
import MDBox from "components/MDBox";

function InputField({ type, value, handleChange }) {
  const httpRgx = /^https?:\/\//;
  const handleValidateUrl = () => {
    if (type === "url" && value && !httpRgx.test(value)) {
      handleChange("http://" + value);
    }
  };

  return (
    <MDBox display="flex" alignItems="center" gap={2}>
      <MDInput
        name={type}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={type === "url" ? handleValidateUrl : null}
        label={`${type === "url" ? 'Copy and paste URL from Places.' : 'Title' }`}
        required
      />
    </MDBox>
  );
}

export default InputField;
