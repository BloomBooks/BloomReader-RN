import { find } from "./intTestHelpers";
import { Options, Capabilities } from "webdriver";
import WebdriverIO, { remote } from "webdriverio";

export type WDClient = WebDriver.Client & WebdriverIO.Browser;

interface AppiumCapabilities extends Capabilities {
  automationName: string;
  platformVersion: string;
  deviceName: string;
  appPackage: string;
  appActivity: string;
  noReset?: boolean;
  dontStopAppOnReset?: boolean;
  skipDeviceInitialization?: boolean;
}

const capabilities: AppiumCapabilities = {
  platformName: "Android",
  platformVersion: "8.1",
  deviceName: "Android Emulator",
  appPackage: "com.bloomreader",
  appActivity: ".MainActivity",
  automationName: "UIAutomator2",
  noReset: true,
  dontStopAppOnReset: true,
  skipDeviceInitialization: true
};

const opts: Options = {
  port: 4723,
  capabilities: capabilities,
  logLevel: "warn" // Options: trace | debug | info | warn | error | silent
};

export async function startAppiumSession() {
  const client = await remote(opts);
  await waitForLoad(client);
  return client;
}

export async function endAppiumSession(client: WDClient) {
  if (client) await client.deleteSession();
}

async function waitForLoad(client: WDClient) {
  await find(client, "~Main Menu", 50);
}
