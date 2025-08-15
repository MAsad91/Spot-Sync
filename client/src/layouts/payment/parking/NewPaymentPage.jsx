import React, { useState, useEffect } from "react";
import Typography from "@mui/material/Typography";
import { useLocation, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { confirmAlert } from "react-confirm-alert"; // Import
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import DeleteOutlined from "@mui/icons-material/DeleteOutlined";
import { floor } from "lodash";

import {
  PaymentRequestButtonElement,
  CardElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

import { Button } from "@mui/material";
import { useDispatch } from "react-redux";
import { getCardDetails } from "store/slice/payment/paymentSlice";

const brandImgs = [
  {
    brand: "amex",
    img: "https://js.stripe.com/v3/fingerprinted/img/amex-a49b82f46c5cd6a96a6e418a6ca1717c.svg",
  },
  {
    brand: "unionpay",
    img: "https://js.stripe.com/v3/fingerprinted/img/unionpay-8a10aefc7295216c338ba4e1224627a1.svg",
  },
  {
    brand: "diners",
    img: "https://js.stripe.com/v3/fingerprinted/img/diners-fbcbd3360f8e3f629cdaa80e93abdb8b.svg",
  },
  {
    brand: "discover",
    img: "https://js.stripe.com/v3/fingerprinted/img/discover-ac52cd46f89fa40a29a0bfb954e33173.svg",
  },
  {
    brand: "mastercard",
    img: "https://js.stripe.com/v3/fingerprinted/img/mastercard-4d8844094130711885b5e41b28c9848f.svg",
  },
  {
    brand: "visa",
    img: "https://js.stripe.com/v3/fingerprinted/img/visa-729c05c240c4bdb47b03ac81d9945bfe.svg",
  },
  {
    brand: "jcb",
    img: "https://js.stripe.com/v3/fingerprinted/img/jcb-271fd06e6e7a2c52692ffa91a95fb64f.svg",
  },
];

const CheckoutForm = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setSubmitting] = useState(false);
  const [amount, setAmount] = useState("1");

  const [showCard, setShowCard] = useState(false);
  const [showOptions, setShowOptions] = useState(true);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showGoogle, setShowGoogle] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [showApple, setShowApple] = useState(false);
  const [progress, setProgress] = useState(true);
  const [errorAlert, setErrorAlert] = useState("");
  const location = useLocation();
  const cardDetails = useSelector((state) => state.payment.cardDetails);
  const shortlyId = new URLSearchParams(location?.search).get("sId");

  const [paymentMethods, setPaymentMethod] = useState(cardDetails);
  const [paymentRequest, setPaymentRequest] = useState(null);
  const ButtonOptions = {
    paymentRequest,
    style: {
      paymentRequestButton: {
        type: "default",
        theme: "dark",
        height: "53px",
        width: "100%",
        boxShadow: "none",
      },
    },
  };
  useEffect(() => {
    if (!shortlyId) {
      navigate("payment/result", {
        state: { status: "invalid" },
      });
    } else {
      handleGetShortlyData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortlyId]);

  async function handleGetShortlyData() {
    try {
      setProcessLoading(true);
      const res = await dispatch(getParkingShortlyData(shortlyId)).unwrap();
      console.log("res --->", res);
      if (!res?.success) {
        handleErrorResponse(res);
        return;
      }
      setShortlyData(res?.shortlyData);
      const customerId = res?.shortlyData?.customerId;
      console.log("customerId ====?", customerId);
      if (customerId) {
        const res = await dispatch(getCardDetails({ id: customerId, placeId: res?.shortlyData?.placeId?.id }))
        setSelectedPaymentMethod(res.paymentMethods[0].id);
        setPaymentMethod(res.paymentMethods);
      }
    } catch (error) {
      console.error("Failed to get shortly data:", error);
    } finally {
      setProcessLoading(false);
    }
  }

  if (stripe) {
    const pr = stripe.paymentRequest({
      country: "US",
      currency: "usd",
      total: {
        label: "Total Amount",
        amount: floor(amount * 100),
      },
      requestPayerName: true,
      requestPayerEmail: false,
      requestShipping: false,
    });
    pr.canMakePayment().then((result) => {
      if (result) {
        setShowApple(result.applePay);
        pr.on("paymentmethod", handlePaymentMethodReceived);
        pr.sessionId = sessionId;
        setPaymentRequest(pr);
        setSessionId(sessionId);
        setProgress(false);
      }
    });
    setProgress(false);
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (elements === null) {
      return;
    }
    setSubmitting(true);
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });
    if (error) {
      setErrorAlert(true);
      setLoading(false);
      console.log("error ===>", error);
    } else {
      postPayment(
        get(paymentMethod, "id", ""),
        get(formikProps, "values.saveLater", false)
      );
    }
  };

  const postPayment = async (cardId, saveLater) => {
    const payload = {
      shortlyId,
      customerId,
      paymentMethodId: cardId,
      saveCard: saveLater,
    };
    const res = await dispatch(postParkingCardPayment(payload))
      .unwrap()
      .then(async (result) => {
        if (result.success) {
          setLoading(false);
          navigate("/parking/payment/result", {
            state: {
              status: "paid",
              data: result.data,
            },
          });
        } else {
          navigate("/parking/payment/result", {
            state: { status: "failed", data: result },
          });
        }
      })
      .catch((error) => {
        console.log("post payment error========>", error);
      });
    return res;
  };
  const onCardSelect = (e) => {
    setSelectedPaymentMethod(e.target.value);
  };
  const onPayment = (event) => {
    event.preventDefault();
    const method = paymentMethods.filter((n) => {
      return n.id === selectedPaymentMethod;
    });
    payload.paymentMethod = method[0];
    if (payload.paymentMethod) {
      postPayment(payload);
    }
  };

  const handlePaymentMethodReceived = async (event) => {
    payload.paymentMethod = event.paymentMethod;
    payload.paymentMethodType = event.walletName;
    console.log("payload >>>> ", payload);
    if (payload && !payload?.sessionId) {
      payload.sessionId = sessionId;
    }
    const response = await props.store.shoreline.PostParkingPayment(payload);
    if (response.success) {
      event.complete("success");
      setSubmitting(false);
      navigate(
        `/success?reservationId=${response.reservationId}&message=${response.message}&confirmationMessage=${response.confirmationMessage}`
      );
    } else {
      if ((response.errorCode = "incorrect_cvc")) {
        setErrorAlert(true);
      } else {
        event.complete("fail");
        navigate(`/error?message=${response.message}`);
        setSubmitting(false);
      }
    }
  };

  const onCardPaymetMode = () => {
    if (paymentMethods.length > 0) {
      setShowCard(!showCard);
      setShowOptions(false);
    } else {
      setShowAddCard(true);
      setShowOptions(false);
    }
  };
  const onRemovePaymentMethod = async (id) => {
    const data = {
      paymentmethod: id,
    };
    const response = await props.store.shoreline.RemovePaymentMethod(data);
    if (response.success === true) {
      const res = await await props.store.shoreline.GetPaymentMethods(
        payload.mobile
      );
      if (res.paymentMethods.length > 0) {
        setSelectedPaymentMethod(res.paymentMethods[0].id);
        setPaymentMethod(res.paymentMethods);
      } else {
        setShowAddCard(true);
        setShowCard(false);
        setSelectedPaymentMethod("");
        setPaymentMethod([]);
      }
    }
  };
  const onTrash = (id) => {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className="alert">
            <h1 className="alert__title">Are you sure?</h1>
            <p className="alert__body">You want to delete this card?</p>
            <button onClick={onClose} className="alert__btn alert__btn--no">
              No
            </button>
            <button
              onClick={() => {
                onRemovePaymentMethod(id);
                onClose();
              }}
              className="alert__btn alert__btn--yes"
            >
              Yes
            </button>
          </div>
        );
      },
    });
  };
  return (
    <div>
      {progress ? (
        <Box component="div">
          <CircularProgress className="loader-img" />
        </Box>
      ) : (
        <div>
          <Box component="div"></Box>

          {showOptions ? (
            <div className="loginMainWrappeer">
              <header className="headerLogin"></header>
              <div className="loginwrapper">
                <div
                  className="payment-wrapper-outer mobile-wrapper-block"
                  id="payment-wrapper"
                >
                  <div className="container">
                    <div className="payment-title">
                      <h4 className="payment-heading">
                        Please Choose Your Payment Method to Confirm Your
                        Parking Session
                      </h4>
                    </div>
                    <div className="payment-type">
                      <div
                        className="payment-type-list"
                        style={{ cursor: "pointer" }}
                        onClick={onCardPaymetMode}
                      >
                        <div className="payment-img">
                          {" "}
                          <img
                            src="https://reservationpaymentportal.com/images/debit-card.svg"
                            alt=""
                          />
                        </div>
                        <h4>Card</h4>
                      </div>

                      {showApple ? (
                        <div
                          className="payment-type-list"
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            setShowGoogle(true);
                            return setShowOptions(false);
                          }}
                        >
                          <div className="payment-img">
                            <img
                              src="https://reservationpaymentportal.com/images/icons8-apple-pay.svg"
                              alt=""
                            />
                          </div>
                          <h4>Apple Pay</h4>
                        </div>
                      ) : (
                        <div
                          className="payment-type-list"
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            setShowGoogle(true);
                            return setShowOptions(false);
                          }}
                        >
                          <div className="payment-img">
                            <img
                              src="https://reservationpaymentportal.com/images/7123945_logo_pay_google_gpay_icon.png"
                              alt=""
                            />
                          </div>
                          <h4>Google Pay</h4>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          {showGoogle ? (
            <div className="loginMainWrappeer">
              <header className="headerLogin"></header>
              <div className="loginwrapper">
                <div className="payment-wrapper-outer" id="google-pay">
                  <div className="container">
                    <div className="google-pay-wrapper">
                      {showApple === true ? (
                        <div className="google_pay">
                          <div className="google-pay-img">
                            <img src="./images/icons8-apple-pay.svg" alt="" />
                          </div>
                          <h4>Apple Pay</h4>
                        </div>
                      ) : (
                        <div className="google_pay">
                          <div className="google-pay-img">
                            <img
                              src="https://reservationpaymentportal.com/images/7123945_logo_pay_google_gpay_icon.png"
                              alt=""
                            />
                          </div>
                          <h4>Google Pay</h4>
                        </div>
                      )}
                      <div className="pay-btn-box">
                        {paymentRequest ? (
                          <PaymentRequestButtonElement
                            options={ButtonOptions}
                          />
                        ) : (
                          "Sorry, your browser is not added to the google payment method"
                        )}
                      </div>
                    </div>
                    <p
                      className="choose_another_pay"
                      onClick={() => {
                        setShowOptions(true);
                        return setShowGoogle(false);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      Choose another way to pay
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          {showCard ? (
            <div className="loginMainWrappeer">
              <header className="headerLogin"></header>
              <div className="loginwrapper">
                <div>
                  <form onSubmit={onPayment}>
                    <Typography variant="h4" className="payment-heading mb-4">
                      {paymentMethods.length < 0
                        ? "Please enter your card details"
                        : "Credit and Debit Cards"}
                    </Typography>
                    <RadioGroup
                      aria-labelledby="demo-radio-buttons-group-label"
                      value={selectedPaymentMethod}
                      name="radio-buttons-group"
                    >
                      <ul className="cards-list">
                        {paymentMethods.map((item, i) => {
                          const imgData = brandImgs.filter((n) => {
                            return n.brand === item.brand;
                          });
                          let imgUrl = "";
                          if (imgData.length > 0) {
                            imgUrl = imgData[0].img;
                          }
                          return (
                            <li key={i}>
                              <div
                                style={{ cursor: "pointer", width: "90%" }}
                                onClick={() =>
                                  setSelectedPaymentMethod(item.id)
                                }
                              >
                                <div>
                                  <h4
                                    style={{
                                      textTransform: "capitalize",
                                      color: "#000",
                                    }}
                                  >
                                    {" "}
                                    Card ****{item.last4}{" "}
                                    <img src={imgUrl} alt="" />
                                  </h4>
                                  <h6 style={{ color: "#000" }}>
                                    Expires{" "}
                                    {`${item.exp_month}-${item.exp_year}`}
                                  </h6>
                                </div>
                              </div>
                              <div className="removemethod">
                                <div
                                  className="radioLeft"
                                  style={{ marginLeft: "auto" }}
                                >
                                  <FormControlLabel
                                    value={item.id}
                                    control={<Radio />}
                                    label=""
                                    onChange={onCardSelect}
                                  />
                                </div>
                                <Button
                                  className="buttonDelete"
                                  onClick={() => onTrash(item.id)}
                                >
                                  <DeleteOutlined />
                                </Button>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </RadioGroup>
                    {!isSubmitting ? (
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className=" gradientBtn"
                      >
                        Pay ${amount}
                      </Button>
                    ) : (
                      <Button disabled={isSubmitting} className=" gradientBtn">
                        Processing...
                      </Button>
                    )}
                  </form>

                  <div className="text-center">
                    <button
                      className="choosebtn"
                      onClick={() => {
                        setShowAddCard(true);
                        return setShowCard(false);
                      }}
                    >
                      Add new Card
                    </button>
                    <div className="text-center">
                      <button
                        className="choosebtn"
                        onClick={() => {
                          return (
                            setShowOptions(!showOptions),
                            setShowAddCard(false),
                            setShowCard(false)
                          );
                        }}
                      >
                        Choose another way to pay
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          {showAddCard ? (
            <div className="loginMainWrappeer">
              <header className="headerLogin"></header>
              <div className="loginwrapper">
                <div>
                  <form onSubmit={handleSubmit}>
                    <Typography variant="h6" className="mb-4">
                      Please enter your card details
                    </Typography>
                    <CardElement options={{ hidePostalCode: true }} />
                    <div className="text-center">
                      {errorAlert !== "" && (
                        <p className="error-alert">{errorAlert}</p>
                      )}
                      {!isSubmitting ? (
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className=" gradientBtn"
                        >
                          Pay ₨${amount}
                        </Button>
                      ) : (
                        <Button
                          // type="submit"
                          disabled={isSubmitting}
                          className=" gradientBtn"
                        >
                          Processing...
                        </Button>
                      )}
                    </div>
                    <div className="box1"></div>
                    <div className="box2"></div>
                  </form>
                  <div className="text-center">
                    <button
                      className="choosebtn"
                      onClick={() => {
                        return (
                          setShowOptions(!showOptions),
                          setShowAddCard(false),
                          setShowCard(false)
                        );
                      }}
                    >
                      Choose another way to pay
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div>
            <footer className="cardDetailsFooter">
              <p>
                By tapping pay, you agree to the{" "}
                <a href="https://www.ISBParking.pk/terms-of-use/">Terms of Use</a>{" "}
                and{" "}
                <a href="https://www.ISBParking.pk/privacy-policy/">
                  Privacy Policy
                </a>
              </p>
              <div className="logoBlock">
                <p
                  style={{
                    color: "#666",
                    marginBottom: "8px",
                    fontSize: "13px",
                  }}
                >
                  <span>Payments Powered by</span>
                </p>
                <img src="../../../images/isbp-logo.png" />
              </div>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

const stripePromise = loadStripe(process.env.REACT_APP_PUBLIC_KEY);

const PaymentPageNew = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
};

export default PaymentPageNew;
