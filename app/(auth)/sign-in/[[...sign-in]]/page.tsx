// app/(auth)/sign-in/[[...sign-in]]/page.tsx
"use client";

import { SignIn } from "@clerk/nextjs";
import { useState, useEffect } from "react";

export default function Page() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="signin_page">
        <div>Chargement...</div>
      </div>
    );
  }

  return (
    <div className="signin_page">
      <SignIn />
    </div>
  );
}
