/*
  Warnings:

  - Added the required column `discountExpireAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pointsExpireAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "discountExpireAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "pointsExpireAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "referralDiscount" DOUBLE PRECISION NOT NULL DEFAULT 0;
