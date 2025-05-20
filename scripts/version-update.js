const fs = require("fs");
const path = require("path");

// Get version from package.json
const packageJson = require("../package.json");
const version = packageJson.version;

// Update version in the source file
const sourceFile = path.join(__dirname, "../src/insanelink.js");
let content = fs.readFileSync(sourceFile, "utf8");

// Replace version comment
content = content.replace(
  /InsaneLink Tracking Script v[\d\.]+/,
  `InsaneLink Tracking Script v${version}`
);

fs.writeFileSync(sourceFile, content, "utf8");
console.log(`Updated version to ${version} in source file`);
