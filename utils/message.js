module.exports = {
  MODULE_LIST: (module) => {
    return module + " list";
  },

  MODULE: (module) => {
    return module;
  },
  MODULE_CREATED: (module) => {
    return module + " created successfully";
  },
  MODULE_UPDATED: (module) => {
    return module + " updated successfully";
  },
  MODULE_DELETED: (module) => {
    return module + " deleted successfully";
  },
  MODULE_LIST: (module) => {
    return module + "s list";
  },
  MODULE_NOT_FOUND: (module) => {
    return module + " not found";
  },

  VALIDATION_ERROR: "validation error",
  SERVER_ERROR: "server error",
  GENERATION_ERROR: "something went wrong",
  UNAUTHORIZED: "unauthorized",

  // General
  LINK_SENT_SUCCESSFULLY: "Link sent successfully",
  ME: "Me",
  MFA: "Multi Factor Authentication",
  MFAEnabled: "Multi Factor Authentication enabled successfully",
  MFADisabled: "Multi Factor Authentication disabled successfully",

  // Signup
  EMAIL_ALREADY_EXSIT: "This email is already in use",
  ACCOUNT_ALREADY_EXSIT: "Account already exist",
  USERNAME_IS_ALREADY_USED: "This username is already in use",
  SIGNUP_SUCCESSFULLY: "Signup successfully",
  INVALID_USER_ID: "Invalid User ID",
  INVALID_VERIFICATION_TOKEN: "Invalid Verification Token",
  EMAIL_VERIFIED: "Email verified successfully",

  // Login
  INVALID_LOGIN_CREDENTIALS: "Invalid Login Credentials",
  LOGGED_IN_SUCCESSFULLY: "Logged in Successfully",
  USER_EMAIL_NOT_VERIFIED: "User email is not verified",
  TWO_FA_ENABLED: "2FA is enabled",
  INVALID_CAPTCHA: "Invalid captcha",
  PASSWORD_ABSENT:
    'It seems you have not set your password yet. Please click on "Forgot Password" to set new password',

  // Generators
  GENERATED_SUCCESSFULLY: "Generated successfully",
  INSUFFICIENT_CREDITS:
    "Insufficient credits. Please topup your credits to continue using this feature.",

  EMAIL_NOT_ASSOCIATED_WITH_ANY_ACCOUNT:
    "Email not associated with any account",
  PASSWORD_UPDATED_SUCCESSFULLY: "Password updated successfully",
};
