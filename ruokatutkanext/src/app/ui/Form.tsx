"use client";
import { useActionState } from "react";
import { listRestaurants } from "../util/actions";
import { FormState } from "../util/types";

export default function Form() {
  const initialState: FormState = {
    error: null,
  };
  const [state, formAction, isPending] = useActionState(
    listRestaurants,
    initialState
  );
  const resetError = () => {
    state.error = null;
  };
  return (
    <section>
      <form
        className="flex flex-col items-center border-white border-2 rounded-lg p-4"
        action={formAction}
      >
        <label className="text-lg" htmlFor="Kaupunki">
          Valitse kaupunki
        </label>
        <input
          className="border-2 border-black rounded-lg p-2 text-black"
          id="kaupunki"
          name="kaupunki"
          defaultValue={"Turku"}
          type="text"
          required
        />

        <button
          className={`rounded-lg p-2 mt-2 ${
            isPending ? "bg-gray-500" : "bg-blue-500 text-white"
          }`}
          onClick={resetError}
          disabled={isPending}
        >
          Search
        </button>
      </form>
      {isPending && (
        <p className="text-blue-500 text-lg font-bold text-center">
          Haetaan...
        </p>
      )}
      {state.error && (
        <p className="text-red-500 text-lg font-bold text-center">
          {state.error}
        </p>
      )}
    </section>
  );
}
