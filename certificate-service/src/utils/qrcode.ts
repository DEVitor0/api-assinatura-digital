import QRCode from "qrcode";

export const generateQRCode = async (url: string): Promise<string> => {
  return await QRCode.toDataURL(url);
};
