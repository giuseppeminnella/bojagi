import * as MemoryFS from 'memory-fs';
import * as webpack from 'webpack';
import getComponentsOfFolder from '../utils/getComponentsOfFolder';
import getWebpackConfig from '../utils/getWebpackConfig';
import getEntrypointsFromComponents from '../utils/getEntrypointsFromComponents';
import runWebpackCompiler from '../utils/runWebpackCompiler';
import withDefaultArguments from '../utils/withDefaultArguments';
import { BaseOptions } from '../baseCmd';
import createComponentsWithMetadata from '../utils/createComponentsWithMetadata';
import withSteps from '../utils/withSteps';
import withHelloGoodbye from '../utils/withHelloGoodbye';
import { getComponentCountText } from '../renderers/componentList';
import {
  writeComponent,
  writeSharedFile,
  writeJson,
  cleanTempFolder
} from '../utils/writeFile';

const outputFS = new MemoryFS();

require('util.promisify').shim();

export interface BundleCommandOptions extends BaseOptions {
  marker: string;
  markerPrefix: string;
  dir: string;
  steps: any;
}

export type ComponentExportDescription = {
  symbol: string;
  isDefaultExport: boolean;
};

export type EntrypointWithMetadata = {
  entrypoint: string;
  filePath: string;
  components: ComponentExportDescription[];
};

export type File = {
  name: string;
};

export type FileContent = {
  name: string;
  fileContent: string;
};

export type ComponentContent = {
  folder: string;
  fileContent: string;
};

export type ComponentWithMetadata = File & {
  symbol: string;
  isDefaultExport: boolean;
  filePath: string;
  exportName: string;
};

const FILES = ['commons'];

export const bundleAction = ({
  marker,
  markerPrefix,
  dir,
  steps
}: BundleCommandOptions) => {
  const executionPath = process.cwd();
  const projectWebpackConfig = require(`${executionPath}/webpack.config.js`);
  const entryFolder = `${executionPath}/${dir}`;
  const componentExtractStep = steps
    .advance('Figuring out what components to extract', 'mag')
    .start();
  return getComponentsOfFolder(entryFolder)
    .then(getEntrypointsFromComponents)
    .then(
      async (
        entrypointsWithMetadata: Record<string, EntrypointWithMetadata>
      ) => {
        const fileCount = Object.entries(entrypointsWithMetadata).length;
        if (fileCount === 0) {
          componentExtractStep.error('No components found', 'shrug');
          throw new Error(
            'No components found! Have you marked them correctly?'
          );
        }

        const componentCount = Object.values(entrypointsWithMetadata).reduce(
          (prev, current) => prev + current.components.length,
          0
        );

        componentExtractStep.success(
          getComponentCountText(componentCount, fileCount)
        );

        const entrypoints = Object.entries(entrypointsWithMetadata).reduce(
          (prev, [key, ep]) => ({
            ...prev,
            [key]: ep.entrypoint
          }),
          {}
        );
        const config = getWebpackConfig(
          entrypoints,
          projectWebpackConfig.resolve,
          projectWebpackConfig.module
        );

        const compiler = webpack(config);
        compiler.outputFileSystem = outputFS;

        const compileSteps = steps
          .advance('Compiling components', 'factory')
          .start();
        const compilerOutput = (await runWebpackCompiler({
          compiler,
          entrypoints
        })) as Record<string, string>;
        compileSteps.success('Components compiled', 'factory');

        const componentsWithMetadata = createComponentsWithMetadata(
          entrypointsWithMetadata,
          compilerOutput
        );
        const componentsMetadata = componentsWithMetadata.map(
          ({ fileContent, ...componentMetadata }) => componentMetadata
        );
        const files: File[] = FILES.map(name => ({
          name
        }));

        const fileContent: FileContent[] = FILES.map(name => ({
          name,
          fileContent: compilerOutput[name]
        }));

        await cleanTempFolder();

        await fileContent.map(async file => {
          await writeSharedFile(file);
        });
        await componentsWithMetadata.map(
          async ({ exportName, filePath, fileContent }) => {
            await writeComponent({ exportName, filePath, fileContent });
          }
        );

        await writeJson('files', files);
        await writeJson('components', componentsMetadata);

        return {
          files,
          components: componentsWithMetadata
        };
      }
    );
};

const bundle = program => {
  program
    .command('bundle')
    .option('-d, --dir [dir]', 'The root folder to search components in')
    .description('bundles your marked components (does not upload to Bojagi)')
    .action(withSteps(2)(withHelloGoodbye(withDefaultArguments(bundleAction))));
};

export default bundle;