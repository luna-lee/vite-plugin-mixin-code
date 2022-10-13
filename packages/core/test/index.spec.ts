import plugin from "../src/index";
import { describe, test, expect } from "vitest";
import { promises as fs } from "fs";
import path from "path";

const createVitePlugin = () => {
  const { name, transform } = plugin({ mixinCode: `{aa:"xx"}` });
  return { name, transform: transform as any };
};

const judge = async (name) => {
  const { transform } = await createVitePlugin();
  const content = await fs.readFile(
    path.resolve(__dirname, `./fixtures/${name}/test.vue`)
  );
  const targetContent = await fs.readFile(
    path.resolve(__dirname, `./fixtures/${name}/target.vue`)
  );
  const ret = transform(content.toString(), process.cwd() + "/test.vue");
  expect(ret.code.replace(/\n|\t|\s/gms, "")).toEqual(
    targetContent.toString().replace(/\n|\t|\s/gms, "")
  );
};
describe("plugin test.", () => {
  test("make sure name.", async () => {
    const { name } = await createVitePlugin();
    expect(name).toEqual("vite:mixin-code");
  });

  test("not a vue file.", async () => {
    const { transform } = await createVitePlugin();
    const ret = await transform("code", "index.html");
    expect(ret).toBe(null);
  });

  test("当有export default时", async () => {
    await judge("export-default");
  });
  test("当只有setup时", async () => {
    await judge("setup");
  });
});
