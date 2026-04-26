"use client";

interface NavbarProps {
  onHomeClick?: () => void;
}

export default function Navbar({ onHomeClick }: NavbarProps) {
  return (
    <nav className="navbar">
      <button className="navbar-logo" onClick={onHomeClick} type="button">
        Clanker
      </button>
      <button className="sign-in-btn" type="button">
        Sign In
      </button>
    </nav>
  );
}
