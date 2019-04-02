import { nameFromPath } from "./FileUtil";

test("nameFromPath", () => {
  const path = "/path/to/file.bloomd";
  const name = nameFromPath(path);
  expect(name).toEqual("file.bloomd");
});
