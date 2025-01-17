import * as pathUtils from 'path';
import { StoryWithMetadata } from '../types';
import composeWebpackConfig from './composeWebpackConfig';
import glob from './glob';
import { Config } from '../config';

import webpack = require('webpack');

export type GetWebpackConfigOptions = {
  config: Config;
  storyFiles: StoryWithMetadata[];
  publicPath?: string;
};

export type GetWebpackConfigOutput = {
  entrypoints: Record<string, string>;
  webpackConfig: webpack.Configuration;
};

async function buildProjectWebpackConfig(projectWebpackConfig) {
  return typeof projectWebpackConfig === 'function'
    ? projectWebpackConfig('development') // TODO read from args etc
    : projectWebpackConfig;
}

export async function getWebpackConfig({
  config,
  storyFiles,
  publicPath,
}: GetWebpackConfigOptions): Promise<GetWebpackConfigOutput> {
  const projectWebpackConfig = require(config.webpackConfig);
  const processedProjectConfig = await buildProjectWebpackConfig(projectWebpackConfig);

  const decoratorFiles = await glob(config.decoratorPath, { cwd: config.executionPath });
  const decoratorFileArray =
    decoratorFiles.length > 0 ? [pathUtils.resolve(config.executionPath, decoratorFiles[0])] : [];

  const entrypoints = storyFiles.reduce(
    (prev, storyFile) => ({
      ...prev,
      [storyFile.fileName]: [storyFile.entrypoint, ...decoratorFileArray],
    }),
    {}
  );

  const webpackConfig = composeWebpackConfig(
    processedProjectConfig,
    entrypoints,
    config.executionPath,
    decoratorFileArray[0],
    publicPath
  );

  return {
    entrypoints,
    webpackConfig,
  };
}
