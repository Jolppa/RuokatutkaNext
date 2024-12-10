import React from "react";
import Link from "next/link";
import { SignOut } from "./SignOut";

const NavBar: React.FC = () => {
  return (
    <nav className="bg-gray-800 p-4 min-w-full">
      <ul className="flex justify-around list-none m-0 p-0">
        <li className="m-0">
          <Link href="/">Home</Link>
        </li>

        <li className="m-0">
          <Link href="/login">Login</Link>
        </li>
        <li className="m-0">
          <SignOut />
        </li>

        <li className="m-0">
          <Link href="/register">Registeration</Link>
        </li>
        <li className="m-0">
          <Link href="/dashboard">Dashboard</Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
