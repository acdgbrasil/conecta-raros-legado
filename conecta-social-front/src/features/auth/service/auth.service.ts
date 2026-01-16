import { AuthModel } from "../models/auth.model"
import { loginAction } from "../actions/auth.actions"

export const AuthService = () => {
  return {
    Login: async (props: AuthModel) => {
      try {
        const userResponse = await loginAction(props);
        console.log("Login successful:", userResponse);
        sessionStorage.setItem("user", JSON.stringify(userResponse));
      } catch (error) {
        console.error("Login failed", error);
        throw error; 
      }
    }
  }
}
