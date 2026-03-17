import { LoginForm } from "@/components/forms/login-form";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const redirectTo = typeof params.redirect === "string" ? params.redirect : "/dashboard";

  return (
    <div className="page-shell">
      <div className="site-container grid gap-6 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="hero-gradient hero-login space-y-4 p-7 sm:p-8">
          <p className="kicker">Get Started</p>
          <h1 className="text-4xl font-bold tracking-tight text-white">Create your account and start learning.</h1>
          <p className="max-w-2xl text-sm leading-7 text-[#d4e8f4] sm:text-base">
            Register with your details, verify OTP, and get instant access to dashboard and course learning paths.
          </p>
        </div>
        <div className="w-full max-w-md justify-self-center lg:justify-self-end">
          <LoginForm redirectTo={redirectTo} initialMode="register" />
        </div>
      </div>
    </div>
  );
}
