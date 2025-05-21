// scripts/build.js
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Ensure dist directory exists
const distDir = path.join(__dirname, "../dist");
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy source file to dist
const srcFile = path.join(__dirname, "../src/insanelink.js");
const distFile = path.join(distDir, "insanelink.js");
fs.copyFileSync(srcFile, distFile);

console.log("Copied src/insanelink.js to dist/insanelink.js");

// Run terser for minification
try {
  console.log("Minifying with Terser...");
  execSync(
    "npx terser src/insanelink.js -o dist/insanelink.min.js --compress --mangle --comments /InsaneLink/",
    { stdio: "inherit" }
  );
  console.log("Successfully created dist/insanelink.min.js");
} catch (error) {
  console.error("Error during minification:", error.message);
  process.exit(1);
}
