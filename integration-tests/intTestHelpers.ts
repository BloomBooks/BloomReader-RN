import { WDClient } from "./intTestSetup";

export async function expectToFind(
  client: WDClient,
  selector: string,
  tries = 4
): Promise<void> {
  try {
    await expect(find(client, selector, tries)).resolves.toBeTruthy();
  } catch (err) {
    await takeScreenShot(client);
    throw err;
  }
}

export async function takeScreenShot(client: WDClient): Promise<void> {
  console.log("Saving screenshot to integration-tests/fail.png...");
  await client.saveScreenshot("./integration-tests/fail.png");
}

interface TextSelectorOpts {
  exact?: boolean;
}
export function textSelector(
  text: string,
  opts: TextSelectorOpts = {}
): string {
  let selector = `android=new UiSelector().`;
  selector += opts.exact ? "text" : "textContains";
  selector += `("${text}")`;
  return selector;
}

// If client.$() fails to find element it returns an object
// with an error property
interface ElementOrError extends WebdriverIO.Element {
  error?: string;
}
export async function find(
  client: WDClient,
  selector: string,
  tries = 4
): Promise<ElementOrError> {
  let attempt = 0;
  while (true) {
    const result: ElementOrError = await client.$(selector);
    if (result.error) {
      ++attempt;
      if (attempt == tries) throw result.error;
    } else {
      return result;
    }
    await sleep(200);
  }
}

export async function clickMainMenuItem(
  client: WDClient,
  menuItemText: string
): Promise<void> {
  const menu = await find(client, "~Main Menu");
  await menu.click();
  const menuItem = await find(client, textSelector(menuItemText));
  await menuItem.click();
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
