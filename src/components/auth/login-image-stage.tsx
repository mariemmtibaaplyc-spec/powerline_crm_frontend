import {
  Activity,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import backgroundImage from "../../../images/background.png";
import { LoginForm } from "@/components/auth/login-form";

const surfaceDetails = [
  {
    label: "Supervision live",
    icon: Activity,
    tone: "border-[#d9e7f7] bg-[#f5f9ff] text-[#2d6fcb]",
  },
  {
    label: "CRM operations",
    icon: ShieldCheck,
    tone: "border-[#f0ddcb] bg-[#fff7f1] text-[#c9783d]",
  },
] as const;

export function LoginImageStage() {
  return (
    <div className="login-stage-shell relative min-h-[calc(100vh-1.5rem)] overflow-hidden rounded-[2.5rem] border border-white/10 shadow-[0_64px_180px_rgba(4,10,32,0.62)] sm:min-h-[calc(100vh-2.5rem)] lg:h-[min(820px,calc(100vh-3.5rem))] lg:min-h-0 xl:h-[min(840px,calc(100vh-4rem))] 2xl:h-[min(860px,calc(100vh-5rem))]">
      <Image
        src={backgroundImage}
        alt=""
        priority
        fill
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-[linear-gradient(112deg,rgba(16,31,55,0.72)_0%,rgba(18,35,62,0.42)_40%,rgba(12,24,43,0.64)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(255,255,255,0.12),transparent_18%),radial-gradient(circle_at_77%_22%,rgba(45,111,203,0.26),transparent_20%),radial-gradient(circle_at_76%_78%,rgba(15,106,102,0.22),transparent_18%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_72%,rgba(224,158,87,0.14),transparent_20%),radial-gradient(circle_at_62%_32%,rgba(255,218,188,0.08),transparent_18%)]" />
      <div className="absolute inset-[1px] rounded-[calc(2.5rem-1px)] border border-white/8" />
      <div className="absolute inset-x-[8%] top-0 h-20 bg-[radial-gradient(circle,rgba(255,255,255,0.12),transparent_72%)] blur-3xl" />

      <div className="relative z-10 grid min-h-[calc(100vh-1.5rem)] sm:min-h-[calc(100vh-2.5rem)] md:grid-cols-[1.02fr_0.98fr] md:items-stretch lg:h-full lg:min-h-0 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="pointer-events-none absolute inset-y-[8%] left-1/2 z-20 hidden w-24 -translate-x-1/2 bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(234,241,248,0.92)_24%,rgba(185,205,229,0.34)_48%,rgba(28,50,80,0.08)_76%,rgba(18,35,62,0)_100%)] blur-2xl lg:block" />

        <section className="relative flex items-start overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(247,251,255,0.9)_52%,rgba(244,249,255,0.86)_100%)] px-7 py-10 sm:px-10 md:h-full md:px-8 md:py-12 md:items-center lg:px-14 lg:py-12 lg:items-center xl:px-[4.5rem] xl:py-14 2xl:px-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(255,255,255,0.95),transparent_24%),radial-gradient(circle_at_60%_84%,rgba(231,240,252,0.72),transparent_22%),radial-gradient(circle_at_42%_54%,rgba(255,229,203,0.22),transparent_18%)]" />
          <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-px bg-[linear-gradient(180deg,rgba(214,225,236,0),rgba(214,225,236,0.92),rgba(214,225,236,0))] lg:block" />

          <div className="relative z-10 w-full max-w-[700px] self-center space-y-5 text-[#102033] md:max-w-[520px] lg:max-w-[600px] xl:max-w-[640px]">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_32%_28%,rgba(221,234,251,0.72),transparent_54%)] blur-3xl sm:h-44 lg:h-48" />

            <div className="space-y-3">
              <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.24em] text-[#72859a]">
                Powerline YC platform
              </p>
              <h1 className="max-w-[480px] text-4xl font-semibold tracking-tight text-[#102033] sm:text-[2.9rem] md:text-[2.65rem] lg:text-[3.15rem] xl:text-[3.35rem]">
                Powerline CRM
              </h1>
              <p className="max-w-[500px] text-base leading-8 text-[#5f738a] lg:text-lg">
                Une interface CRM unifiee pour superviser la production et
                piloter l&apos;activite du centre d&apos;appels avec plus de
                clarte.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              {surfaceDetails.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium shadow-[0_10px_24px_rgba(20,32,53,0.05)] ${item.tone}`}
                  >
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80"
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative flex min-h-[520px] items-center justify-center px-7 py-10 sm:px-10 md:min-h-0 md:h-full md:items-center md:px-8 md:py-12 lg:min-h-0 lg:px-14 lg:py-12 xl:px-[4.5rem] xl:py-14 2xl:px-24">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,31,55,0.16)_0%,rgba(16,31,55,0.34)_100%)] lg:bg-[linear-gradient(180deg,rgba(16,31,55,0.08)_0%,rgba(16,31,55,0.24)_100%)]" />
          <div className="pointer-events-none absolute inset-y-[16%] left-[14%] right-[8%] hidden rounded-[2.6rem] bg-[radial-gradient(circle,rgba(8,17,32,0.18),transparent_70%)] blur-3xl lg:block" />
          <div className="pointer-events-none absolute inset-y-[18%] left-[18%] right-[10%] hidden rounded-[2.4rem] bg-[radial-gradient(circle,rgba(255,255,255,0.08),transparent_72%)] blur-3xl lg:block" />
          <div className="pointer-events-none absolute inset-y-[22%] left-[18%] right-[14%] hidden rounded-[2.4rem] bg-[radial-gradient(circle,rgba(232,167,112,0.1),transparent_70%)] blur-3xl lg:block" />
          <div className="login-preview-ambient pointer-events-none absolute inset-y-[14%] left-[10%] right-[6%] hidden lg:block">
            <div className="login-preview-orb login-preview-orb-a" />
            <div className="login-preview-orb login-preview-orb-b" />
            <div className="login-preview-ring" />
            <div className="login-preview-sweep" />
          </div>

          <div className="relative z-10 flex w-full max-w-[490px] md:items-center">
            <div className="relative w-full rounded-[2.2rem] border border-white/14 bg-[linear-gradient(180deg,rgba(17,30,52,0.72)_0%,rgba(9,18,34,0.92)_100%)] px-7 py-8 shadow-[0_40px_110px_rgba(2,9,27,0.54)] backdrop-blur-[32px] sm:px-8 sm:py-9">
              <div className="pointer-events-none absolute inset-[1px] rounded-[calc(2.15rem-1px)] border border-white/6" />
              <div className="pointer-events-none absolute -right-6 top-5 h-24 w-24 rounded-full bg-[#f0b57d]/18 blur-3xl" />
              <div className="pointer-events-none absolute -left-4 bottom-10 h-20 w-20 rounded-full bg-[#2d6fcb]/18 blur-3xl" />
              <div className="relative">
                <LoginForm variant="bare" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
