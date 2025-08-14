import React, { useState } from "react";

import DeleteIcon from "@mui/icons-material/Delete";
import { alpha } from "@mui/material";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Stack from "@mui/material/Stack";

import Typography from "@mui/material/Typography";

import { find, get, isEmpty, map } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import { EffectCards, Pagination, Virtual, Keyboard } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";

import amexLogo from "../../../assets/images/card-logo/amex.svg";
import cardPattern from "../../../assets/images/card-logo/card-pattern.png";
import dinersLogo from "../../../assets/images/card-logo/diners.svg";
import discoverLogo from "../../../assets/images/card-logo/discover.svg";
import jcbLogo from "../../../assets/images/card-logo/jcb.svg";
import mastercardLogo from "../../../assets/images/card-logo/mastercard.svg";
import unionpayLogo from "../../../assets/images/card-logo/unionpay.svg";
import visaLogo from "../../../assets/images/card-logo/visa.svg";
import { stringToColor } from "global/functions";
import { ChipIcon } from "assets/icons";
import { deleteCard } from "store/slice/payment/paymentSlice";
import { getCardDetails } from "store/slice/payment/paymentSlice";
import DeleteDialog from "components/UIComponents/DeleteDialog";

const SavedCards = (props) => {
  const { customerId, formikProps, setShow } = props;
  const dispatch = useDispatch();
  const [cardId, setCardId] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  console.log("activeIndex", activeIndex);
  const [dialogOpen, setDialogOpen] = useState(false);

  const cardDetails = useSelector((state) => state.payment.cardDetails);
  const placeId = useSelector((state) => state.payment.placeId);

  const logoObj = [
    {
      name: "visa",
      logo: visaLogo,
    },
    {
      name: "amex",
      logo: amexLogo,
    },
    {
      name: "mastercard",
      logo: mastercardLogo,
    },
    {
      name: "discover",
      logo: discoverLogo,
    },
    {
      name: "diners",
      logo: dinersLogo,
    },
    {
      name: "jcb",
      logo: jcbLogo,
    },
    {
      name: "unionpay",
      logo: unionpayLogo,
    },
  ];

  const cardWrapper = {
    width: "100%",
    maxWidth: "89mm",
    height: "51mm",
    borderRadius: "3.18mm",
    padding: "3mm",
    backgroundImage:
      "linear-gradient(195deg, rgb(66, 66, 74), rgb(25, 25, 25))",
    boxShadow:
      "rgb(0 0 0 / 10%) 0rem 1.25rem 1.5625rem -0.3125rem, rgb(0 0 0 / 4%) 0rem 0.625rem 0.625rem -0.3125rem",
    backgroundPosition: "right",
    backgroundRepeat: "no-repeat",
    backdropFilter: " blur(16px) saturate(180%)",
    border: "1px solid rgba( 255, 255, 255, 0.18 )",
  };

  const handleDeleteCard = async (id) => {
    const res = await dispatch(deleteCard({ id, placeId }))
      .unwrap()
      .then(async (result) => {
        if (result.success) {
          setDialogOpen(false);
          await dispatch(getCardDetails({ id: customerId, placeId }))
            .unwrap()
            .then((result) => {
              if (result.success) {
                console.log("length===>", cardDetails.length);
                if (cardDetails.length < 1) {
                  setShow(false);
                }
              }
            })
            .catch((err) => {});
        } else {
        }
      })
      .catch((error) => {
        console.log("post payment error========>", error);
      });
    return res;
  };

  return (
    <Box component="div">
      <Box mt={3} px={1}>
        <Swiper
          slidesPerView={1}
          centeredSlides={true}
          longSwipes={true}
          virtual={true}
          grabCursor={true}
          effect={"cards"}
          loop={true}
          keyboard={true}
          pagination={{ clickable: true, dynamicBullets: true }}
          modules={[EffectCards, Virtual, Pagination, Keyboard]}
          style={{ paddingBottom: "40px" }}
          onRealIndexChange={(element) => setActiveIndex(element.activeIndex)}
        >
          {!isEmpty(cardDetails) &&
            map(cardDetails, (item, index) => {
              const cardLogo = find(
                logoObj,
                (data) => data.name === item.brand
              );
              return (
                <SwiperSlide key={index} virtualIndex={index}>
                  <Box className="d-flex align-items-center justify-content-center">
                    <Paper
                      sx={[
                        cardWrapper,
                        { background: alpha(stringToColor(item.brand), 0.95) },
                      ]}
                      className="position-relative"
                    >
                      <Box
                        sx={{
                          "& ::before": {
                            content: '""',
                            position: "absolute",
                            top: "0px",
                            right: "0px",
                            bottom: "0px",
                            left: "0px",
                            opacity: 0.03,
                            background: `url(${cardPattern}) 0% 0% / cover transparent`,
                            backgroundRepeat: "no-repeat",
                          },
                        }}
                        className="h-100"
                      >
                        <Stack
                          direction="column"
                          justifyContent="space-between"
                          className="h-100"
                        >
                          <Stack
                            direction="row"
                            spacing={0}
                            alignItems="center"
                            justifyContent="end"
                            className="position-relative zIndex-dropdown"
                          >
                            <Box>
                              <FormControl>
                                <RadioGroup
                                  aria-labelledby="demo-controlled-radio-buttons-group"
                                  name="selectedCard"
                                  value={formikProps.values.selectedCard}
                                  onChange={(_e, value) => {
                                    formikProps.setFieldValue(
                                      "selectedCard",
                                      value
                                    );
                                  }}
                                >
                                  <FormControlLabel
                                    value="female"
                                    control={
                                      <Radio
                                        sx={{
                                          color: "primary.contrastText",
                                          "&.Mui-checked": {
                                            color: "primary.contrastText",
                                          },
                                        }}
                                        value={item.id}
                                      />
                                    }
                                    className="m-0"
                                  />
                                </RadioGroup>
                              </FormControl>
                            </Box>
                            <IconButton
                              sx={{
                                color: "primary.contrastText",
                              }}
                              onClick={() => {
                                setCardId(item.id);
                                setDialogOpen(true);
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Stack>

                          <ChipIcon className="fs-1" />
                          <Stack
                            direction="row"
                            spacing={2}
                            alignItems="center"
                          >
                            <Typography
                              variant="h6"
                              sx={{ color: "primary.contrastText" }}
                            >
                              ****
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{ color: "primary.contrastText" }}
                            >
                              ****
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{ color: "primary.contrastText" }}
                            >
                              ****
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{ color: "primary.contrastText" }}
                            >
                              {get(item, "last4", "****")}
                            </Typography>
                          </Stack>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="start"
                            justifyContent="space-between"
                          >
                            <Box className="text-left">
                              <Typography
                                variant="subtitle1"
                                sx={{ color: "primary.contrastText" }}
                              >
                                EXP Date
                              </Typography>
                              <Typography
                                variant="subtitle2"
                                sx={{ color: "primary.contrastText" }}
                              >
                                {item.exp_month + "/" + item.exp_year}
                              </Typography>
                            </Box>
                            <Box>
                              <Box
                                component="img"
                                src={get(cardLogo, "logo", "visa")}
                                sx={{ width: "40px" }}
                              />
                            </Box>
                          </Stack>
                        </Stack>
                      </Box>
                    </Paper>
                  </Box>
                </SwiperSlide>
              );
            })}
        </Swiper>
      </Box>
      <DeleteDialog
        dialogOpen={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
        }}
        handelClick={() => handleDeleteCard(cardId)}
      />
    </Box>
  );
};

export default SavedCards;
