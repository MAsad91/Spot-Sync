import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import { useMaterialUIController } from "context";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditorHTMLViewBox from "components/UIComponents/RichTextEditor/EditorHTMLViewBox";
import MDBox from "components/MDBox";

function PreViewCard({ content }) {
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;

  const cardStyle = {
    width: "100px",
    height: "100px",
    position: "relative",
    transition: "background 0.3s ease-out",
  };

  const iconStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    opacity: 0,
    transition: "opacity 0.3s ease-out",
  };

  const contentStyle = {
    fontSize: "10px", // Adjust font size as needed
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    marginTop: "5px", // Add space below the card for the content
  };

  return (
    <Card
      sx={cardStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(0, 0, 0, 0.1)";
        e.currentTarget.querySelector(".icon").style.opacity = 1;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.querySelector(".icon").style.opacity = 0;
      }}
    >
      <CardContent>
        <IconButton className="icon" style={iconStyle}>
          <VisibilityIcon />
        </IconButton>
        <MDBox style={contentStyle}>
          <EditorHTMLViewBox data={content} />
        </MDBox>
      </CardContent>
    </Card>
  );
}

PreViewCard.defaultProps = {
  color: "info",
  percentage: {
    color: "success",
    text: "",
    label: "",
  },
};

PreViewCard.propTypes = {
  color: PropTypes.oneOf([
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "light",
    "dark",
  ]),
  title: PropTypes.string.isRequired,
  count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  percentage: PropTypes.shape({
    color: PropTypes.oneOf([
      "primary",
      "secondary",
      "info",
      "success",
      "warning",
      "error",
      "dark",
      "white",
    ]),
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    label: PropTypes.string,
  }),
  icon: PropTypes.node.isRequired,
};

export default PreViewCard;
