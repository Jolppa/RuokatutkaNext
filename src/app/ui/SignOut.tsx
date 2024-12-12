"use client";
import { signout } from "../util/actions";
import { useActionState } from "react";

const initialState = undefined;

export function SignOut() {
  const [, formAction, isPending] = useActionState(signout, initialState);
  return (
    <form action={formAction}>
      <button className="m-0" disabled={isPending}>
        {isPending ? "Kirjaudutaan ulos..." : "Kirjaudu ulos"}
      </button>
    </form>
  );
}
