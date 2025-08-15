const {
  Types: { ObjectId },
} = require("mongoose");
const {
  generateShortlyId,
  capitalizeFirstLetter,
  licensePlateArrayToString,
  getSubscriptionDuration,
  getDatesFromDuration,
  amountToShow,
  generateExternalKey,
} = require("../../../../global/functions");
const { http200, http400 } = require("../../../../global/errors/httpCodes");
const Subscriptions = require("../../../../models/subscriptions");
const Customer = require("../../../../models/customers");
const Place = require("../../../../models/places");
const { DOC_STATUS } = require("../../../../constants");
const { sendEmail } = require("../../../../services/email");
const {
  createStripeCustomer,
  getStripeCustomerId
} = require("../../../../services/stripe");
const { get, isEmpty, intersection } = require("lodash");
const { getSubscriptionRevenueModel } = require("../../../../services/revenue");
const brands = require("../../../../models/brands");
const { sendMessage } = require("../../../../services/plivo");
const JazzCash = require("../../../../services/jazzCash");
const EasyPaisa = require("../../../../services/easyPaisa");
const Shortly = require("../../../../models/shortly");
const Payments = require("../../../../models/payments");
const Reservations = require("../../../../models/reservations");
const Transaction = require("../../../../models/transaction");
const { generateSerialNumber } = require("../../../../global/functions");
const moment = require("moment");

const domain = process.env.FRONT_DOMAIN;

