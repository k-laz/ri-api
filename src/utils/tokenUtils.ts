import crypto from "crypto";
import jwt from "jsonwebtoken";

export const generateVerificationToken = (): string => {
  // Option 1: Using crypto (random token)
  return crypto.randomBytes(32).toString("hex");

  // OR Option 2: Using JWT
  // return jwt.sign(
  //   { purpose: 'email-verification' },
  //   process.env.JWT_SECRET!,
  //   { expiresIn: '24h' }
  // );
};
