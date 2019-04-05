import Analytics from "@segment/analytics-react-native";

const keys = {
  test: "FSepBapJtfOi3FfhsEWQjc2Dw0O3ixuY",
  beta: "HRltJ1F4vEVgCypIMeRVnjLAMUTAyOAI",
  release: "EfisyNbRjBYIHyHZ9njJcs5dWF4zabyH"
};

export async function setup(): Promise<void> {
  // Don't create duplicate Analytics object when refreshing JS in development
  if (Analytics.ready) return;

  const key = keys.test; // TODO - use the appropriate key

  const success = Analytics.setup(key, {
    trackAppLifecycleEvents: true
  });

  if (success) {
    identify();
  } else {
    // Report and log error
  }
}

async function identify() {
  // Get identity from file
  // and send it to Segment
}

type ScreenName = "Main" | "Shelf";
export async function screenView(
  screenName: ScreenName,
  shelf?: string
): Promise<void> {
  Analytics.screen(screenName, {
    shelf: shelf || null
  });
}

export type AddedBooksMethod = "Wifi" | "FileIntent";
export async function addedBooks(
  method: AddedBooksMethod,
  titles: string[]
): Promise<void> {
  Analytics.track("AddedBooks", {
    method,
    titles
  });
}
