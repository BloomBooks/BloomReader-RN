import { WDClient } from "./intTestSetup";

import { expectToFind, textSelector, find } from "./intTestHelpers";

export default async function readReleaseNotes(client: WDClient) {
  const menu = await find(client, "~Main Menu");
  await menu.click();
  const releaseNotesBtn = await find(client, textSelector("Release Notes"));
  await releaseNotesBtn.click();
  await expectToFind(client, textSelector("Pan and zoom images"));
}
