"use client";
import { useCallback } from "react";

interface NavbarProps {
  onHomeClick?: () => void;
}

export default function Navbar({ onHomeClick }: NavbarProps) {
  const handleSignIn = useCallback(() => {
    window.location.href = "/api/auth/signin/google";
  }, []);

  return (
    <nav className="navbar">
      <button className="navbar-logo" onClick={onHomeClick} type="button">
        Clanker
      </button>
      <button className="sign-in-btn" type="button" onClick={handleSignIn}>
        Sign In
      </button>
    </nav>
  );
}