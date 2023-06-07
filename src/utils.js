const yaml = require("js-yaml");
const fs = require("fs");

const { followReferences } = require("./references");

/**
 * Generate TypeScript declaration from data.
 *
 * @param {any} data
 * @param {string} [indent=""]
 * @returns {string}
 * @example
 * generateTypeScriptDeclaration({ a: 1, b: "2" });
 * //=> "{ a: number; b: string; }"
 *
 * generateTypeScriptDeclaration({ a: 1, b: "2", c: { d: true } });
 * //=> "{ a: number; b: string; c: { d: boolean; }; }"
 */
function generateTypeScriptDeclaration(data, indent = "") {
  let declaration = "";

  if (typeof data === "undefined") {
    declaration += "undefined";
  } else if (data === null) {
    declaration += "null";
  } else if (typeof data === "object" && !Array.isArray(data)) {
    declaration += `{\n`;

    for (const key in data) {
      declaration += `${indent}  ${key}: ${generateTypeScriptDeclaration(
        data[key],
        indent + "  "
      )};\n`;
    }

    declaration += `${indent}}`;
  } else if (Array.isArray(data)) {
    if (data.length > 0) {
      const itemDeclarations = data.map((item) =>
        generateTypeScriptDeclaration(item, indent)
      );
      const uniqueDeclarations = [...new Set(itemDeclarations)];

      if (uniqueDeclarations.length === 1) {
        declaration += `${uniqueDeclarations[0]}[]`;
      } else {
        declaration += "(" + uniqueDeclarations.join(" | ") + ")[]";
      }
    } else {
      declaration += "any[]";
    }
  } else if (typeof data === "string") {
    declaration += "string";
  } else if (typeof data === "number") {
    declaration += "number";
  } else if (typeof data === "boolean") {
    declaration += "boolean";
  } else {
    declaration += "any";
  }

  return declaration;
}

/**
 * Generate type file from data.
 *
 * @param {any} data
 * @param {string} sourceFile
 * @param {string} [encoding="utf8"]
 * @example
 * generateTypeFile({ a: 1, b: "2" }, "data.yaml");
 * //=> data.yaml.d.ts
 * //=> declare const data: { a: number; b: string; };
 * //=> export default data;
 */
function generateTypeFile(data, sourceFile, encoding = "utf8") {
  const declaration = generateTypeScriptDeclaration(data);
  const declarationFileContent = `declare const data: ${declaration};\nexport default data;\n`;
  const declarationFileName = `${sourceFile}.d.ts`;
  fs.writeFileSync(declarationFileName, declarationFileContent, encoding);
}

/**
 * Generate type file from yaml file.
 *
 * @param {string} yamlFile
 * @param {string} [encoding="utf8"]
 * @param {boolean} [shouldFollowReferences=false]
 * @example
 * generateTypeFileFromYamlFile("data.yaml");
 * //=> data.yaml.d.ts
 * //=> declare const data: { a: number; b: string; };
 * //=> export default data;
 */
function generateTypeFileFromYamlFile(
  yamlFile,
  encoding = "utf8",
  shouldFollowReferences = false,
  root = "./"
) {
  let data = fs.readFileSync(yamlFile, encoding);
  if (shouldFollowReferences) {
    const { yamlData } = followReferences({ yamlData: data, encoding, root });
    data = yamlData;
  }
  data = yaml.load(data);
  generateTypeFile(data, yamlFile, encoding);
}

module.exports = {
  generateTypeScriptDeclaration,
  generateTypeFile,
  generateTypeFileFromYamlFile,
};
