import { LoginImageStage } from "@/components/auth/login-image-stage";

export default function LoginPage() {
  return (
    <main className="login-page-backdrop relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="auth-orb absolute -left-20 top-10 h-80 w-80 rounded-full bg-[#2d6fcb]/18 blur-3xl" />
        <div className="absolute left-[28%] top-[14%] h-72 w-72 rounded-full bg-[#4f81d7]/10 blur-[110px]" />
        <div className="auth-orb absolute bottom-0 right-[-4rem] h-[28rem] w-[28rem] rounded-full bg-[#0f6a66]/12 blur-3xl" />
        <div className="login-shooting-stars absolute inset-0">
          <span className="login-shooting-star login-shooting-star-a" />
          <span className="login-shooting-star login-shooting-star-b" />
          <span className="login-shooting-star login-shooting-star-c" />
          <span className="login-shooting-star login-shooting-star-d" />
          <span className="login-shooting-star login-shooting-star-e" />
          <span className="login-shooting-star login-shooting-star-f" />
          <span className="login-star-dot login-star-dot-a" />
          <span className="login-star-dot login-star-dot-b" />
          <span className="login-star-dot login-star-dot-c" />
          <span className="login-star-dot login-star-dot-d" />
          <span className="login-star-dot login-star-dot-e" />
          <span className="login-star-dot login-star-dot-f" />
        </div>
      </div>

      <div className="relative z-10 flex min-h-screen w-full items-center justify-center px-3 py-3 sm:px-5 sm:py-5 lg:px-8 lg:py-4 xl:px-10 xl:py-5 2xl:px-12 2xl:py-6">
        <div className="mx-auto w-full max-w-[1800px]">
          <LoginImageStage />
        </div>
      </div>
    </main>
  );
}
