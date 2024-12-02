import { Request, Response, NextFunction } from "express";

export const handleEmailError = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error.name === "MessageRejected") {
    return res.status(500).json({
      error: "Failed to send email",
      message: "Please try again later",
    });
  }
  next(error);
};
