import bcrypt from "bcrypt";

export function generateOtp(length = 6) {
  // 6-digit numeric string
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return String(Math.floor(min + Math.random() * (max - min + 1)));
}

export async function hashOtp(otp) {
  return bcrypt.hash(otp, 10);
}

export async function compareOtp(plainOtp, otpHash) {
  return bcrypt.compare(plainOtp, otpHash);
}
