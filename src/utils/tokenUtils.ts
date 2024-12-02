import jwt from "jsonwebtoken";

interface VerificationToken {
  token: string;
  expiresAt: Date;
}

export const generateVerificationToken = (email: string): VerificationToken => {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const token = jwt.sign(
    {
      purpose: "email-verification",
      email: email,
      exp: Math.floor(expiresAt.getTime() / 1000), // JWT expects seconds
      iat: Math.floor(Date.now() / 1000),
    },
    process.env.JWT_SECRET!
  );

  return {
    token,
    expiresAt,
  };
};

// Verification function
export const verifyJWTToken = (token: string): { email: string } | null => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      email: string;
      purpose: string;
    };

    if (decoded.purpose !== "email-verification") {
      return null;
    }

    return {
      email: decoded.email,
    };
  } catch (error) {
    // Token expired or invalid
    return null;
  }
};
