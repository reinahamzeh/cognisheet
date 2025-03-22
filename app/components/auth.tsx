"use client";

import { Button } from "@/components/ui/button";
import { useUser } from "@/context/user-context";

export function Auth() {
  const { signIn } = useUser();

  return (
    <div className="flex flex-col items-center gap-4">
      <Button onClick={signIn} size="lg">
        Sign in with Google
      </Button>
    </div>
  );
} 