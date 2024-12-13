"use client";
import { NextPage } from "next";
import { useActionState } from "react";
import { register } from "../util/actions";

// interface Props {}

const Page: NextPage = () => {
  const [errorMessage, formAction] = useActionState(register, undefined);

  return (
    <section className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Rekisteröidy</h1>
      {errorMessage && (
        <div className="mb-4 text-red-600" role="alert" aria-live="assertive">
          {errorMessage}
        </div>
      )}
      <form action={formAction}>
        <div className="mb-4">
          <label htmlFor="username" className="block mb-1">
            Käyttäjätunnus
          </label>
          <input
            type="text"
            id="username"
            name="username"
            required
            minLength={3}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 text-black"
            placeholder="Käyttäjätunnus"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block mb-1">
            Salasana
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            minLength={6}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 text-black"
            placeholder="********"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="confirmPassword" className="block mb-1">
            Vahvista salasana
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            required
            minLength={6}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 text-black"
            placeholder="********"
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          Rekisteröidy
        </button>
      </form>
    </section>
  );
};

export default Page;
