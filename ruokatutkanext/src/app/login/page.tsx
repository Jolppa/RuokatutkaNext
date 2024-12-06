"use client";

import { useActionState } from "react";
import { authenticate } from "../util/actions";

export default function Login() {
  const [errorMessage, formAction] = useActionState(authenticate, undefined);
  return (
    <form
      className="flex flex-col items-center justify-center bg-black-800"
      action={formAction}
    >
      <div className="w-full max-w-md p-8 space-y-6 bg-black rounded shadow-md">
        <h1 className="text-2xl font-bold text-center">Login</h1>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            id="username"
            name="username"
            required
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
          <input
            type="password"
            id="password"
            name="password"
            required
            placeholder="Password"
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
          <input type="hidden" name="callbackUrl" value="/dashboard" />
          <button className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700">
            Login
          </button>
          {errorMessage && (
            <p className="text-red-500 text-center">{errorMessage}</p>
          )}
        </div>
      </div>
    </form>
  );
}
