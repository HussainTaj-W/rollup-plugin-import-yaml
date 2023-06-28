const yaml = require("js-yaml");

const { generateTypeFile, saveGeneratedYamlFile } = require("./utils");
const { followReferences } = require("./references");

/**
 * @typedef {Object} Options
 * @property {boolean} [isTS=false] - Generate type file.
 * @property {string} [encoding="utf8"] - Encoding of the type file.
 * @property {boolean} [shouldFollowReferences=false] - Enable reference following of YAML files.
 * @property {string} [root="./"] - Root directory of the project.
 */
function importYaml({
  isTS = false,
  encoding = "utf8",
  shouldFollowReferences = false,
  root = "./",
  exportResult = false,
} = {}) {
  return {
    name: "rollup-plugin-import-yaml",

    transform(code, id) {
      if (id.endsWith(".yaml") || id.endsWith(".yml")) {
        let transformedCode = code;
        if (shouldFollowReferences) {
          const { yamlData, referredFiles } = followReferences({
            yamlData: code,
            encoding,
            root,
          });
          transformedCode = yamlData;

          for (const file of referredFiles) {
            this.addWatchFile(file);
          }
        }
        const data = yaml.load(transformedCode);
        const result = `const data = ${JSON.stringify(
          data,
          null,
          2
        )};\nexport default data;\n`;

        if (isTS) {
          generateTypeFile(data, id, encoding);
        }

        if (shouldFollowReferences && exportResult) {
          saveGeneratedYamlFile(id, transformedCode, encoding);
        }

        return {
          code: result,
          map: null,
        };
      }
    },
  };
}

module.exports = importYaml;
