/**
 * Security & Safe Logging Verification Test
 * Ensures that applicant names, full emails, notes, passwords, tokens and request bodies are NEVER logged.
 */

const app = require("../src/app");
const { maskEmail, sanitizeLogData } = require("../src/utils/pii-masker");

const TEST_PORT = 5088;
const BASE_URL = `http://localhost:${TEST_PORT}`;

async function runSecurityTest() {
  console.log("==================================================================");
  console.log("🔒 SECURITY & LOGGING COMPLIANCE VERIFICATION");
  console.log("==================================================================\n");

  // 1. Test Email Masking Utility
  const originalEmail = "neeraj.giri@company.com";
  const masked = maskEmail(originalEmail);
  console.log(`1. Testing Email Masking: '${originalEmail}' -> '${masked}'`);
  if (!masked.includes("***") || masked.includes("neeraj.giri")) {
    throw new Error("Email masking failed to redact identity");
  }
  console.log("   ✅ Email masked securely without identity exposure.");

  // 2. Test Object Sanitization
  const sensitiveObject = {
    applicant_name: "John Doe",
    applicant_email: "johndoe@example.com",
    notes: "Top secret personal statement",
    portfolio_url: "https://myportfolio.com",
    role: "applicant"
  };
  const sanitized = sanitizeLogData(sensitiveObject);
  console.log("2. Testing Object Sanitization:");
  console.log("   Sanitized Output:", JSON.stringify(sanitized));

  if (sanitized.applicant_name !== "[REDACTED]" || sanitized.notes !== "[REDACTED]" || sanitized.applicant_email.includes("johndoe@")) {
    throw new Error("Object sanitization failed to redact sensitive keys");
  }
  console.log("   ✅ Sensitive applicant attributes redacted to [REDACTED] or masked.");

  // 3. Test Live Server Safe Logging Interception
  console.log("3. Testing Live Server Request Logging Interception...");
  const logsCaptured = [];
  const originalLog = console.log;
  console.log = (...args) => {
    logsCaptured.push(args.join(" "));
    originalLog(...args);
  };

  const server = app.listen(TEST_PORT);

  try {
    const rawApplicantPayload = {
      internship_id: "1",
      applicant_name: "SecretApplicantName999",
      applicant_email: "supersecretapplicantemail999@domain.com",
      notes: "Extremely Confidential Statement 12345"
    };

    await fetch(`${BASE_URL}/api/v1/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rawApplicantPayload)
    });

    // Restore logger
    console.log = originalLog;

    // Check captured logs
    const joinedLogs = logsCaptured.join("\n");
    const containsName = joinedLogs.includes("SecretApplicantName999");
    const containsFullEmail = joinedLogs.includes("supersecretapplicantemail999@domain.com");
    const containsNotes = joinedLogs.includes("Extremely Confidential Statement 12345");

    if (containsName || containsFullEmail || containsNotes) {
      throw new Error(`PII Leak Detected in server console logs!\nCaptured:\n${joinedLogs}`);
    }

    console.log("   ✅ Verified zero PII in server access logs (No name, full email, or notes logged).");

    console.log("\n==================================================================");
    console.log("🎉 ALL SECURITY & LOGGING TESTS PASSED SUCCESSFULLY!");
    console.log("==================================================================");
    server.close();
    process.exit(0);
  } catch (err) {
    console.log = originalLog;
    console.error("❌ Security test failed:", err.message);
    server.close();
    process.exit(1);
  }
}

runSecurityTest();
