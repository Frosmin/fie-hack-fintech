import type { NextFunction, Request, Response } from "express";

const errorHandler = (
  err: Error & { statusCode?: number; isOperational?: boolean },
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const isProduction = process.env.NODE_ENV === "production";

  if (err.isOperational) {
    return res.status(err.statusCode ?? 500).json({
      error: err.message,
    });
  }

  return res.status(500).json({
    error: isProduction ? "Internal server error" : err.message,
  });
};

export default errorHandler;
