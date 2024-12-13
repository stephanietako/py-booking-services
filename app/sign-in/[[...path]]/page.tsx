import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="signin_page">
      <SignIn />
    </div>
  );
}
