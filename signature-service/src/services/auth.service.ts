import axios from "axios";

export const verifyUserExists = async (userId: string) => {
  try {
    const { data } = await axios.get(`${process.env.AUTH_SERVICE_URL}/api/users/${userId}`);
    return data;
  } catch {
    throw new Error("User not found in auth-service");
  }
};