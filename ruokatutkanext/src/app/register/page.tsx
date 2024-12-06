"use client";
import { NextPage } from "next";
import { useActionState } from "react";
import { register } from "../util/actions";

// interface Props {}

const Page: NextPage = () => {
  const [errorMessage, formAction] = useActionState(register, undefined);

  return (
    <section className="border-white border-2 rounded-lg p-4 w-1/2">
      <h1 className="text-xl font-bold">Register</h1>
      <div className="flex flex-col"></div>
      <form action={formAction}>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="username"
          >
            Username
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="username"
            type="text"
            name="username"
            placeholder="Username"
          />
        </div>
        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="password"
          >
            Password
          </label>
          <input
            className="shadow appearance-none border border-red rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            name="password"
            type="password"
            placeholder="******************"
          />
        </div>
        <div className="flex items-center justify-between">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Register
          </button>
        </div>
        {errorMessage && (
          <p className="text-red-500 text-center">{errorMessage}</p>
        )}
      </form>
    </section>
  );
};

export default Page;
