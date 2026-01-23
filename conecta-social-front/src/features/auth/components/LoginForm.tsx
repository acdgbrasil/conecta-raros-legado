"use client";

import { useAuthViewModel, AuthViewModelStatus } from "../hooks/useAuthViewModel";

export default function LoginForm() {
  const { login, errorMessage, status } = useAuthViewModel();
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    await login(email, password);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="block mb-1">Email:</label>
          <input type="email" name="email" id="email" required className="border p-2 rounded w-full text-black" />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input type="password" name="password" id="password" required className="border p-2 rounded w-full text-black" />
        </div>
        <button 
            type="submit" 
            disabled={status === AuthViewModelStatus.LOADING}
            className="bg-blue-500 text-white p-2 rounded disabled:opacity-50"
        >
          {status === AuthViewModelStatus.LOADING ? "Logging in..." : "Login"}
          {status === AuthViewModelStatus.SUCCESS && " ✅"}
        </button>
      </form>
      {errorMessage && (
        <p style={{ color: "red" }} className="mt-2">{errorMessage}</p>
      )}
    </div>
  );
}
