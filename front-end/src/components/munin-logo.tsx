import Image from "next/image";

// Both marks are rendered; CSS shows the right one, so there's no flash before the theme loads.
export default function MuninLogo({ size = 24 }: { size?: number }) {
  return (
    <>
      <Image
        src="/munin-logo/munin-mark-black.svg"
        alt="Munin"
        width={size}
        height={size}
        priority
        className="dark:hidden"
      />
      <Image
        src="/munin-logo/munin-mark-white.svg"
        alt="Munin"
        width={size}
        height={size}
        priority
        className="hidden dark:block"
      />
    </>
  );
}
