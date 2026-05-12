import { Suspense } from "react";
import LoginScreen from "@/components/login/LoginScreen";

function LoginFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-[#f0f7ff] to-indigo-50" />
  );
}

export default function Home() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginScreen />
    </Suspense>
  );
}
