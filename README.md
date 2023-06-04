# rollup-plugin-import-yaml

Import YAML files into code as JS or TS objects. For TS, types for each YAML file is generated dynamically.

## Usage

### Add Dependency

```bash
npm i -D rollup-plugin-import-yaml
```

### (Javascript) Configure Plugin

```js
import importYaml from "vite-plugin-import-yaml";

export default defineConfig(({ mode }) => {
  return {
    plugins: [importYaml()],
  };
});
```

### (Typescript) Configure Plugin

For typescript, type declarations are generated for each YAML file and added to `<filename>.yml.d.ts` file.

#### vite.config.ts

```ts
import importYaml from "vite-plugin-import-yaml";

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      importYaml({
        isTS: true,
      }),
    ],
  };
});
```

#### tsconfig.json

```json
{
  "compilerOptions": {
    "types": ["vite-plugin-import-yaml/src/types"]
  }
}
```

### CLI / Generating Types Separately / Existing Projects

If you need to generate types manually for some reason (like integrating this plugin into an existing project), you can run the `yml-def-gen` cli command.

#### Install Dependency Globally

```bash
npm i -g rollup-plugin-import-yaml
```

Then in your project directory run.

```bash
yml-def-gen
```
