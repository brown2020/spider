import Link from "next/link";

export const metadata = {
  title: "About — Spider",
  description: "About the Spider web hunting arcade game",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0a0e17] text-slate-200 px-6 py-12 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-white">About Spider</h1>
      <p className="mb-4 text-slate-300 leading-relaxed">
        Spider is a client-side web hunting arcade game. Spin webs, zip across
        the night sky, catch prey, and chase combos. Progress (high score) is
        stored only in your browser via localStorage — there is no account or
        server scoreboard.
      </p>
      <ul className="list-disc pl-6 mb-6 space-y-2 text-slate-400">
        <li>Desktop: WASD / arrows, Space jump, click web, right-click zip</li>
        <li>Mobile: virtual joystick and action buttons</li>
        <li>No authentication; Auth UX is not applicable</li>
      </ul>
      <Link
        href="/"
        className="inline-flex text-blue-300 underline underline-offset-4 hover:text-blue-200"
      >
        Back to game
      </Link>
    </main>
  );
}
