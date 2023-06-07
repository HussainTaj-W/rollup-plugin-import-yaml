const fs = require("fs");
const path = require("path");

/**
 * Follow references in YAML files.
 *
 * @param {Object} options
 * @param {string} options.yamlData - YAML data.
 * @param {string} [options.encoding="utf8"] - Encoding of the type file.
 * @param {string} [options.root="./"] - Root directory of the project.
 * @returns {Object} - YAML data and referred files.
 * @example
 * const { yamlData, referredFiles } = followReferences({
 *   yamlData: "a: 1\nb: {{ include ./data.yaml }}",
 *   encoding: "utf8",
 *   root: "./"
 * });
 * //=> yamlData: "a: 1\nb: c: 2\nd: 3"
 * //=> referredFiles: ["./data.yaml"]
 *
 */
function followReferences({ yamlData, encoding = "utf8", root = "./" } = {}) {
  const regex = /^\s*.*{{ include .+ }}/gm;
  const matches = yamlData.match(regex);

  let referredFiles = [];

  if (matches) {
    for (const match of matches) {
      const includeTagMatch = match.match(/{{ include (.+) }}/);
      let referredFile = includeTagMatch[1];
      if (!referredFile) {
        throw new Error("Include statement must have a path");
      } else {
        referredFile = path.resolve(root, referredFile);
      }

      referredFiles.push(referredFile);

      const includeData = fs.readFileSync(referredFile, encoding);
      const { yamlData: includedYAML, referredFiles: includedReferredFiles } =
        followReferences({ yamlData: includeData, encoding, root });
      const indentation = " ".repeat(includeTagMatch.index);
      const indentedIncludedYAML = includedYAML
        .split("\n")
        .map((line, index) => (index === 0 ? line : indentation + line))
        .join("\n");

      yamlData = yamlData.replace(includeTagMatch[0], indentedIncludedYAML);
      referredFiles = referredFiles.concat(includedReferredFiles);
    }
  }

  return { yamlData, referredFiles };
}

module.exports = {
  followReferences,
};
