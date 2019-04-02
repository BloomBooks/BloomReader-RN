import { startAppiumSession, endAppiumSession, WDClient } from "./intTestSetup";
import readReleaseNotes from "./readReleaseNotes";

let client: WDClient;
jest.setTimeout(30000);

beforeAll(async () => {
  client = await startAppiumSession();
});

afterAll(async () => {
  await endAppiumSession(client);
});

test("Read Release Notes", async () => {
  return readReleaseNotes(client);
});
