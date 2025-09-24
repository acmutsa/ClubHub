import Link from "next/link";

export default function Navbar() {
  return (
    <div className="min-h-16 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"></div>
        <div className="flex items-center gap-2">
          <Link href="/sign-in">Sign in</Link>
          <Link href="/sign-up">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
