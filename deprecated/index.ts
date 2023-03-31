import path from 'node:path';
import postcss from 'postcss';
import type { Plugin, SourceDescription, SourceMapInput, TransformResult } from 'rollup';
import type { Result } from 'postcss';
import postcssConfig from 'postcss-load-config';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { normalizePath } from '@rollup/pluginutils';

const pluginTailwindcss = ({ outputDir }: { outputDir: string } = { outputDir: '' }): Plugin => {
  // const cssFiles: { [key: string]: Result } = {};
  const cssFiles: Record<string, Result> = {};

  return {
    name: 'rollup-plugin-tailwindcss',
    options(options) {
      console.log('options', options);
    },
    buildStart(options) {
      console.log('buildStart', options);
    },
    // resolveId(...options) {
    //   console.log('resolveId', options);
    // },
    async transform(code, id): Promise<TransformResult> {
      if (id.endsWith('.css')) {
        // console.log('getCombinedSourcemap', this.getCombinedSourcemap());
        // console.log('id', id);
        // console.log('getFileName', this.getFileName('index.css'));
        // const toPatch = path.resolve(process.cwd(), options.dir!, outputMapFilePath);
        // console.log('toPatch', toPatch);
        const config = await postcssConfig();
        // const result = await postcss(config.plugins).process(code, { from: id, to: id, map: { inline: false } });
        const fileName = path.basename(id);
        // const mapFileName = `${fileName}.map`;
        // const newName = path.resolve('D:/Rollup/rollup-lit/dist/css', fileName);
        const toPath = path.resolve(process.cwd(), 'build', outputDir, fileName);
        console.log('toPath', toPath);
        // console.log('newName', newName);

        const result = await postcss(config.plugins).process(code, {
          from: id,
          to: toPath,
          map: { inline: false },
        });
        cssFiles[id] = result;

        return {
          code: `export default ${JSON.stringify(result.css)};`,
          // map: <SourceMapInput>result.map.toJSON(),
          map: result.map.toString(),
        };
      }

      return null;
    },
    // outputOptions(options) {
    //   console.log('outputOptions', options);
    // },
    // renderStart(outputOpt, inputOpt) {
    //   console.log('outputOpt', outputOpt);
    //   console.log('inputOpt', inputOpt);
    // },
    // renderChunk(code, chunk, options) {
    //   console.log('renderChunk:chunk', chunk);
    //   console.log('renderChunk:options', options);
    // },
    async generateBundle(options, bundle) {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      // D:\Rollup\rollup-plugin-tailwindcss-lit\dist

      // console.log('__dirname', __dirname);
      // console.log('process', process.cwd());
      // D:\Rollup\rollup-lit

      // const build = path.resolve(process.cwd(), options.dir!);
      // console.log('build', build);

      // console.log('options', options.dir);
      // console.log('cssFiles', cssFiles);
      for (const [id, result] of Object.entries(cssFiles)) {
        const fileName = path.basename(id);
        const mapFileName = `${fileName}.map`;
        const outputFilePath = path.join(outputDir, fileName);
        const outputMapFilePath = path.join(outputDir, mapFileName);
        // console.log('outputMapFilePath', outputMapFilePath);
        // outputMapFilePath css\index.css.map

        // console.log('result.map', result.map.toJSON().file);
        // const build = path.resolve(process.cwd(), options.dir!, outputMapFilePath);
        // console.log('build', JSON.stringify(build));
        // console.log('id', JSON.stringify(id));
        // const mapJson = result.map.toJSON();
        // const relpath = path.relative(build, id);
        // console.log('relpath:', normalizePath(relpath));
        // id, D:\Rollup\rollup-lit\src\index.css
        //     D:\Rollup\rollup-lit\build\css\index.css.map
        // ..\..\..\src\b.css
        // console.log('outputMapFilePath', JSON.stringify(outputMapFilePath));
        // console.log('outputFilePath', JSON.stringify(outputFilePath));
        // console.log(1111, JSON.stringify(path.relative(outputMapFilePath, outputFilePath)));
        // mapJson.sources = [normalizePath(relpath)];
        // mapJson.file = outputFilePath;

        // console.log('mapJson', mapJson);
        // console.log('id', id);
        // console.log('dirname', path.dirname(id));
        // console.log('outputFilePath', outputFilePath);
        // console.log('path', path.relative(path.dirname(id), outputFilePath));

        // console.log('result.opts.to', normalizePath(<string>result.opts.to));
        // this.emitFile({
        //   type: 'asset',
        //   // fileName: outputFilePath,
        //   fileName: normalizePath(<string>result.opts.to),
        //   source: result.css,
        // });

        // this.emitFile({
        //   type: 'asset',
        //   fileName: <string>result.opts.to + '.map',
        //   // source: JSON.stringify(mapJson),
        //   source: result.map.toString(),
        // });
      }
    },
  };
};

export default pluginTailwindcss;


// `export default ${JSON.stringify(csstxt)};`,
// map: result.map as unknown as SourceMapInput,
