// Credentials for jwt Secret and Database
module.exports = {
  MONGO_URI: process.env.DATABASE_INFO,
  jwtSecret: process.env.JWT_SECRET,

  // Pakistani Configuration
  CURRENCY: {
    CODE: "PKR",
    SYMBOL: "₨",
    NAME: "Pakistani Rupee",
    DECIMAL_PLACES: 2,
    EXCHANGE_RATE: 1, // 1 USD = 1 PKR (for now, can be updated with real rate)
  },

  // Pakistani Tax Configuration
  TAX_CONFIG: {
    GST_RATE: 17, // General Sales Tax rate in Pakistan
    FEDERAL_EXCISE_DUTY: 0, // Federal Excise Duty
    PROVINCIAL_TAX: 0, // Provincial tax (varies by province)
    WITHHOLDING_TAX: 0, // Withholding tax
  },

  // Pakistani Default Configuration
  PAKISTAN_CONFIG: {
    DEFAULT_TIMEZONE: "Asia/Karachi",
    DEFAULT_COUNTRY_CODE: "+92",
    DEFAULT_CURRENCY: "PKR",
    DEFAULT_LANGUAGE: "en-PK"
  },

  PAYMENT_GATEWAY: {
    STRIPE: "STRIPE",
    JAZZ_CASH: "JAZZ_CASH",
    EASY_PAISA: "EASY_PAISA",
    CASH: "CASH",
  },
  LEVEL: {
    SUPER_ADMIN: 100,
    BRAND_OWNER: 90,
  },
  EMAIL: {
    WELCOME_TEMPLATE_BRAND: "d-e978e649f15243a5a0927830a0e2d7b8",
    WELCOME_TEMPLATE_BRAND_USER: "d-e978e649f15243a5a0927830a0e2d7b8",
    WELCOME_TEMPLATE: "d-d2f36dd25b054e0b912d341cb4188a38",
    SUBSCRIPTION_WELCOME_TEMPLATE: "d-88ac9c906b5d41de84e127076174bfc4",
    CUSTOMER_OTP_VERIFY_TEMPLATE: "d-e6c6f246d45a436bab64357c9546c1db",
    RENEWAL_REMINDER_TEMPLATE: "d-1257cd8f27db44028b08d3054c91a26c",
    PAYMENT_CONFIRMATION_TEMPLATE: "d-f5345bae0b4c40b997617aa33889eaad",
    SUBSCRIPTION_PAYMENT_LINK_TEMPLATE: "d-b3eec47987fb460db6dbf7aa6e28456a",
    AUTOMATED_CODE_TEMPLATE: "d-ec2489e76545424bae1edaed7516e199",
    CANCEL_SUBSCRIPTION_TEMPLATE: "d-0a7f4867d5bd455a9f8b00c9aa6bb57a",
    DAILY_RESERVATION_REPORT_TEMPLATE: "d-3d131a7246d6454c8c57c9a46e6b9b8a",
    WEEKLY_RESERVATION_REPORT_TEMPLATE: "d-532c7b51c2e24ad395f40299bf824311",
    MONTHLY_RESERVATION_REPORT_TEMPLATE: "d-54956b2527ce4b4ba03dfbc330f00a9b",
    RESERVATION_CONFIRMATION_TEMPLATE: "d-a3c973d6f4dc45b694ab29716971c5cc",
    PERMIT_APPROVAL_TEMPLATE: "d-204d446327d8494e855b93f3a61d32b5",
    PERMIT_REQUEST_TEMPLATE: "d-43b825fef2de42a8a1b3373f2b88da0f",
  },
  FROM_EMAIL: {
    SPOTSYNC_EMAIL: "no-reply@spotsync.com",
  },
  SERIAL_NUMBER: {
    INVOICE: "invoice",
    PAYMENTRECEIPT: "receipt",
    SUBSCRIPTION: "subscription",
  },
};