module.exports = async (req, res) => { 
  try {
    const { userId, body } = req;

    const { placeId, email, mobile, licensePlate, isCustomSubscription } = body;
    // console.log("body ====>", body);
    if (!userId || !ObjectId.isValid(userId)) throw new Error("Invalid Token");
    if (!placeId || !ObjectId.isValid(placeId))
      throw new Error("Invalid place Id");

    if (isCustomSubscription) {
      const licensePlateNumbers = licensePlate.map((plate) =>
        plate.licensePlateNumber.toUpperCase()
      );
      const existLicensePlate = await Subscriptions.find({
        status: 10,
        "licensePlate.licensePlateNumber": { $in: licensePlateNumbers },
      });

      if (!isEmpty(existLicensePlate)) {
        const existingLicensePlates = existLicensePlate.flatMap((entry) =>
          entry.licensePlate.map((plate) => plate.licensePlateNumber)
        );
        const matchedLicensePlates = intersection(
          existingLicensePlates,
          licensePlateNumbers
        );

        if (matchedLicensePlates.length > 0) {
          throw new Error(
            `The following license plates are already subscribed: ${matchedLicensePlates.join(
              ", "
            )}`
          );
        }
      }
    }

    const placeData = await Place.findOne(
      { _id: ObjectId(placeId) },
      {
        subscriptionSurcharge: 1,
        userId: 1,
        google: 1,
        applyTaxOnServiceFee: 1,
        plivoId: 1,
        paymentGatewayFeePayBy: 1,
        paymentGateway: 1,
        jazzCashSettings: 1,
        easyPaisaSettings: 1,
        stripeConfiguration: 1,
      }
    ).populate("plivoId");

    const brand = await brands.findOne({ userId: placeData.userId });console.log(placeData.userId)
    let startDate = moment(body?.startDate).utc();
    let endDate = moment(body?.endDate).utc();
    const handleCustomSubscription = async ({ brand, placeData }) => {
      if (!startDate || !endDate)
        throw new Error("Start or End Date is required!");
      if (!email && !mobile)
        throw new Error("Email or Mobile should be required!");

      const findQuery =
        email && email !== "" && mobile && mobile !== ""
          ? { email }
          : email && email !== ""
          ? { email }
          : { mobile };

      const insertObj = {
        ...findQuery,
        firstName: body.firstName,
        lastName: body.lastName,
        isEmailPrimary: email && email !== "" ? true : false,
        secondaryMobile: email && mobile ? mobile : "",
        status: DOC_STATUS.ACTIVE,
        brandId: brand?.brandId || brand?._id,
        companyName: body.companyName,
      };
      console.log("insertObj ====>", insertObj, brand);
      const customer = await Customer.findOneAndUpdateCustomer(
        findQuery,
        insertObj,
        {
          upsert: true,
          new: true,
        }
      );

      if (placeData.paymentGateway === "JAZZ_CASH") {
        const jazzCash = new JazzCash(placeData);
        // Jazz Cash doesn't require customer profile creation
      } else if (placeData.paymentGateway === "EASY_PAISA") {
        const easyPaisa = new EasyPaisa(placeData);
        // EasyPaisa doesn't require customer profile creation
      } else {
        if (!await getStripeCustomerId(customer, placeData)) {
          const stripeResponse = await createStripeCustomer({
            email: customer.email,
            phone: customer.mobile,
            name: `${customer.firstName} ${customer.lastName}`,
            metadata: {
              email: get(customer, "email", ""),
              phone: get(customer, "mobile", ""),
            },
            place: placeData,
          });

          const customerId = get(stripeResponse, "id", false);
          let stripeCustomerIds = customer.stripeCustomerIds || {};
          const stripeConfigurationName = get(placeData, "stripeConfiguration.name", "default");
          stripeCustomerIds[stripeConfigurationName] = { customerId };

          await Customer.findOneAndUpdateCustomer(
            { _id: customer._id },
            { $set: { stripeConfigurationName } }
          );
        }
      }

      const licensePlateArray = licensePlate.map((licensePlates) => ({
        licensePlateNumber: licensePlates.licensePlateNumber.toUpperCase(),
        assignName: licensePlates.assignName,
        price: licensePlates.price * 100,
        externalKey: `${generateExternalKey()}_${
          licensePlates.licensePlateNumber
        }`,
      }));

      const revenueModal = await getSubscriptionRevenueModel(
        {
          baseRate: get(body, "amount", 0),
          placeId,
          isApplyTax: get(body, "isApplyTax", false),
          isApplyServiceFee: get(body, "isApplyServiceFee", false),
          isApplyTaxOnServiceFee: get(placeData, "applyTaxOnServiceFee", false),
          licensePlateCount: licensePlateArray.length,
        },
        body.isDirectChargeSubscription
      );

      console.log("revenueModal ===>", revenueModal);

      // Subscription object creation
      let subscriptionObj = {
        customerId: customer._id,
        placeId: ObjectId(placeId),
        brandId: brand._id,
        brandLogo: brand.brandLogo,
        startDate,
        endDate,
        licensePlate: licensePlateArray,
        message: body.message,
        baseRate: get(revenueModal, "baseRate", 0),
        tax: get(revenueModal, "tax", 0),
        taxPercentage: get(placeData, "subscriptionSurcharge.stateTax", 0),
        cityTax: get(revenueModal, "cityTax", 0),
        cityTaxPercentage: get(placeData, "subscriptionSurcharge.cityTax", 0),
        countyTax: get(revenueModal, "countyTax", 0),
        countyTaxPercentage: get(
          placeData,
          "subscriptionSurcharge.countyTax",
          0
        ),
        isApplyTaxOnServiceFee: get(placeData, "applyTaxOnServiceFee", false),
        paymentGatewayFeePayBy: get(
          placeData,
          "paymentGatewayFeePayBy",
          "isbp"
        ),
        serviceFee: get(revenueModal, "serviceFee", 0),
        ownerPayout: get(revenueModal, "ownerPayout", 0),
        isbpRevenue: get(revenueModal, "isbpRevenue", 0),
        applicationFee: get(revenueModal, "applicationFee", 0),
        paymentGatewayFee: get(revenueModal, "paymentGatewayFee", 0),
        totalAmount: get(revenueModal, "totalAmount", 0),
        isAutoRenew: body.isAutoRenew,
        isApplyTax: body.isApplyTax,
        isMonthly: body.isMonthly,
        isApplyServiceFee: body.isApplyServiceFee,
        isCustomSubscription: body.isCustomSubscription,
        subscriptionDurationInDays: body.subscriptionDurationInDays,
        isDirectChargeSubscription: body.isDirectChargeSubscription,
      };

      if (body.isMonthly) {
        const monthlyRevenueModal = await getSubscriptionRevenueModel(
          {
            baseRate: get(body, "netPayableAmount", 0),
            placeId,
            isApplyTax: get(body, "isApplyTax", false),
            isApplyServiceFee: get(body, "isApplyServiceFee", false),
            isApplyTaxOnServiceFee: get(
              placeData,
              "applyTaxOnServiceFee",
              false
            ),
          },
          body.isDirectChargeSubscription
        );

        console.log("monthlyRevenueModal ===>", monthlyRevenueModal);

        subscriptionObj.firstMonthBaseRate = monthlyRevenueModal.baseRate || 0;
        subscriptionObj.firstMonthServiceFee =
          monthlyRevenueModal.serviceFee || 0;
        subscriptionObj.firstMonthTax = monthlyRevenueModal.tax || 0;
        subscriptionObj.firstMonthCityTax = monthlyRevenueModal.cityTax || 0;
        subscriptionObj.firstMonthCountyTax =
          monthlyRevenueModal.countyTax || 0;
        subscriptionObj.firstMonthTotalAmount =
          monthlyRevenueModal.totalAmount || 0;
        subscriptionObj.firstMonthOwnerPayout =
          monthlyRevenueModal.ownerPayout || 0;
        subscriptionObj.firstMonthIsbpRevenue =
          monthlyRevenueModal.isbpRevenue || 0;
        subscriptionObj.firstMonthApplicationFee =
          monthlyRevenueModal.applicationFee || 0;
        subscriptionObj.firstMonthPaymentGatewayFee =
          monthlyRevenueModal.paymentGatewayFee || 0;
      }

      console.log("subscriptionObj ===>", subscriptionObj);

      let subscription;
      try {
        subscription = await Subscriptions.create(subscriptionObj);
        console.log("Created subscription:", subscription);
        console.log("Subscription _id:", subscription?._id);
      } catch (error) {
        console.error("Error creating subscription:", error);
        return res.status(http400).json({
          success: false,
          message: `Error creating subscription: ${error.message}`,
        });
      }
      
      if (!subscription || !subscription._id) {
        console.error("Subscription creation failed - no subscription or _id");
        return res.status(http400).json({
          success: false,
          message: "Subscription creation failed",
        });
      }
      console.log("Subscription licensePlate:", subscription.licensePlate);
      const licensePlates = licensePlateArrayToString(
        subscription.licensePlate
      );
      console.log("License plates string:", licensePlates);
      const duration = getSubscriptionDuration({
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        timezone: placeData?.timeZoneId || "",
      });
      console.log("duration ===>", duration);
      const dates = getDatesFromDuration({ duration });
      console.log("dates ===>", dates);

      let paymentURL = "";
      
      console.log("About to check cash payment. Subscription:", subscription);
      console.log("Body paymentMethodType:", body.paymentMethodType);
      console.log("Condition check:", subscription && body.paymentMethodType === "cash");
      
      // Handle cash payment - make subscription active immediately
      if (subscription && body.paymentMethodType === "cash") {
        try {
          console.log("Processing cash payment for subscription:", subscription._id);
          console.log("Customer:", customer);
          console.log("Brand:", brand);
          console.log("PlaceData:", placeData);
          console.log("Subscription:", subscription);
          console.log("Req.user:", req.user);
          console.log("Body:", body);
          
          // Validate required objects
          if (!customer) {
            console.error("Customer is null");
            return res.status(http400).json({
              success: false,
              message: "Customer data not found",
            });
          }
          
          if (!brand) {
            console.error("Brand is null");
            return res.status(http400).json({
              success: false,
              message: "Brand data not found",
            });
          }
          
          if (!placeData) {
            console.error("PlaceData is null");
            return res.status(http400).json({
              success: false,
              message: "Place data not found",
            });
          }
          
          // Generate receipt and subscription numbers
          const receiptNumber = await generateSerialNumber({ type: "receipt" });
          const subscriptionNumber = await generateSerialNumber({ type: "subscription" });
          
          // Generate transaction ID for cash payment
          const transactionId = `cash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          // Create transaction record
          const transactionObject = {
            transactionId: transactionId,
            locationId: subscription.placeId,
            status: "success",
            userId: req.user ? req.user._id : null, // Vendor/admin who processed the cash payment
            paymentGateway: "cash",
            lotCode: get(placeData, "lotCode", ""),
            transactionDate: new Date(),
          };

          const transaction = await Transaction.create(transactionObject);
          
          // Create payment record
          const paymentObject = {
            customerId: subscription.customerId,
            placeId: subscription.placeId,
            brandId: subscription.brandId,
            subscriptionId: subscription._id,
            paymentMethodType: "cash",
            amount: subscription.totalAmount,
            baseRate: subscription.baseRate,
            tax: subscription.tax,
            serviceFee: subscription.serviceFee,
            ownerPayout: subscription.ownerPayout,
            isbpRevenue: subscription.isbpRevenue,
            applicationFee: subscription.applicationFee,
            paymentGatewayFee: subscription.paymentGatewayFee,
            currency: "USD",
            paymentStatus: "success", // Use paymentStatus for payment status
            status: 10, // Use status for document status (number)
            receiptNumber: receiptNumber,
            paymentDate: new Date(),
            transactionId: transactionId,
            metadata: {
              cashPaymentCollectedBy: req.user ? `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim() : "Admin",
              paymentMethod: "cash"
            }
          };
          
          const payment = await Payments.create(paymentObject);
          
          // Create reservation object (similar to processedFreeRate logic)
          const reservationObject = {
            customerId: subscription.customerId,
            placeId: subscription.placeId,
            brandId: subscription.brandId,
            subscriptionId: subscription._id,
            paymentId: payment._id,
            startDate: subscription.startDate,
            endDate: subscription.endDate,
            totalAmount: subscription.totalAmount,
            baseRate: subscription.baseRate,
            tax: subscription.tax,
            serviceFee: subscription.serviceFee,
            ownerPayout: subscription.ownerPayout,
            isbpRevenue: subscription.isbpRevenue,
            applicationFee: subscription.applicationFee,
            paymentGatewayFee: subscription.paymentGatewayFee,
            paymentMethodType: "cash",
            status: "success", // Use "success" like in processedFreeRate
            receiptNumber: receiptNumber,
            transactionId: transactionId,
            transactionDate: new Date()
          };
          
          await Reservations.create(reservationObject);
          
          // Update subscription to active (similar to processedFreeRate logic)
          await Subscriptions.findByIdAndUpdate(subscription._id, {
            $set: {
              subscriptionStatus: "active", // Use "active" for successful subscriptions
              isSubscriptionActive: true,
              isCharged: true, // Mark as charged for cash payments
              paymentId: payment._id,
              receiptNumber: receiptNumber,
              subscriptionNumber: subscriptionNumber,
              isCashPayment: true,
              cashPaymentCollectedBy: req.user ? `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim() : "Admin",
              cashPaymentCollectedAt: new Date(),
              cashPaymentReceiptNumber: receiptNumber,
              paymentMethodType: "cash"
            }
          });
          
          // Send confirmation email and SMS
          try {
            console.log("Customer email:", customer.email);
            console.log("Customer firstName:", customer.firstName);
            
            await sendEmail({
              to: customer.email,
              subject: "Cash Payment Confirmation - Subscription Activated",
              templateId: "d-f5345bae0b4c40b997617aa33889eaad", // PAYMENT_CONFIRMATION_TEMPLATE
            })({
              customerName: capitalizeFirstLetter(customer.firstName || "Customer"),
              subscriptionNumber: subscriptionNumber,
              receiptNumber: receiptNumber,
              totalAmount: amountToShow(subscription.totalAmount),
              startDate: moment(subscription.startDate).format("MMM DD, YYYY"),
              endDate: moment(subscription.endDate).format("MMM DD, YYYY"),
              brandName: brand.brandName,
              placeName: placeData.google?.formatted_address || placeData.address?.formatted_address || "Unknown Address",
              paymentMethod: "Cash",
              collectedBy: req.user ? `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim() : "Admin"
            });
            
            // Send SMS
            const mobileNumber = get(customer, "mobile", false);
            if (mobileNumber) {
              const plivoNumber = get(placeData, "plivoNumber", false);
              await sendMessage({
                from: plivoNumber,
                to: mobileNumber,
                body: `Your subscription has been activated! Receipt #${receiptNumber}. Amount: ₨${amountToShow(subscription.totalAmount)}. Thank you for your cash payment.`
              });
            }
          } catch (error) {
            console.error("Error sending notifications:", error);
          }
          
          return res.status(http200).json({
            success: true,
            message: "Subscription created and activated with cash payment",
            data: {
              subscriptionId: subscription._id,
              receiptNumber: receiptNumber,
              subscriptionNumber: subscriptionNumber,
              totalAmount: subscription.totalAmount,
              status: "active"
            }
          });
        } catch (error) {
          console.error("Error processing cash payment:", error);
          return res.status(http400).json({
            success: false,
            message: `Error processing cash payment: ${error.message}`,
          });
        }
      }
      
      // Handle regular payment methods (card, ACH, etc.)
      if (subscription) {
        const expireDateUTC = moment()
          .add(7, "days")
          .utc()
          .format("YYYY-MM-DDTHH:mm:ss[Z]");
        let shortlyObj = {
          purpose: "SUBSCRIPTION",
          subscriptionId: subscription._id,
          shortlyId: generateShortlyId(),
          expireOn: expireDateUTC,
          tax: get(revenueModal, "tax", 0),
          cityTax: get(revenueModal, "cityTax", 0),
          countyTax: get(revenueModal, "countyTax", 0),
        };
        const shortlyExist = await Shortly.findOne(shortlyObj);

        if (shortlyExist) shortlyObj.shortlyId = generateShortlyId();

        const createShortly = await Shortly.create(shortlyObj);
        await Subscriptions.findByIdAndUpdate(createShortly.subscriptionId, {
          $set: {
            shortlyId: createShortly.shortlyId,
            subscriptionStatus: "pending",
          },
        });

        if (placeData.paymentGateway === "JAZZ_CASH")
          paymentURL = `${domain}payment/jazzcash?shortlyId=${createShortly.shortlyId}`;
        else if (placeData.paymentGateway === "EASY_PAISA")
          paymentURL = `${domain}payment/easypaisa?shortlyId=${createShortly.shortlyId}`;
        else
          paymentURL = `${domain}payment?shortlyId=${createShortly.shortlyId}`;

        console.log("paymentURL ===>", paymentURL);
        // Sending email

        await sendEmail({
          to: customer.email,
          subject: "Subscription details & payment link",
        })()({
          startDate: dates.startDate,
          endDate: dates.endDate,
          brandName: brand.brandName,
          brandLogo: brand.brandLogo,
          placeAddress: placeData.google?.formatted_address || placeData.address?.formatted_address || "Unknown Address",
          parkerName: capitalizeFirstLetter(
            `${body?.firstName + " " + body?.lastName}`
          ),
          licensePlates: licensePlates,
          amount: `${amountToShow(
            subscription.isMonthly
              ? subscription.firstMonthTotalAmount
              : subscription.totalAmount
          )}`,
          autoRenewal: subscription.isAutoRenew ? "Yes" : "No",
          paymentLink: paymentURL,
          message: subscription.message,
        });

        // Sending SMS
        const mobileNumber = get(customer, "mobile", false);
        if (mobileNumber) {
          const plivoNumber = get(placeData, "plivoNumber", false);
          console.log("plivoNumber ----->", plivoNumber);
          const props = {
            from: plivoNumber,
            to: mobileNumber,
            body: `Please click on this payment url to pay your subscription fee ${paymentURL}`,
          };
          await sendMessage(props);
        }
      }
    };

    // const handleBulkSubscription = async (tax, serviceFee, brand) => {
    //   if (Array.isArray(records) && records.length > 0) {
    //     for (const record of records) {
    //       const {
    //         email,
    //         mobile,
    //         firstName,
    //         lastName,
    //         amount,
    //         isApplyTax,
    //         isApplyServiceFee,
    //         licensePlate,
    //         startDate,
    //         endDate,
    //         message,
    //         isAutoRenew,
    //       } = record;
    //       const findQuery =
    //         email && email !== "" && mobile && mobile !== ""
    //           ? { email }
    //           : email && email !== ""
    //           ? { email }
    //           : { mobile };

    //       const insertObj = {
    //         ...findQuery,
    //         firstName,
    //         lastName,
    //         mobile,
    //         isEmailPrimary: email && email !== "",
    //         status: DOC_STATUS.ACTIVE,
    //         brandId: brand._id,
    //       };

    //       const customer = await Customer.findOneAndUpdate(
    //         findQuery,
    //         insertObj,
    //         { upsert: true, new: true }
    //       );

    //       const amountValue = parseInt(amount) || 0;
    //       let totalAmount = amountValue;
    //       if (isApplyTax) totalAmount += (amount * tax) / 100;
    //       if (isApplyServiceFee) totalAmount += serviceFee;

    //       const licensePlateArray = licensePlate.map((licensePlateNumber) => ({
    //         licensePlateNumber,
    //       }));
    //       const subscriptionObj = {
    //         customerId: customer._id,
    //         placeId: ObjectId(placeId),
    //         startDate: moment(startDate)
    //           .utc()
    //           .startOf("day")
    //           .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
    //         endDate: moment(endDate)
    //           .utc()
    //           .endOf("day")
    //           .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
    //         brandLogo: brand.brandLogo,
    //         brandId: brand._id,
    //         licensePlate: licensePlateArray,
    //         message: message,
    //         amount: dollarsToCents(amount),
    //         totalAmount: dollarsToCents(totalAmount),
    //         isAutoRenew,
    //         isApplyTax,
    //         isApplyServiceFee,
    //         isCustomSubscription: false,
    //       };

    //       const createSubscription = await Subscriptions.create(
    //         subscriptionObj
    //       );
    //       let paymentURL = "";
    //       if (createSubscription) {
    //         const expireDateUTC = moment()
    //           .add(7, "days")
    //           .utc()
    //           .format("YYYY-MM-DDTHH:mm:ss[Z]");
    //         let shortlyObj = {
    //           purpose: "SUBSCRIPTION",
    //           subscriptionId: createSubscription._id,
    //           shortlyId: generateShortlyId(),
    //           expireOn: expireDateUTC,
    //         };
    //         const shortlyExist = await Shortly.findOne(shortlyObj);
    //         if (shortlyExist) {
    //           shortlyObj.shortlyId = generateShortlyId();
    //         }
    //         const createShortly = await Shortly.create(shortlyObj);
    //         await Subscriptions.findByIdAndUpdate(
    //           createShortly.subscriptionId,
    //           {
    //             $set: {
    //               shortlyId: createShortly.shortlyId,
    //               subscriptionStatus: "pending",
    //             },
    //           }
    //         );
    //         paymentURL = `${domain}payment?shortlyId=${createShortly.shortlyId}`;

    //         await sendEmail({
    //           to: email,
    //         })()({
    //           username: capitalizeFirstLetter(`${firstName + " " + lastName}`),
    //           dashboard_url: "https://isbparking.bot",
    //           email: email ?? "",
    //           password: paymentURL ?? "",
    //         });
    //       }
    //     }
    //   }
    // };

    if (isCustomSubscription)
      await handleCustomSubscription({ brand, placeData });
    else if (isCustomSubscription === false)
      return res
        .status(http400)
        .json({ success: false, message: "Working on it!" });
    // await handleBulkSubscription(tax, serviceFee, brand);

    return res
      .status(http200)
      .json({ success: true, message: "Subscription create successfully" });
  } catch (error) {
    return res.status(http400).json({
      success: false,
      message: error?.message ?? "Something went wrong!",
    });
  }
};
