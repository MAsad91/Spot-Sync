const { http200, http400, http403 } = require("../../../../global/errors/httpCodes");
const { Types: { ObjectId }, isValidObjectId } = require("mongoose");
const { get } = require("lodash");
const moment = require("moment");

// Models
const Customer = require("../../../../models/customers");
const Places = require("../../../../models/places");
const Brands = require("../../../../models/brands");
const Rates = require("../../../../models/rates");
const Shortly = require("../../../../models/shortly");
// Session model removed - no longer needed for chatbot functionality
const Payments = require("../../../../models/payments");
const Reservations = require("../../../../models/reservations");
const ReceiptCollection = require("../../../../models/receipts");
const Transaction = require("../../../../models/transaction");

// Services
const { sendEmail } = require("../../../../services/email");
const { sendMessage } = require("../../../../services/plivo");
const { getRateDuration } = require("../../../../services/rateDuration");
const { getParkingRevenueModel } = require("../../../../services/revenue");

// Functions
const { 
  generateSerialNumber, 
  generateShortlyId,
  capitalizeFirstLetter,
  amountToShow 
} = require("../../../../global/functions");

module.exports = async (req, res) => {
  let success = false;
  try {
    const { userId, body } = req;
    
    if (!userId || !isValidObjectId(userId)) {
      return res.status(http403).json({ success, message: "Invalid Token" });
    }

    const {
      firstName,
      lastName,
      email,
      mobile,
      licensePlate,
      rateId,
      placeId,
      hours,
      startDate,
      endDate,
      paymentMethodType,
      message
    } = body;

             // Validate required fields
         if (!firstName || !lastName || !email || !licensePlate || !rateId || !placeId) {
           return res.status(http400).json({
             success,
             message: "Missing required fields: firstName, lastName, email, licensePlate, rateId, placeId"
           });
         }

    // Validate ObjectIds
    if (!isValidObjectId(rateId) || !isValidObjectId(placeId)) {
      return res.status(http400).json({
        success,
        message: "Invalid rateId or placeId"
      });
    }

    // Get place data
    const placeData = await Places.findOne({ 
      _id: new ObjectId(placeId),
      userId: new ObjectId(userId)
    }).populate("plivoId");

    if (!placeData) {
      return res.status(http400).json({
        success,
        message: "Place not found or you don't have permission to access it"
      });
    }

    // Get brand data
    const brand = await Brands.findOne({ userId: placeData.userId });
    if (!brand) {
      return res.status(http400).json({
        success,
        message: "Brand not found"
      });
    }

    // Get rate data
    const rate = await Rates.findOne({ 
      _id: new ObjectId(rateId),
      placeId: new ObjectId(placeId)
    });

    if (!rate) {
      return res.status(http400).json({
        success,
        message: "Rate not found"
      });
    }

    // Validate rate-specific requirements
    if (rate.rateType === "hourly" && (!hours || hours < 1)) {
      return res.status(http400).json({
        success,
        message: "Hours is required and must be at least 1 for hourly rates"
      });
    }

    // Validate special rate types
    if (rate.isPermit) {
      return res.status(http400).json({
        success,
        message: "Permit rates are not supported for dashboard reservations"
      });
    }

    if (rate.isRateOption) {
      return res.status(http400).json({
        success,
        message: "Rate options are not supported for dashboard reservations"
      });
    }

    // Create or find customer
    const findQuery = {
      email: email.toLowerCase(),
      brandId: brand._id
    };

    const insertObj = {
      firstName: capitalizeFirstLetter(firstName),
      lastName: capitalizeFirstLetter(lastName),
      email: email.toLowerCase(),
      mobile: mobile || "",
      secondaryMobile: mobile || "",
      status: 10,
      brandId: brand._id,
      companyName: body.companyName || ""
    };

    const customer = await Customer.findOneAndUpdate(
      findQuery,
      insertObj,
      { upsert: true, new: true }
    );

             // Calculate rate duration based on rate type
         let rateDuration;
         let actualHours = hours || 1;
         
         // Handle different rate types
         if (rate.rateType === "hourly") {
           // For hourly rates, use the hours input directly
           rateDuration = await getRateDuration({
             rate: rate,
             tz: placeData.timeZoneId,
             hours: actualHours,
             parentReservationId: "",
             isExtension: false
           });
         } else if (rate.rateType === "daily") {
           // For daily rates, use the rate's own hours
           actualHours = rate.hours || 24;
           rateDuration = await getRateDuration({
             rate: rate,
             tz: placeData.timeZoneId,
             hours: actualHours,
             parentReservationId: "",
             isExtension: false
           });
         } else if (rate.rateType === "custom") {
           // For custom rates, use custom start/end dates if provided
           rateDuration = await getRateDuration({
             rate: rate,
             tz: placeData.timeZoneId,
             hours: actualHours,
             parentReservationId: "",
             isExtension: false,
             customStartDate: startDate,
             customEndDate: endDate
           });
         } else {
           // For other rate types (all_day, overnight, etc.), use the rate's own duration
           rateDuration = await getRateDuration({
             rate: rate,
             tz: placeData.timeZoneId,
             hours: rate.hours || actualHours,
             parentReservationId: "",
             isExtension: false
           });
         }

             // Calculate revenue based on rate type
         const revenueModal = await getParkingRevenueModel({
           isFreeRate: rate.isFreeRate || false,
           baseRate: rate.amount * 100, // Convert to cents
           placeId: placeData._id,
           isApplyServiceFee: true,
           rateType: rate.rateType,
           hours: actualHours,
           isSecondStepValidation: rate.secondStepValidation || false,
           isPass: rate.isPass || false,
           noOfPasses: 1
         });

             // Create session for the reservation
         const sessionData = {
           sessionId: generateShortlyId(),
           title: "Dashboard Reservation",
           subTitle: "Created from Dashboard",
           placeId: placeData._id,
           placeTimeZoneId: placeData.timeZoneId,
           botType: "DASHBOARD",
           amount: revenueModal.baseRate,
           hours: actualHours,
           totalAmount: revenueModal.totalAmount,
           ownerPayout: revenueModal.ownerPayout,
           isbpRevenue: revenueModal.isbpRevenue,
           applicationFee: revenueModal.applicationFee,
           paymentGatewayFee: revenueModal.paymentGatewayFee,
           baseRate: revenueModal.baseRate,
           tax: revenueModal.tax,
           cityTax: revenueModal.cityTax,
           countyTax: revenueModal.countyTax,
           serviceFee: revenueModal.serviceFee,
           phoneNumber: mobile,
           licensePlate: licensePlate,
           status: 10,
           paymentStatus: "pending"
         };

             // Create shortly object for payment link
         const shortlyObj = {
           purpose: "PARKING",
           sessionId: null, // Session model removed - no longer needed
           shortlyId: generateShortlyId(),
           customerId: customer._id,
           placeId: placeData._id,
           brandId: brand._id,
           rateId: rate._id,
           licensePlate: licensePlate,
           phoneNumber: mobile,
           email: email,
           hours: actualHours,
           baseRate: revenueModal.baseRate,
           tax: revenueModal.tax,
           cityTax: revenueModal.cityTax,
           countyTax: revenueModal.countyTax,
           serviceFee: revenueModal.serviceFee,
           ownerPayout: revenueModal.ownerPayout,
           isbpRevenue: revenueModal.isbpRevenue,
           applicationFee: revenueModal.applicationFee,
           paymentGatewayFee: revenueModal.paymentGatewayFee,
           totalAmount: revenueModal.totalAmount,
           startDate: rateDuration.utcStartDate,
           endDate: rateDuration.utcEndDate,
           isParking: true,
           paymentStatus: "pending",
           expireOn: moment().add(7, "days").utc().format("YYYY-MM-DDTHH:mm:ss[Z]"),
           message: message || ""
         };

             // Handle special rate types
         const isFreeRate = rate.isFreeRate || false;
         const isPermit = rate.isPermit || false;
         const isPass = rate.isPass || false;
         const isRateOption = rate.isRateOption || false;

         // Handle free rates and cash payments
         if (isFreeRate || paymentMethodType === "cash") {
      try {
        // Generate receipt number
        const receiptNumber = await generateSerialNumber({ type: "receipt" });
        const transientNumber = await generateSerialNumber({ type: "transient" });
        
        // Generate transaction ID for cash/free payments
        const transactionId = `${isFreeRate ? 'free' : 'cash'}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create transaction record
        const transactionObject = {
          transactionId: transactionId,
          locationId: placeData._id,
          status: "success",
          userId: req.user ? req.user._id : null, // Vendor/admin who processed the payment
          paymentGateway: isFreeRate ? "free" : "cash",
          lotCode: get(placeData, "lotCode", ""),
          transactionDate: new Date(),
        };

        const transaction = await Transaction.create(transactionObject);

                     // Create payment record
             const paymentObject = {
               customerId: customer._id,
               placeId: placeData._id,
               brandId: brand._id,
               paymentMethodType: isFreeRate ? "free" : "cash",
               amount: revenueModal.totalAmount,
               baseRate: revenueModal.baseRate,
               tax: revenueModal.tax,
               serviceFee: revenueModal.serviceFee,
               ownerPayout: revenueModal.ownerPayout,
               isbpRevenue: revenueModal.isbpRevenue,
               applicationFee: revenueModal.applicationFee,
               paymentGatewayFee: revenueModal.paymentGatewayFee,
               currency: "USD",
               paymentStatus: "success",
               status: 10,
               receiptNumber: receiptNumber,
               paymentDate: new Date(),
               transactionId: transactionId,
               metadata: {
                 cashPaymentCollectedBy: req.user ? `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim() : "Admin",
                 paymentMethod: isFreeRate ? "free" : "cash"
               }
             };

        const payment = await Payments.create(paymentObject);

        // Create receipt data
        const receiptData = {
          parkerMobile: mobile,
          brandLogo: get(brand, "brandLogo", ""),
          receiptColor: get(brand, "receiptColor", "#00ab6b"),
          startDate: moment(rateDuration.utcStartDate)
            .tz(placeData.timeZoneId)
            .format("MM/DD/YYYY hh:mm A"),
          endDate: moment(rateDuration.utcEndDate)
            .tz(placeData.timeZoneId)
            .format("MM/DD/YYYY hh:mm A"),
          tax: revenueModal.tax / 100,
          cityTax: revenueModal.cityTax / 100,
          countyTax: revenueModal.countyTax / 100,
          serviceFee: revenueModal.serviceFee / 100,
          paymentGatewayFee: revenueModal.paymentGatewayFee / 100,
          total: revenueModal.totalAmount / 100,
          baseRate: revenueModal.baseRate / 100,
          brandName: `${get(brand, "brandName", "")}`,
          brandAddress: `${get(brand, "brandAddress", "")}`,
          brandMobile: `${get(brand, "ownerMobileNumber", "")}`,
          companyName: `${get(customer, "companyName", "")}`,
          placeAddress: get(placeData, "google.formatted_address", ""),
          parkerName: `${get(customer, "firstName", "")} ${get(customer, "lastName", "")}`,
          parkerEmail: get(customer, "email", ""),
          discount: 0,
          licensePlates: [{ licensePlateNumber: licensePlate, price: revenueModal.baseRate }],
          updatedServiceFee: revenueModal.serviceFee / 100,
          serialNumber: receiptNumber,
          transientNumber: transientNumber,
          type: "receipt",
          transactionId: `cash_${Date.now()}`,
          paymentData: moment()
            .tz(placeData.timeZoneId)
            .format("MM/DD/YYYY hh:mm A"),
          isPass: false,
          noOfPasses: 1,
          lastName: lastName,
          email: email
        };

        // Create receipt record
        const receiptURL = `${process.env.FRONT_DOMAIN}receipt?id=${receiptData.serialNumber}`;
        await ReceiptCollection.create(receiptData);
        console.log("receiptURL ---->", receiptURL);

                     // Create reservation object
             const reservationObject = {
               customerId: customer._id,
               placeId: placeData._id,
               brandId: brand._id,
               rateId: rate._id,
               paymentId: payment._id,
               startDate: rateDuration.utcStartDate,
               endDate: rateDuration.utcEndDate,
               totalAmount: revenueModal.totalAmount,
               baseRate: revenueModal.baseRate,
               tax: revenueModal.tax,
               cityTax: revenueModal.cityTax,
               countyTax: revenueModal.countyTax,
               serviceFee: revenueModal.serviceFee,
               ownerPayout: revenueModal.ownerPayout,
               isbpRevenue: revenueModal.isbpRevenue,
               applicationFee: revenueModal.applicationFee,
               paymentGatewayFee: revenueModal.paymentGatewayFee,
               paymentMethodType: isFreeRate ? "free" : "cash",
               paymentStatus: "success",
               status: "success",
               receiptNumber: receiptNumber,
               receiptURL: `${process.env.FRONT_DOMAIN}receipt?id=${receiptNumber}`,
               transientNumber: transientNumber,
               licensePlate: [licensePlate],
               purpose: "PARKING",
               externalKey: `${generateShortlyId()}_${licensePlate}`,
               ballparkValidateDate: new Date(),
               hours: actualHours,
               noOfPasses: 1,
               isValidationApplied: false,
               isPaymentOnHold: false,
               discountPercentage: 0,
               transactionId: transactionId,
               transactionDate: new Date(),
               ridersLastName: lastName
             };

        const reservation = await Reservations.create(reservationObject);

        // Create shortly with success status
        const cashShortlyObj = {
          ...shortlyObj,
          paymentStatus: "success",
          receiptNumber: receiptNumber,
          paymentId: payment._id,
          reservationId: reservation._id,
          transientNumber: transientNumber,
                         paymentMethodType: isFreeRate ? "free" : "cash"
        };

        const shortly = await Shortly.create(cashShortlyObj);



        // Send confirmation email and SMS
        try {
                           await sendEmail({
                   to: customer.email,
                   subject: isFreeRate 
                     ? "Free Reservation Confirmation" 
                     : "Cash Payment Confirmation - Reservation Created",
                   templateId: "d-f5345bae0b4c40b997617aa33889eaad", // PAYMENT_CONFIRMATION_TEMPLATE
                 })({
                   customerName: capitalizeFirstLetter(customer.firstName || "Customer"),
                   reservationNumber: transientNumber,
                   receiptNumber: receiptNumber,
                   totalAmount: amountToShow(revenueModal.totalAmount),
                   startDate: moment(rateDuration.utcStartDate).format("MMM DD, YYYY hh:mm A"),
                   endDate: moment(rateDuration.utcEndDate).format("MMM DD, YYYY hh:mm A"),
                   brandName: brand.brandName,
                   placeName: placeData.google?.formatted_address || placeData.address?.formatted_address || "Unknown Address",
                   paymentMethod: isFreeRate ? "Free" : "Cash",
                   collectedBy: req.user ? `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim() : "Admin"
                 });

                           // Send SMS
                 if (mobile) {
                   const plivoNumber = get(placeData, "plivoNumber", false);
                   const smsBody = isFreeRate 
                     ? `Your free reservation has been created! Receipt #${receiptNumber}. No payment required.`
                     : `Your reservation has been created! Receipt #${receiptNumber}. Amount: ₨${amountToShow(revenueModal.totalAmount)}. Thank you for your cash payment.`;
                   
                   await sendMessage({
                     from: plivoNumber,
                     to: mobile,
                     body: smsBody
                   });
                 }
        } catch (error) {
          console.error("Error sending notifications:", error);
        }

                     return res.status(http200).json({
               success: true,
               message: isFreeRate 
                 ? "Free reservation created successfully" 
                 : "Reservation created and activated with cash payment",
               data: {
                 reservationId: reservation._id,
                 receiptNumber: receiptNumber,
                 transientNumber: transientNumber,
                 totalAmount: revenueModal.totalAmount,
                 status: "success"
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

    // Handle regular payment methods (generate payment link)
    const shortly = await Shortly.create(shortlyObj);

    // Generate payment URL
    let paymentURL = "";
    if (placeData.paymentGateway === "JAZZ_CASH") {
      paymentURL = `${process.env.FRONT_DOMAIN}parking/payment/jazzcash?sId=${shortly.shortlyId}`;
    } else if (placeData.paymentGateway === "EASY_PAISA") {
      paymentURL = `${process.env.FRONT_DOMAIN}parking/payment/easypaisa?sId=${shortly.shortlyId}`;
    } else {
      paymentURL = `${process.env.FRONT_DOMAIN}parking/payment?sId=${shortly.shortlyId}`;
    }

    // Send payment link email and SMS
    try {
      await sendEmail({
        to: customer.email,
        subject: "Reservation details & payment link",
      })({
        startDate: moment(rateDuration.utcStartDate).format("MMM DD, YYYY hh:mm A"),
        endDate: moment(rateDuration.utcEndDate).format("MMM DD, YYYY hh:mm A"),
        brandName: brand.brandName,
        brandLogo: brand.brandLogo,
        placeAddress: placeData.google?.formatted_address || placeData.address?.formatted_address || "Unknown Address",
        parkerName: capitalizeFirstLetter(`${firstName} ${lastName}`),
        licensePlates: licensePlate,
        amount: `${amountToShow(revenueModal.totalAmount)}`,
        paymentLink: paymentURL,
        message: message || ""
      });

      // Send SMS
      if (mobile) {
        const plivoNumber = get(placeData, "plivoNumber", false);
        await sendMessage({
          from: plivoNumber,
          to: mobile,
          body: `Please click on this payment url to pay your reservation fee ${paymentURL}`
        });
      }
    } catch (error) {
      console.error("Error sending notifications:", error);
    }

    return res.status(http200).json({
      success: true,
      message: "Reservation created successfully. Payment link sent to customer.",
      data: {
        shortlyId: shortly.shortlyId,
        paymentURL: paymentURL,
        totalAmount: revenueModal.totalAmount,
        status: "pending"
      }
    });

  } catch (error) {
    console.error("Error creating reservation:", error);
    return res.status(http400).json({
      success: false,
      message: error?.message || "Something went wrong!",
    });
  }
}; 