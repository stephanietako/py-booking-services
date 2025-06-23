// app/(auth)/sign-up/[[...sign-up]]/page.tsx
"use client";

import { SignUp } from "@clerk/nextjs";
import { useState, useEffect } from "react";

export default function Page() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="signup_page">
        <div>Chargement...</div>
      </div>
    );
  }

  return (
    <div className="signup_page">
      <SignUp />
    </div>
  );
}
