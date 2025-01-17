import * as Differencify from 'differencify';
import * as fs from 'fs';
import * as path from 'path';
import { URL } from './constants';

import { getResultFolder } from './bojagiPaths';

const CHROME_ARGS = [
  '--disable-notifications',
  '--ignore-certificate-errors',
  '--no-sandbox',
  '--disable-features=site-per-process',
  '--disable-setuid-sandbox',
];

const differencify = new Differencify({});

export async function snapshotPreview(stories) {
  const target = differencify.init({ chain: false });
  await target.launch({
    headless: true,
    args: CHROME_ARGS,
    defaultViewport: { width: 1024, height: 768 },
  });
  try {
    await stories.reduce(async (prev, story) => {
      await prev;
      return snapshotPreviewStory(target, story);
    }, Promise.resolve());
    target.close();
    return stories;
  } catch (e) {
    target.close();
    throw e;
  }
}

async function snapshotPreviewStory(target, story) {
  const page = await target.newPage();
  console.log(`checking ...${story.filePath}`);
  await page.goto(`${URL}/app/story/${toB64(story.filePath)}`);
  await page.waitForSelector('iframe');
  const element = await page.$('iframe');
  await page.waitFor(3000);
  const image = await element.screenshot();
  await target.toMatchSnapshot(image);
}

function toB64(str) {
  return Buffer.from(str).toString('base64');
}

export function snapShotFileJSON(filePath) {
  expect(
    JSON.stringify(JSON.parse(fs.readFileSync(filePath, 'utf8')), null, ' ')
  ).toMatchSnapshot();
}

export function snapShotTmpFolder(basePath) {
  const resultFolder = getResultFolder(basePath);
  snapShotFileJSON(path.resolve(resultFolder, 'manifest.json'));
  snapShotFileJSON(path.resolve(resultFolder, 'default', 'files.json'));
  snapShotFileJSON(path.resolve(resultFolder, 'default', 'stories.json'));
}
