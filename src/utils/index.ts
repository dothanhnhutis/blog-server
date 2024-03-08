import bcryptjs from "bcryptjs";

export const hashData = (data: string) => {
  const salt = bcryptjs.genSaltSync(10);
  return bcryptjs.hashSync(data, salt);
};

export const compareData = (hash: string, data: string): Promise<boolean> => {
  return bcryptjs.compare(data, hash).catch((e) => false);
};

export const generateOTPCode = () => {
  return Math.floor(Math.random() * (999999 - 100000) + 100000).toString();
};




