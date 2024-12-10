"use client";
import { signout } from "../util/actions";
import { useActionState } from "react";

export function SignOut() {
  const initialState = {
    error: "",
  };
  const [state, formAction, isPending] = useActionState(signout, initialState);
  return (
    <form action={formAction}>
      <button
        className={`rounded-lg p-2 mt-2 ${
          isPending ? "bg-gray-500" : "bg-blue-500 text-white"
        }`}
        disabled={isPending}
      >
        Sign Out
      </button>
    </form>
  );
}
