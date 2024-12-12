"use server";
import React from "react";
import Link from "next/link";
import { SignOut } from "./SignOut";
import { auth } from "@/auth";

const NavBar: React.FC = async () => {
  const session = await auth();
  return (
    <nav className="bg-gray-800 p-4 min-w-full">
      <ul className="flex justify-around list-none m-0 p-0">
        <li className="m-0">
          <Link href="/">Etusivu</Link>
        </li>

        {!session && (
          <>
            <li className="m-0">
              <Link href="/kirjaudu">Kirjaudu sisään</Link>
            </li>
            <li className="m-0">
              <Link href="/tunnusluonti">Luo tunnus</Link>
            </li>
          </>
        )}

        {session && (
          <>
            <li className="m-0">
              <Link href="/tutka">Tutka</Link>
            </li>
            <li className="m-0">
              <SignOut />
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default NavBar;
