import { AuthModel } from "../models/auth.model"
import { LoginAction } from "../server/auth.actions"

export const AuthService = () => {
  return {
    Login: async (props: AuthModel) => {
      try {
        const userResponse = await LoginAction(props);
        sessionStorage.setItem("user", JSON.stringify(userResponse));
      } catch (error) {
        console.error("Login failed", error);
      }
    }
  }
}