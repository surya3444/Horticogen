import Link from "next/link";
import Image from "next/image";

export function Logo({ logo, siteName }: { logo?: string; siteName?: string }) {
  return (
    <Link href="/" className="flex items-center gap-2 shrink-0">
      <Image
        src={logo || "/logo.png"}
        alt={siteName || "HorticoGen"}
        width={939}
        height={266}
        priority
        className="h-10 w-auto object-contain"
      />
    </Link>
  );
}
