#! /usr/bin/env node

const path = require("path");
const glob = require("glob");

const { generateTypeFileFromYamlFile } = require("../utils");

/**
 * Find all yaml files in a directory.
 *
 * @param {string} directory
 * @param {RegExp[]} exclude
 * @returns {string[]}
 * @example
 * findYamlFiles(".", [/node_modules/]);
 * //=> ["./src/data.yaml", "./src/data2.yaml"]
 *
 * findYamlFiles("src", [/node_modules/]);
 * //=> ["./src/data.yaml", "./src/data2.yaml"]
 */
function findYamlFiles(directory = ".", exclude = [/node_modules/]) {
  const excludePatterns = exclude.map((pattern) => new RegExp(pattern));

  const isExcluded = (filePath) => {
    return excludePatterns.some((pattern) => pattern.test(filePath));
  };

  const searchFiles = (dir) => {
    const files = glob.sync("**/*.{yaml,yml}", { cwd: dir });
    const filteredFiles = files.filter((file) => !isExcluded(file));
    const filePaths = filteredFiles.map((file) => path.join(dir, file));
    return filePaths;
  };

  return searchFiles(directory);
}

function main() {
  const directory = process.argv[2] || ".";
  const exclude = process.argv[3] ? process.argv[3].split(",") : [];

  const yamlFiles = findYamlFiles(directory, exclude);

  for (const yamlFile of yamlFiles) {
    console.log(`Generating type file for ${yamlFile}`);
    generateTypeFileFromYamlFile(yamlFile);
  }
}

main();
