import * as React from 'react';
import * as pathUtils from 'path';

import { Config } from '../../config';
import { getWebpackConfig } from '../../utils/getWebpackConfig';
import { setupApi } from './setupApi';
import { StoryCollectionMetadata } from '../../steps/analyze';
import { StoryWithMetadata } from '../../types';

import webpack = require('webpack');

export type UseWebpackDevServerOptions = {
  config: Config;
  storyFiles?: StoryWithMetadata[];
  storiesMetadata?: Record<string, StoryCollectionMetadata>;
};

export type UseWebpackDevServerOutput = {
  devServer?: any;
  ready: boolean;
  established: boolean;
  errors: Error[];
  setupError: Error | null;
};

export function useWebpackDevServer({
  config,
  storiesMetadata,
  storyFiles,
}: UseWebpackDevServerOptions): UseWebpackDevServerOutput {
  const [devServer, setDevServer] = React.useState<any>();
  const [compiler, setCompiler] = React.useState<webpack.Compiler>();
  const [ready, setReady] = React.useState(false);
  const [errors, setErrors] = React.useState<Error[]>([]);
  const [setupError, setSetupError] = React.useState<Error | null>(null);
  const [established, setEstablished] = React.useState(false);
  const baseUrl = `http://localhost:${config.previewPort}`;

  // Setup dev server
  React.useEffect(() => {
    if (storyFiles && storiesMetadata && !established) {
      getWebpackConfig({
        config,
        storyFiles,
        publicPath: `${baseUrl}/`,
      }).then(({ webpackConfig }) => {
        setCompiler(webpack(webpackConfig));
      });
    }
  }, [config, baseUrl, storiesMetadata, storyFiles, established]);

  React.useEffect(() => {
    let assets;
    let files;

    if (!storiesMetadata || !compiler) {
      return;
    }

    if (!established) {
      compiler.hooks.beforeCompile.tap('BojagiPreview', () => {
        setReady(false);
        setErrors([]);
      });

      compiler.hooks.done.tap('BojagiPreview', compileOutput => {
        setEstablished(true);
        setErrors(compileOutput.compilation.errors);
        files = Object.keys(compileOutput.compilation.assets).map(asset => ({
          name: asset,
          url: `${baseUrl}/${asset}`,
        }));
        assets = Array.from(compileOutput.compilation.entrypoints.entries())
          .map(([key, val]) => [key, val.getFiles()])
          .reduce((acc, [key, val]) => ({ ...acc, [key]: val }), {});
        setReady(true);
      });

      try {
        // dynamic require so we can use all other cli commands without having webpack dev server installed
        // eslint-disable-next-line import/no-extraneous-dependencies
        const WebpackDevServer = require('webpack-dev-server');
        const server = new WebpackDevServer(compiler as any, {
          noInfo: true,
          stats: 'none',
          liveReload: false,
          inline: false,
          hot: false,
          open: !config.previewNoOpen,
          contentBase: pathUtils.join(__dirname, 'public'),
          before: setupApi({
            storiesMetadata,
            config,
            getAssets: () => assets,
            getFiles: () => files,
          }),
        });
        setDevServer(server);
        server.listen(config.previewPort);
      } catch (e) {
        setSetupError(e);
      }
    }
  }, [compiler, baseUrl, storiesMetadata, established, config]);

  // Close dev server on unmount
  React.useEffect(() => {
    if (devServer) {
      return () => {
        devServer.close();
      };
    }

    return () => {};
  }, [devServer]);

  return React.useMemo(() => ({ devServer, ready, established, errors, setupError }), [
    devServer,
    ready,
    established,
    errors,
    setupError,
  ]);
}
