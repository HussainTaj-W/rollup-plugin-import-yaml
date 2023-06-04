const yaml = require("js-yaml");

const { generateTypeFile } = require("./utils");

/**
 * @typedef {Object} Options
 * @property {boolean} [isTS=false] - Generate type file.
 * @property {string} [encoding="utf8"] - Encoding of the type file.
 */
function importYaml({ isTS = false, encoding = "utf8", exclude } = {}) {
  return {
    name: "rollup-plugin-import-yaml",

    transform(code, id) {
      if (id.endsWith(".yaml") || id.endsWith(".yml")) {
        const data = yaml.load(code);
        const result = `const data = ${JSON.stringify(
          data,
          null,
          2
        )};\nexport default data;\n`;

        if (isTS) {
          generateTypeFile(data, id, encoding);
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
