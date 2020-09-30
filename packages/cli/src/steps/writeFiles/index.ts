import { FileContent, StoryFileWithMetadata } from '../../types';
import { StepRunnerStep, StepRunnerActionOptions } from '../../containers/StepRunner';
import { ScanStepOutput } from '../scan';
import { CompileStepOutput } from '../compile';
import { AnalyzeStepOutput, StoryCollectionMetadata } from '../analyze';
import { writeJson } from '../../utils/writeFile';
import { buildManifest } from './buildManifest';

export type WriteFilesStepOutput = {};

const STORY_PROPERTY_WHITELIST: (keyof StoryFileWithMetadata | keyof StoryCollectionMetadata)[] = [
  'fileName',
  'filePath',
  'gitPath',
  'name',
  'namespace',
  'storyItems',
  'outputFilePath',
  'title',
  'dependencies',
];
const FILE_PROPERTY_WHITELIST: (keyof FileContent)[] = ['name', 'namespace', 'outputFilePath'];

export const writeFilesStep: StepRunnerStep<WriteFilesStepOutput> = {
  action,
  emoji: 'pencil2',
  name: 'writeFiles',
  messages: {
    running: () => 'Write files',
    success: () => 'Files written',
    error: () => 'Error while writing files',
  },
};

type DependencyStepOutputs = {
  scan: ScanStepOutput;
  compile: CompileStepOutput;
  analyze: AnalyzeStepOutput;
};

async function action({ config, stepOutputs }: StepRunnerActionOptions<DependencyStepOutputs>) {
  const storiesMetadata = (stepOutputs.analyze && stepOutputs.analyze.storiesMetadata) || {};

  // Filter object properties by whitelist (so only relevant data is added to json files)
  const cleanFiles = stepOutputs.compile.files.map(mapObjectWithWhitelist(FILE_PROPERTY_WHITELIST));
  const cleanStories = stepOutputs.compile.stories
    .map(item => {
      const metadata = storiesMetadata[item.filePath] || {};
      return {
        ...metadata,
        ...item,
      };
    })
    .map(mapObjectWithWhitelist(STORY_PROPERTY_WHITELIST));

  const manifest = buildManifest(stepOutputs.scan.dependencies);

  await writeJson('manifest', manifest);
  await writeJson('files', cleanFiles, config.namespace);
  await writeJson('stories', cleanStories, config.namespace);

  return {};
}

function mapObjectWithWhitelist<T extends Record<K, any>, K extends string = string>(
  whitelist: K[]
) {
  return (item: T): { [x in K]: T[x] } =>
    Object.entries(item)
      .filter(([key]) => whitelist.includes(key as K))
      .reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: value,
        }),
        {} as { [x in K]: T[x] }
      );
}