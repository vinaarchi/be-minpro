import { nanoid } from "nanoid";

export const generateReferralCode = () => {
  return nanoid(10);
};
