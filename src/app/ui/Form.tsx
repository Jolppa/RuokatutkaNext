"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { listRestaurants } from "../util/actions";
import { FormState } from "../util/types";

interface FormProps {
  onActionComplete: () => void;
}

export default function Form({ onActionComplete }: FormProps) {
  const initialState: FormState = {
    error: null,
  };
  const [state, formAction, isPending] = useActionState(
    listRestaurants,
    initialState
  );

  useEffect(() => {
    if (!isPending && !state.error) {
      onActionComplete();
    }
  }, [isPending]);

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
          Päivitä tietokanta
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
