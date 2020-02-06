import { getWebpackConfigPath } from './utils/getWebpackConfig';
import { Config } from './config';

const COLLECTOR_MAIN_NAME = '@bojagi/collector-main';

const defaultConfig: Config = {
  componentMarker: '@component',
  dir: 'src',
  webpackConfig: getWebpackConfigPath(process.cwd()),
  executionPath: process.cwd(),
  decoratorPath: '.bojagi/decorator.@(tsx|ts|jsx|js)',
  storyPath: 'src/**/*.bojagi.@(tsx|ts|jsx|js)',
  uploadApiUrl: process.env.BOJAGI_API_URL || 'https://upload.bojagi.io',
  collectors: [COLLECTOR_MAIN_NAME],
};

export default defaultConfig;
