#!/usr/bin/env node

const glob = require("glob");
const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const chalk = require("chalk");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const t = require("@babel/types");
const readline = require("readline");

// Use yargs to parse command-line arguments
const argv = yargs(hideBin(process.argv)).argv;

// Load configuration
const configPath = argv.config;
if (!configPath) {
  console.error(chalk.red(`Please provide a config file path`));
  process.exit(1);
}

const configFilePath = path.resolve(process.cwd(), configPath);

if (!fs.existsSync(configFilePath)) {
  console.error(chalk.red(`Error loading configuration file ${configPath}`));
  process.exit(1);
}

let config;

try {
  config = require(configFilePath);
} catch (err) {
  console.error(
    chalk.red(`Error loading configuration file ${configPath}: ${err.message}`)
  );
  process.exit(1);
}

const directoryToCheck = config.directoryToCheck || "src";
const testIdAttributes = config.testIdAttributes || ["testID"];
const extensions = config.extensions || "js,jsx,tsx,ts";
const outputFormat = config.outputFormat || "text";
const excludePattern = config.excludePattern || "";
const dynamicTestIdFunction = config.dynamicTestIdFunction || "getTestID";

const nonInteractiveElements = new Set(config.nonInteractiveElements);
const internalElementPattern = new RegExp(config.internalElementPattern);
const interactiveElements = new Set(config.interactiveElements);
const autoFix = config.autoFix || false;

const colors = config.colors || {
  componentName: "red",
  lineNumber: "blue",
  fileLocation: "green",
  attributeName: "yellow",
  totalMissing: "magenta",
};

const globPattern = `${directoryToCheck}/**/*.{${extensions
  .split(",")
  .join(",")}}`;

let missingTestIdCount = 0;
const filesToFix = new Map();

function logWarning(elementName, filePath, lineNumber, missingAttributes) {
  const coloredComponentName = chalk[colors.componentName](elementName);
  const coloredFileLocation = chalk[colors.fileLocation](filePath);
  const coloredLineNumber = chalk[colors.lineNumber](lineNumber);
  const coloredAttributeName = chalk[colors.attributeName](
    missingAttributes.join(", ")
  );

  const coloredMessage = chalk.yellow.bold(
    `Warning: <${coloredComponentName}> in ${coloredFileLocation} at line ${coloredLineNumber} does not have ${coloredAttributeName} attributes.`
  );
  const JSONMessage = `No ${missingAttributes.join(", ")} attribute`;

  if (outputFormat === "json") {
    console.log(
      JSON.stringify({ elementName, filePath, lineNumber, JSONMessage })
    );
  } else {
    console.log(coloredMessage);
  }
}

function checkTestIdInFile(filePath) {
  try {
    const code = fs.readFileSync(filePath, "utf-8");
    const ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
      allowImportExportEverywhere: true,
      allowAwaitOutsideFunction: true,
    });

    let fileChanged = false;

    traverse(ast, {
      JSXOpeningElement(path) {
        const elementName = path.node.name.name;

        if (nonInteractiveElements.has(elementName)) return;
        if (internalElementPattern.test(elementName)) return;
        if (!interactiveElements.has(elementName)) return;

        const attributes = path.node.attributes;
        const missingAttributes = testIdAttributes.filter((attr) => {
          const hasTestId = attributes.some(
            (attribute) =>
              attribute.type === "JSXAttribute" && attribute.name.name === attr
          );

          const hasDynamicTestId = attributes.some((attribute) => {
            if (attribute.type === "JSXSpreadAttribute") {
              const argument = attribute.argument;
              if (
                argument.callee &&
                argument.callee.type === "Identifier" &&
                argument.callee.name === dynamicTestIdFunction
              ) {
                return true;
              }
            }
            return false;
          });

          if (autoFix && !hasTestId && !hasDynamicTestId) {
            const testID = t.jsxAttribute(
              t.jsxIdentifier(attr),
              t.stringLiteral(
                `test-id-${Math.random().toString(36).substring(7)}`
              )
            );
            path.node.attributes.push(testID);
            fileChanged = true;
          }

          return !(hasTestId || hasDynamicTestId);
        });

        if (missingAttributes.length > 0) {
          const lineNumber = path.node.loc.start.line;
          missingTestIdCount++;
          logWarning(elementName, filePath, lineNumber, missingAttributes);
        }
      },
    });

    if (fileChanged) {
      const newCode = generateCodeFromAST(ast);
      filesToFix.set(filePath, newCode);
    }
  } catch (err) {
    console.error(chalk.red(`Error parsing file ${filePath}: ${err.message}`));
  }
}

function generateCodeFromAST(ast) {
  const generate = require("@babel/generator").default;
  const output = generate(ast, { retainLines: true });
  return output.code;
}

function checkTestIdsInDirectory(directoryPath) {
  glob(globPattern, { ignore: excludePattern }, (err, files) => {
    if (err) {
      console.error(chalk.red("Error finding files:", err));
      return;
    }

    files.forEach((file) => {
      checkTestIdInFile(file);
    });

    if (autoFix && filesToFix.size > 0) {
      promptUserForFix();
    }
  });
}

function promptUserForFix() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  console.log("\n");
  rl.question(
    chalk.green.bold(
      "Do you want to automatically fix the missing testID attributes? (yes/no) "
    ),
    (answer) => {
      if (answer.toLowerCase() === "yes") {
        filesToFix.forEach((newCode, filePath) => {
          fs.writeFileSync(filePath, newCode);
          console.log(chalk.green.bold(`Fixed ${filePath}`));
        });
        console.log("\n");
        console.log(
          chalk.green.bold(
            "✨ All missing testID attributes have been fixed! ✨"
          )
        );
        missingTestIdCount = 0;
        process.exit(0);
      } else {
        console.log(chalk.yellow.bold("No changes were made."));
      }
      rl.close();
    }
  );
}

process.on("exit", () => {
  if (missingTestIdCount === 0) {
    console.log(
      chalk.green.bold("✨ All components have testID attributes added! ✨")
    );
    process.exit(0);
  } else {
    console.log("\n");
    console.log(
      chalk[colors.totalMissing](
        `Total elements missing ${testIdAttributes.join(
          ", "
        )}: ${missingTestIdCount}`
      )
    );
    console.log("\n");
  }
});

checkTestIdsInDirectory(directoryToCheck);
