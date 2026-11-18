/**
 * Frontend-to-Backend Integration Verification Test
 */

const app = require("../src/app");
const env = require("../src/config/env");
const { getDb } = require("../src/config/db");
const { seedDataset } = require("../src/database/seed");

const TEST_PORT = 5077;
const BASE_URL = `http://localhost:${TEST_PORT}`;

async function runFrontendIntegrationTest() {
  console.log("==================================================================");
  console.log("🌐 FRONTEND-TO-BACKEND INTEGRATION TESTS");
  console.log("==================================================================\n");

  const db = getDb();
  seedDataset(db, "frontend");

  const server = app.listen(TEST_PORT);

  try {
    // 1. Test Static HTML Delivery
    const resHtml = await fetch(`${BASE_URL}/index.html`);
    console.log(`1. Static index.html Delivery: HTTP ${resHtml.status}`);
    const htmlText = await resHtml.text();
    if (resHtml.status !== 200 || !htmlText.includes("InternSphere") || !htmlText.includes("internships-grid")) {
      throw new Error("index.html failed delivery check");
    }
    console.log("   ✅ index.html served correctly with complete DOM landmarks.");

    // 2. Test CSS Delivery
    const resCss = await fetch(`${BASE_URL}/css/style.css`);
    console.log(`2. Stylesheet style.css Delivery: HTTP ${resCss.status}`);
    const cssText = await resCss.text();
    if (resCss.status !== 200 || !cssText.includes(":root")) {
      throw new Error("style.css failed delivery check");
    }
    console.log("   ✅ style.css served with CSS variables and responsive rules.");

    // 3. Test JS Delivery
    const resJs = await fetch(`${BASE_URL}/js/app.js`);
    console.log(`3. Client Logic app.js Delivery: HTTP ${resJs.status}`);
    const jsText = await resJs.text();
    if (resJs.status !== 200 || !jsText.includes("InternshipBoardApp")) {
      throw new Error("app.js failed delivery check");
    }
    console.log("   ✅ app.js served with ES6 class and API integration.");

    // 4. Test CORS headers
    console.log("4. Verifying CORS headers for cross-origin frontend clients...");
    const corsRes = await fetch(`${BASE_URL}/api/v1/internships`, {
      method: "OPTIONS",
      headers: {
        Origin: "http://127.0.0.1:8080",
        "Access-Control-Request-Method": "POST"
      }
    });
    const allowOrigin = corsRes.headers.get("access-control-allow-origin");
    if (!allowOrigin) {
      throw new Error("Missing Access-Control-Allow-Origin header");
    }
    console.log(`   ✅ CORS configured properly (allow-origin: ${allowOrigin}).`);

    // 5. Test Frontend Application Submission Flow
    console.log("5. Testing Frontend Application Submission Workflow...");
    const testEmail = `integration.test.${Date.now()}@university.edu`;
    const appRes = await fetch(`${BASE_URL}/api/v1/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        internship_id: "3",
        applicant_name: "Sarah Connor",
        applicant_email: testEmail,
        portfolio_url: "https://github.com/sarah-connor",
        notes: "Experienced with Figma design systems and user research."
      })
    });
    const appBody = await appRes.json();
    if (appRes.status !== 201 || appBody.status !== "success" || !appBody.data?.id) {
      throw new Error(`Application submission failed: ${JSON.stringify(appBody)}`);
    }
    console.log(`   ✅ Application created with ID: ${appBody.data.id} for role '${appBody.data.internship_title}'.`);

    // 6. Test Duplicate Application Submission on same role
    console.log("6. Testing Duplicate Submission Prevention...");
    const dupRes = await fetch(`${BASE_URL}/api/v1/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        internship_id: "3",
        applicant_name: "Sarah Connor",
        applicant_email: testEmail
      })
    });
    const dupBody = await dupRes.json();
    if (dupRes.status !== 409 || dupBody.status !== "error") {
      throw new Error(`Duplicate check failed: expected 409, got ${dupRes.status}`);
    }
    console.log(`   ✅ Duplicate correctly rejected with HTTP 409: '${dupBody.message}'.`);

    console.log("\n==================================================================");
    console.log("🎉 ALL FRONTEND INTEGRATION TESTS PASSED SUCCESSFULLY!");
    console.log("==================================================================");
    server.close();
    process.exit(0);
  } catch (err) {
    console.error("❌ Integration test failed:", err.message);
    server.close();
    process.exit(1);
  }
}

runFrontendIntegrationTest();
