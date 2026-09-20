import bcrypt from "bcryptjs";
import config from "../constants";

const hashPassword = async (rawPassword: string): Promise<string> => {
  const hashedPassword: string = await bcrypt.hash(
    rawPassword,
    config.bcrypt.saltRounds,
  );
  return hashedPassword;
};

const verifyPassword = async (
  rawPassword: string,
  hashedPassword: string,
): Promise<boolean> => {
  return await bcrypt.compare(rawPassword, hashedPassword);
};

export { hashPassword, verifyPassword };
