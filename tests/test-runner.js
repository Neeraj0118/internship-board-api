const { fork } = require("child_process");
const path = require("path");

const testFiles = [
  "run-all-tests.js",
  "frontend-integration.test.js",
  "security-and-logging.test.js"
];

function runTest(file) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, file);
    console.log(`\n>>> Executing Test Suite: ${file}...`);
    const child = fork(filePath, [], { stdio: "inherit" });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Test suite ${file} failed with exit code ${code}`));
      }
    });
  });
}

async function runAll() {
  console.log("==================================================================");
  console.log("🚀 INTERNSPHERE MASTER TEST RUNNER");
  console.log("==================================================================");

  const startTime = Date.now();
  for (const file of testFiles) {
    try {
      await runTest(file);
    } catch (err) {
      console.error(`\n❌ Execution halted: ${err.message}`);
      process.exit(1);
    }
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log("\n==================================================================");
  console.log(`🎉 ALL TEST SUITES COMPLETED SUCCESSFULLY IN ${durationSec}s!`);
  console.log("==================================================================");
  process.exit(0);
}

runAll();
