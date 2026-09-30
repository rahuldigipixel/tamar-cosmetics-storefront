import Link from "next/link";

export function LoginPrompt() {
  return (
    <div className="mx-auto max-w-[480px] px-[15px] py-16 text-center">
      <p className="text-[18px] leading-[30px] text-black">
        יש{" "}
        <Link href="/my-account" className="text-brand-accent underline">
          להתחבר
        </Link>{" "}
        כדי לצפות בעמוד זה.
      </p>
    </div>
  );
}
