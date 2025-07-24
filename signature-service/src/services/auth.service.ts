import axios from "axios";

export const verificarUsuarioExiste = async (userId: string) => {
  try {
    const { data } = await axios.get(`${process.env.AUTH_SERVICE_URL}/api/users/${userId}`);
    return data;
  } catch (err) {
    throw new Error("Usuário não encontrado no auth-service");
  }
};
