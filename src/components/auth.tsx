import { IconUser } from "@tabler/icons-react";
import AppLink from "@/components/ui/app-link";

export default function Auth() {
  return (
    <div>
      <AppLink href="/">
        <IconUser size={32} />
      </AppLink>
    </div>
  );
}
