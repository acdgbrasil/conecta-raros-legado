import { Show } from "solid-js";
import { useAuthViewModel, AuthViewModelStatus } from "../viewModel/auth.viewModel";

export default function LoginPage() {
  const { login, errorMessage, status } = useAuthViewModel();
  
  const handleSubmit = async (event: Event) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    await login(email, password);
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label for="email">Email:</label>
          <input type="email" name="email" required />
        </div>
        <div>
          <label for="password">Password:</label>
          <input type="password" name="password" required />
        </div>
        <button type="submit" disabled={status() === AuthViewModelStatus.LOADING}>
          {status() === AuthViewModelStatus.LOADING ? "Logging in..." : "Login"}
        </button>
      </form>
      <Show when={errorMessage()}>
        <p style={{ color: "red" }}>{errorMessage()}</p>
      </Show>
    </div>
  );

}