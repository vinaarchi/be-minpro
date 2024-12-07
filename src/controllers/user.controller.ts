import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import ResponseHandler from "../utils/ResponseHandler";
import { hashPassword } from "../utils/hashPassword";
import { generateReferralCode } from "../utils/generateReferralCode";
import { sign } from "jsonwebtoken";
import { sendEmail } from "../utils/emailSender";

export class UserController {
  async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      //cek apakah email ada atau tidak
      const isExistUser = await prisma.user.findUnique({
        where: { email: req.body.email },
      });

      if (isExistUser) {
        return ResponseHandler.error(
          res,
          `${req.body.email} is already registered. Please use another email.`,
          400
        );
      }

      const newPassword = await hashPassword(req.body.password);

      //generate referral code untuk pengguna baru
      const referralCode = generateReferralCode();

      let referredByUserId = null;
      let discountExpireAt = null;
      if (req.body.referralCode) {
        const referredByUser = await prisma.user.findUnique({
          where: { referralCode: req.body.referralCode },
        });

        if (referredByUser) {
          referredByUserId = referredByUser.id;
          //nambahin poin untuk pengguna yang memberi referral
          await prisma.user.update({
            where: { id: referredByUserId },
            data: { points: { increment: 10 } },
          });
        }
      }

      // buat pengguna baru
      const user = await prisma.user.create({
        data: {
          ...req.body,
          password: newPassword,
          referralCode: referralCode,
          referredBy: referredByUserId,
        },
      });

      const token = sign(
        { id: user.id, email: user.email },
        process.env.TOKEN_KEY || "secret",
        { expiresIn: "1h" }
      );

      await sendEmail(req.body.email, "Registration Info", "register.hbs", {
        username: req.body.username,
        link: `${process.env.FE_URL}/verify?a_t=${token}`,
      });
    } catch (error: any) {
      console.log(error);
      return ResponseHandler.error(
        res,
        "Registration failed",
        error.rc || 500,
        error
      );
    }
  }
}
