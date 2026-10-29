import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BrandLogo from "../../components/BrandLogo";
import { demoMode, supabase } from "../../lib/supabaseClient";

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [factor, setFactor] = useState(null);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [step, setStep] = useState("credentials");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handlePasswordSubmit(event) {
    event.preventDefault();

    if (demoMode) {
      setError(
        "Secure admin access requires a configured Supabase project with authenticator MFA. Demo mode cannot securely verify MFA."
      );
      return;
    }

    setError("");
    setLoading(true);

    try {
      const { data: loginData, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError || !loginData?.session) {
        setError("Invalid email or password. Please try again.");
        return;
      }

      const { data: admin, error: adminError } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", loginData.session.user.id)
        .maybeSingle();

      if (adminError) {
        throw adminError;
      }
      if (!admin) {
        await supabase.auth.signOut();
        setError("This account does not have admin access.");
        return;
      }

      const { data: factors, error: factorsError } =
        await supabase.auth.mfa.listFactors();
      if (factorsError) {
        throw factorsError;
      }

      const verifiedFactor = factors.totp.find(
        (item) => item.status === "verified"
      );

      if (verifiedFactor) {
        const { data: challenge, error: challengeError } =
          await supabase.auth.mfa.challenge({
            factorId: verifiedFactor.id,
          });
        if (challengeError) {
          throw challengeError;
        }

        setFactor({
          id: verifiedFactor.id,
          challengeId: challenge.id,
        });
        setStep("verify");
        return;
      }

      for (const pendingFactor of factors.totp) {
        if (pendingFactor.status === "unverified") {
          const { error: unenrollError } =
            await supabase.auth.mfa.unenroll({ factorId: pendingFactor.id });
          if (unenrollError) {
            throw unenrollError;
          }
        }
      }

      const { data: enrolledFactor, error: enrollError } =
        await supabase.auth.mfa.enroll({
          factorType: "totp",
          friendlyName: "Tech Insight Admin",
        });
      if (enrollError) {
        throw enrollError;
      }
      if (
        !enrolledFactor?.id ||
        !enrolledFactor.totp?.qr_code ||
        !enrolledFactor.totp.secret
      ) {
        throw new Error("Supabase did not return authenticator setup details.");
      }

      const { data: challenge, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId: enrolledFactor.id });
      if (challengeError) {
        throw challengeError;
      }

      setFactor({
        id: enrolledFactor.id,
        challengeId: challenge.id,
      });
      setQrCode(enrolledFactor.totp.qr_code);
      setSecret(enrolledFactor.totp.secret);
      setStep("enroll");
    } catch (loginError) {
      console.error("Admin login or MFA setup failed:", loginError);
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Unable to start secure admin sign-in."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCodeSubmit(event) {
    event.preventDefault();
    if (!factor) {
      setError("The authenticator challenge expired. Sign in again.");
      setStep("credentials");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: factor.id,
        challengeId: factor.challengeId,
        code: code.trim(),
      });
      if (verifyError) {
        throw verifyError;
      }

      const { data: assurance, error: assuranceError } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (assuranceError) {
        throw assuranceError;
      }
      if (assurance.currentLevel !== "aal2") {
        throw new Error(
          "Authenticator verification did not reach the required security level."
        );
      }

      navigate("/insight-vault576", { replace: true });
    } catch (verifyError) {
      console.error("Admin authenticator verification failed:", verifyError);
      setError(
        verifyError instanceof Error
          ? verifyError.message
          : "The authenticator code could not be verified. Try the current code from your app."
      );
    } finally {
      setLoading(false);
    }
  }

  async function cancelMfaStep() {
    setLoading(true);
    setError("");
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        throw signOutError;
      }
      setStep("credentials");
      setFactor(null);
      setQrCode("");
      setSecret("");
      setCode("");
      setPassword("");
    } catch (signOutError) {
      console.error("Could not end incomplete admin sign-in:", signOutError);
      setError(
        signOutError instanceof Error
          ? signOutError.message
          : "Could not safely end this sign-in."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login-page">
      <form
        className="admin-login-form"
        onSubmit={step === "credentials" ? handlePasswordSubmit : handleCodeSubmit}
      >
        <BrandLogo />
        <span className="admin-kicker">SECURE WORKSPACE</span>
        <h1>Tech Insight Admin</h1>
        <p>Admin Portal</p>

        {demoMode && (
          <div className="admin-auth-notice" role="status">
            Supabase is not configured. Admin access is disabled until a
            Supabase project with authenticator MFA is configured.
          </div>
        )}

        {error && <div className="admin-error" role="alert">{error}</div>}

        {step === "credentials" ? (
          <>
            <label htmlFor="admin-email">Email address</label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your admin email"
              autoComplete="username"
              required
              disabled={demoMode || loading}
            />

            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              disabled={demoMode || loading}
            />

            <button type="submit" disabled={demoMode || loading}>
              {loading ? "Verifying password..." : "Continue"}
            </button>
          </>
        ) : (
          <>
            {step === "enroll" ? (
              <div className="admin-mfa-setup">
                <h2>Set up your authenticator</h2>
                <p>
                  Scan this QR code with an authenticator app, then enter the
                  six-digit code it displays.
                </p>
                <img
                  className="admin-mfa-qr"
                  src={qrCode}
                  alt="Authenticator setup QR code"
                />
                <details>
                  <summary>Enter setup key manually</summary>
                  <code className="admin-mfa-secret">{secret}</code>
                </details>
              </div>
            ) : (
              <div className="admin-mfa-setup">
                <h2>Verify it’s you</h2>
                <p>Enter the current code from your authenticator app.</p>
              </div>
            )}

            <label htmlFor="admin-mfa-code">6-digit authenticator code</label>
            <input
              id="admin-mfa-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="000000"
              required
              disabled={loading}
            />

            <button type="submit" disabled={loading || code.length !== 6}>
              {loading
                ? "Verifying code..."
                : step === "enroll"
                  ? "Enable authenticator & sign in"
                  : "Verify & sign in"}
            </button>
            <button
              type="button"
              className="admin-login-cancel"
              onClick={cancelMfaStep}
              disabled={loading}
            >
              Cancel and sign out
            </button>
          </>
        )}
      </form>
    </div>
  );
}

export default AdminLogin;
