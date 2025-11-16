export const HTTPCodes = {
  OK: {
    code: 200,
    message: "OK",
  },
  NOT_FOUND: {
    code: 404,
    message: "Not Found",
  },
  INTERNAL_SERVER_ERROR: {
    code: 500,
    message: "Internal Server Error",
  },
  UNPROCESSABLE_ENTITY: {
    code: 422,
    message: "Unprocessable Entity",
  },
  BAD_REQUEST: {
    code: 400,
    message: "Bad Request",
  },
} as const;
