"use client";

import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

interface NavbarProps {
  onHomeClick?: () => void;
}

export default function Navbar({ onHomeClick }: NavbarProps) {
  return (
    <nav className="navbar">
      <button className="navbar-logo" onClick={onHomeClick} type="button">
        Clanker
      </button>
      <div className="navbar-auth">
        <Show when="signed-out">
          <SignInButton mode="modal">
            <button className="sign-in-btn" type="button">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="sign-in-btn" type="button">
              Sign Up
            </button>
          </SignUpButton>
        </Show>

        <Show when="signed-in">
          <UserButton />
        </Show>
      </div>
    </nav>
  );
}
