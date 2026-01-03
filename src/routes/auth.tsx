import { useId, useState } from "react";
import { useNavigate } from "react-router";
import { useSignIn, useSignUp } from "@clerk/react-router";
import { isClerkAPIResponseError } from "@clerk/react-router/errors";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { tryCatch } from "@/lib/utils";

type AuthStep = "email" | "otp";
type AuthMode = "sign-in" | "sign-up" | null;

function getClerkErrorMessage(err: unknown, fallback: string): string {
  if (isClerkAPIResponseError(err)) {
    return err.errors[0]?.longMessage || fallback;
  }
  return "An unexpected error occurred";
}

export default function Auth() {
  const navigate = useNavigate();
  const {
    signIn,
    setActive: setSignInActive,
    isLoaded: isSignInLoaded,
  } = useSignIn();
  const {
    signUp,
    setActive: setSignUpActive,
    isLoaded: isSignUpLoaded,
  } = useSignUp();

  const [step, setStep] = useState<AuthStep>("email");
  const [authMode, setAuthMode] = useState<AuthMode>(null);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoaded = isSignInLoaded && isSignUpLoaded;

  const emailInputId = useId();
  const codeInputId = useId();

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || !signIn || !signUp) return;

    setError(null);
    setIsSubmitting(true);

    const [signInAttempt, signInErr] = await tryCatch(
      signIn.create({ identifier: email }),
    );

    if (signInAttempt) {
      const emailCodeFactor = signInAttempt.supportedFirstFactors?.find(
        (factor) => factor.strategy === "email_code",
      );

      if (emailCodeFactor && "emailAddressId" in emailCodeFactor) {
        await signIn.prepareFirstFactor({
          strategy: "email_code",
          emailAddressId: emailCodeFactor.emailAddressId,
        });
        setAuthMode("sign-in");
        setStep("otp");
      }
      setIsSubmitting(false);
      return;
    }

    if (!isClerkAPIResponseError(signInErr)) {
      setError("An unexpected error occurred");
      setIsSubmitting(false);
      return;
    }

    const isUserNotFound = signInErr.errors.some(
      (e) =>
        e.code === "form_identifier_not_found" ||
        e.code === "identifier_not_found",
    );

    if (!isUserNotFound) {
      setError(getClerkErrorMessage(signInErr, "Failed to sign in"));
      setIsSubmitting(false);
      return;
    }

    const [, signUpCreateErr] = await tryCatch(
      signUp.create({ emailAddress: email }),
    );

    if (signUpCreateErr) {
      setError(
        getClerkErrorMessage(signUpCreateErr, "Failed to create account"),
      );
      setIsSubmitting(false);
      return;
    }

    const [, prepareErr] = await tryCatch(
      signUp.prepareEmailAddressVerification({ strategy: "email_code" }),
    );

    if (prepareErr) {
      setError(
        getClerkErrorMessage(prepareErr, "Failed to send verification code"),
      );
      setIsSubmitting(false);
      return;
    }

    setAuthMode("sign-up");
    setStep("otp");
    setIsSubmitting(false);
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) return;

    setError(null);
    setIsSubmitting(true);

    if (authMode === "sign-in" && signIn) {
      const [result, err] = await tryCatch(
        signIn.attemptFirstFactor({ strategy: "email_code", code }),
      );

      if (err) {
        setError(getClerkErrorMessage(err, "Invalid verification code"));
        setIsSubmitting(false);
        return;
      }

      if (result.status === "complete" && result.createdSessionId) {
        await setSignInActive({ session: result.createdSessionId });
        navigate("/");
      }
    } else if (authMode === "sign-up" && signUp) {
      const [result, err] = await tryCatch(
        signUp.attemptEmailAddressVerification({ code }),
      );

      if (err) {
        setError(getClerkErrorMessage(err, "Invalid verification code"));
        setIsSubmitting(false);
        return;
      }

      if (result.status === "complete") {
        await setSignUpActive({ session: result.createdSessionId });
        navigate("/");
      } else if (result.status === "missing_requirements") {
        const missing = result.missingFields?.join(", ") || "unknown fields";
        setError(`Additional information required: ${missing}`);
      } else {
        setError(`Sign-up incomplete: ${result.status}`);
      }
    }

    setIsSubmitting(false);
  }

  async function handleResendCode() {
    if (!isLoaded) return;

    setError(null);
    setIsSubmitting(true);

    if (authMode === "sign-in" && signIn) {
      const emailCodeFactor = signIn.supportedFirstFactors?.find(
        (factor) => factor.strategy === "email_code",
      );
      if (emailCodeFactor && "emailAddressId" in emailCodeFactor) {
        const [, err] = await tryCatch(
          signIn.prepareFirstFactor({
            strategy: "email_code",
            emailAddressId: emailCodeFactor.emailAddressId,
          }),
        );
        if (err) {
          setError(getClerkErrorMessage(err, "Failed to resend code"));
        }
      }
    } else if (authMode === "sign-up" && signUp) {
      const [, err] = await tryCatch(
        signUp.prepareEmailAddressVerification({ strategy: "email_code" }),
      );
      if (err) {
        setError(getClerkErrorMessage(err, "Failed to resend code"));
      }
    }

    setIsSubmitting(false);
  }

  function handleBack() {
    setStep("email");
    setAuthMode(null);
    setCode("");
    setError(null);
  }

  if (!isLoaded) {
    return (
      <Card className="w-full min-w-[350px]">
        <CardContent className="flex items-center justify-center py-8">
          <span>Loading...</span>
        </CardContent>
      </Card>
    );
  }

  if (step === "otp") {
    return (
      <form onSubmit={handleOtpSubmit}>
        <Card className="w-full min-w-[350px]">
          <CardHeader>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We sent a verification code to {email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor={codeInputId}>Verification code</Label>
                <Input
                  autoFocus
                  id={codeInputId}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="one-time-code"
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Verifying..." : "Verify"}
            </Button>
            <div className="flex gap-2 w-full">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleResendCode}
                disabled={isSubmitting}
              >
                Resend code
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>
    );
  }

  return (
    <form onSubmit={handleEmailSubmit}>
      <Card className="w-full min-w-[350px]">
        <CardHeader>
          <CardTitle>Access your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account or to create a new
            one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor={emailInputId}>Email</Label>
              <Input
                autoFocus
                id={emailInputId}
                type="email"
                name="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Sending code..." : "Continue"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
