import Link from "next/link";
import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        position: "relative",
        zIndex: 1,
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "560px",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "18px",
          background: "rgba(12, 10, 22, 0.55)",
          backdropFilter: "blur(24px)",
          padding: "28px",
        }}
      >
        <h1 style={{ fontSize: "2rem", marginBottom: "10px" }}>Clanker</h1>
        <p style={{ color: "rgba(220,220,228,0.78)", marginBottom: "20px" }}>
          Sign in to access your protected project dashboard.
        </p>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
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
            <Link className="sign-in-btn" href="/dashboard">
              Go to Dashboard
            </Link>
          </Show>
        </div>
      </section>
    </main>
  );
}
