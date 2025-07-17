// components/AnalyticsProvider.tsx
import { useAnalytics } from "@/app/hooks/useAnalytics";
import { JSX, ReactNode } from "react";

interface AnalyticsProviderProps {
  children: ReactNode;
}

export default function AnalyticsProvider({
  children,
}: AnalyticsProviderProps): JSX.Element {
  useAnalytics();
  return <>{children}</>;
}
