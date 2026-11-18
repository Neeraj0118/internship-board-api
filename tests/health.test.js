const http = require("http");
const app = require("../src/app");
const env = require("../src/config/env");

async function runHealthCheck() {
  console.log("=== Running InternSphere API Phase 1 Smoke Test ===");

  const testPort = 5055;
  const server = app.listen(testPort, async () => {
    console.log(`Test server running on port ${testPort}`);

    try {
      // 1. Test GET /health
      console.log("\n1. Testing GET /health...");
      const res1 = await fetch(`http://localhost:${testPort}/health`);
      const body1 = await res1.json();
      console.log(`Status: ${res1.status}`);
      console.log("Response:", JSON.stringify(body1, null, 2));

      if (res1.status !== 200 || body1.status !== "success" || body1.data.status !== "ok") {
        throw new Error("GET /health failed verification");
      }
      console.log("✅ GET /health PASSED");

      // 2. Test GET /api/v1/health
      console.log("\n2. Testing GET /api/v1/health...");
      const res2 = await fetch(`http://localhost:${testPort}/api/v1/health`);
      const body2 = await res2.json();
      if (res2.status !== 200 || body2.status !== "success") {
        throw new Error("GET /api/v1/health failed verification");
      }
      console.log("✅ GET /api/v1/health PASSED");

      // 3. Test 404 Route handling
      console.log("\n3. Testing 404 handler...");
      const res3 = await fetch(`http://localhost:${testPort}/unknown-route`);
      const body3 = await res3.json();
      if (res3.status !== 404 || body3.status !== "error") {
        throw new Error("404 handler failed verification");
      }
      console.log("✅ 404 handler PASSED");

      console.log("\n==================================================");
      console.log("🎉 ALL PHASE 1 HEALTH TESTS PASSED SUCCESSFULLY!");
      console.log("==================================================");

      server.close(() => {
        process.exit(0);
      });
    } catch (err) {
      console.error("❌ Test failed:", err);
      server.close(() => {
        process.exit(1);
      });
    }
  });
}

runHealthCheck();
