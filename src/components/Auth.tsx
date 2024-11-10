import Image from "next/image";
import Link from "next/link";

export default function Auth() {
  return (
    <div>
      <Link href="/login">
        <Image priority={true} src="/auth.svg" alt="login" width={24} height={24} />
      </Link>
    </div>
  );
}
