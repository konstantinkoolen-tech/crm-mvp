"use client";

import { ArrowLeft, CheckCircle2, KeyRound, MailCheck } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

type InviteSetupFormProps = {
  invitedEmail: string;
};

type Step = "password" | "verification" | "complete";

const VERIFICATION_CODE_LENGTH = 8;

export function InviteSetupForm({
  invitedEmail,
}: InviteSetupFormProps) {
  const [step, setStep] = useState<Step>("password");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (step !== "complete") {
      return;
    }

    const redirectTimer = window.setTimeout(
      () => window.location.assign("/dashboard"),
      700,
    );

    return () => window.clearTimeout(redirectTimer);
  }, [step]);

  async function continueWithPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (password.length < 8) {
      setError("Das Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }

    if (password !== passwordConfirmation) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();
    await supabase.auth.signOut({ scope: "local" });
    await sendVerificationCode(supabase);
  }

  async function verifyInvitation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (!new RegExp(`^\\d{${VERIFICATION_CODE_LENGTH}}$`).test(verificationCode)) {
      setError("Bitte gib den achtstelligen Code aus der E-Mail ein.");
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();
    const { data, error: verificationError } = await supabase.auth.verifyOtp({
      email: invitedEmail,
      token: verificationCode,
      type: "email",
    });

    if (verificationError) {
      setError("Der Code ist ungültig oder abgelaufen. Bitte fordere einen neuen Code an.");
      setIsSubmitting(false);
      return;
    }

    if (data.user?.email?.toLowerCase() !== invitedEmail.toLowerCase()) {
      await supabase.auth.signOut({ scope: "local" });
      setError("Der Code gehört nicht zur eingeladenen E-Mail-Adresse.");
      setIsSubmitting(false);
      return;
    }

    const { error: passwordError } = await supabase.auth.updateUser({ password });

    if (passwordError) {
      await supabase.auth.signOut({ scope: "local" });
      setStep("password");
      setVerificationCode("");
      setError(
        `Das Passwort konnte nicht gespeichert werden: ${passwordError.message}`,
      );
      setIsSubmitting(false);
      return;
    }

    setPassword("");
    setPasswordConfirmation("");
    setVerificationCode("");
    setStep("complete");
  }

  async function sendVerificationCode(
    supabase = createClient(),
    successMessage = "Wir haben dir einen Bestätigungscode gesendet.",
  ) {
    setError(null);
    setNotice(null);
    setIsSubmitting(true);
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: invitedEmail,
      options: {
        shouldCreateUser: false,
      },
    });

    if (otpError) {
      setError(`Der Bestätigungscode konnte nicht gesendet werden: ${otpError.message}`);
      setIsSubmitting(false);
      return;
    }

    setStep("verification");
    setNotice(successMessage);
    setIsSubmitting(false);
  }

  if (!invitedEmail) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Diese Einladung enthält keine gültige E-Mail-Adresse. Bitte fordere eine neue
          Einladung an.
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Zur Anmeldung
        </Link>
      </div>
    );
  }

  if (step === "complete") {
    return (
      <div className="py-5 text-center">
        <CheckCircle2 className="mx-auto size-8 text-emerald-600" aria-hidden="true" />
        <h2 className="mt-4 text-xl font-semibold text-neutral-950">Account aktiviert</h2>
        <p className="mt-2 text-sm text-neutral-600">Du wirst zum Dashboard weitergeleitet.</p>
      </div>
    );
  }

  return (
    <>
      <div
        className="mb-6 flex items-center gap-2"
        aria-label="Einrichtungsfortschritt"
      >
        <StepIndicator
          active={step === "password"}
          complete={step === "verification"}
          label="Passwort"
        />
        <div className="h-px flex-1 bg-neutral-200" />
        <StepIndicator
          active={step === "verification"}
          complete={false}
          label="Verifizierung"
        />
      </div>

      {error ? (
        <div
          className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      {notice ? (
        <div
          className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
          role="status"
        >
          {notice}
        </div>
      ) : null}

      {step === "password" ? (
        <form className="space-y-4" onSubmit={continueWithPassword}>
          <div className="space-y-2">
            <Label htmlFor="invite-email">E-Mail</Label>
            <Input
              id="invite-email"
              type="email"
              value={invitedEmail}
              readOnly
              aria-readonly="true"
            />
            <p className="text-xs text-neutral-500">
              Die eingeladene E-Mail kann nicht geändert werden.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-password">Passwort</Label>
            <Input
              id="invite-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Mindestens 8 Zeichen"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-password-confirmation">Passwort wiederholen</Label>
            <Input
              id="invite-password-confirmation"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={passwordConfirmation}
              onChange={(event) => setPasswordConfirmation(event.target.value)}
            />
          </div>

          <Button className="w-full" type="submit" disabled={isSubmitting}>
            <KeyRound aria-hidden="true" />
            {isSubmitting ? "Code wird gesendet..." : "Bestätigungscode senden"}
          </Button>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={verifyInvitation}>
          <div className="rounded-md bg-neutral-50 p-3 text-sm text-neutral-600">
            Gib den achtstelligen Code aus der E-Mail an{" "}
            <strong>{invitedEmail}</strong> ein.
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-code">Bestätigungscode</Label>
            <Input
              id="invite-code"
              type="text"
              autoComplete="one-time-code"
              inputMode="numeric"
              pattern={`[0-9]{${VERIFICATION_CODE_LENGTH}}`}
              maxLength={VERIFICATION_CODE_LENGTH}
              required
              value={verificationCode}
              onChange={(event) =>
                setVerificationCode(
                  event.target.value
                    .replace(/\D/g, "")
                    .slice(0, VERIFICATION_CODE_LENGTH),
                )
              }
              placeholder="00000000"
              className="text-center text-lg tabular-nums tracking-[0.28em]"
            />
          </div>

          <Button className="w-full" type="submit" disabled={isSubmitting}>
            <MailCheck aria-hidden="true" />
            {isSubmitting
              ? "Wird verifiziert..."
              : "Code bestätigen und Account aktivieren"}
          </Button>
          <Button
            className="w-full"
            type="button"
            variant="ghost"
            disabled={isSubmitting}
            onClick={() => sendVerificationCode()}
          >
            Code erneut senden
          </Button>
        </form>
      )}
    </>
  );
}

function StepIndicator({
  active,
  complete,
  label,
}: {
  active: boolean;
  complete: boolean;
  label: string;
}) {
  return (
    <span
      className={`text-xs font-medium ${
        active || complete ? "text-neutral-950" : "text-neutral-400"
      }`}
    >
      {label}
    </span>
  );
}
