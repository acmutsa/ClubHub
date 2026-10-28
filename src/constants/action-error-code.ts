export enum ActionErrorCode {
  VALIDATION_ERROR = "VALIDATION_ERROR", // Submitted input failed schema validation.
  UNAUTHORIZED = "UNAUTHORIZED", // The request does not have a signed-in user.
  FORBIDDEN = "FORBIDDEN", // The user is signed in but cannot perform the action.
  NOT_FOUND = "NOT_FOUND", // The requested record or club does not exist.
  CONFLICT = "CONFLICT", // The action conflicts with the current record state.
  EXPIRED = "EXPIRED", // The action, token, or requested operation has expired.
  SERVER_ERROR = "SERVER_ERROR", // An unexpected server-side failure occurred.
}
