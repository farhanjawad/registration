export const ADMIN_EMAILS = ["230540@ku.ac.bd", "admin@kudc.app", "harun.ku17@gmail.com"];

export type RegistrationData = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  discipline: string;
  userType: string;
  studentId?: string;
  designation?: string;
  buyBook: string;
  trxId?: string;
  status: string;
  verificationCode?: string;
  bookCollected?: boolean;
  createdAt: any; 
};

export const toBengaliNumber = (num: number | string) => {
  if (!num) return "";
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().replace(/\d/g, (digit) => bengaliDigits[Number(digit)]);
};