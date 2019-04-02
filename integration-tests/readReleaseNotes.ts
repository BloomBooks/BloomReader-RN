import { WDClient } from "./intTestSetup";

import {
  expectToFind,
  textSelector,
  clickMainMenuItem
} from "./intTestHelpers";

export default async function readReleaseNotes(client: WDClient) {
  await clickMainMenuItem(client, "Release Notes");
  await expectToFind(client, textSelector("Pan and zoom images"));
}
