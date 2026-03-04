import { Button } from "@/components/ui/button";
import { Library, Loader2, Shield, UserCheck } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginScreen() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div
      data-ocid="login.page"
      className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden px-4"
    >
      {/* Background atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Radial ambient glow */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 50%, oklch(0.78 0.16 75 / 0.06) 0%, transparent 70%)",
          }}
        />
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(oklch(0.92 0.012 255) 1px, transparent 1px),
              linear-gradient(90deg, oklch(0.92 0.012 255) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
        {/* Corner amber accents */}
        <div
          className="absolute top-0 left-0 w-64 h-64 opacity-20"
          style={{
            background:
              "radial-gradient(circle at top-left, oklch(0.78 0.16 75 / 0.3), transparent 60%)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-64 h-64 opacity-20"
          style={{
            background:
              "radial-gradient(circle at bottom-right, oklch(0.68 0.16 200 / 0.2), transparent 60%)",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        {/* Logo & Branding */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col items-center mb-10"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center mb-4 glow-amber">
            <Library className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground tracking-tight mb-1">
            LibraryOS
          </h1>
          <p className="text-sm text-muted-foreground font-mono-code">
            Integrated Library Management
          </p>
        </motion.div>

        {/* Role cards */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="grid grid-cols-2 gap-3 mb-8"
        >
          {/* Admin card */}
          <div className="relative rounded-xl border border-warning/30 bg-card/80 backdrop-blur-sm p-4 overflow-hidden">
            <div
              className="absolute inset-0 opacity-40"
              style={{
                background:
                  "radial-gradient(circle at top-left, oklch(0.78 0.16 75 / 0.15), transparent 60%)",
              }}
            />
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-warning/15 border border-warning/30 flex items-center justify-center mb-3">
                <Shield className="w-4 h-4 text-warning" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">
                Admin Mode
              </h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Manage books & members, view system stats, monitor loans
              </p>
            </div>
          </div>

          {/* Student card */}
          <div className="relative rounded-xl border border-primary/30 bg-card/80 backdrop-blur-sm p-4 overflow-hidden">
            <div
              className="absolute inset-0 opacity-40"
              style={{
                background:
                  "radial-gradient(circle at top-left, oklch(0.68 0.16 200 / 0.15), transparent 60%)",
              }}
            />
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center mb-3">
                <UserCheck className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">
                Student Mode
              </h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Browse catalog, borrow & return books, get AI recommendations
              </p>
            </div>
          </div>
        </motion.div>

        {/* Sign In area */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-6"
        >
          <p className="text-sm text-center text-muted-foreground mb-5 leading-relaxed">
            Sign in to access your role. Your permissions are determined
            automatically by the system.
          </p>

          <Button
            data-ocid="login.primary_button"
            size="lg"
            className="w-full h-11 gap-2.5 text-sm font-semibold glow-amber"
            onClick={login}
            disabled={isLoggingIn}
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                <Library className="h-4 w-4" />
                Sign In with Internet Identity
              </>
            )}
          </Button>

          <p className="text-[10px] text-center text-muted-foreground/60 mt-4 font-mono-code">
            Secured by Internet Computer Protocol
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
