import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import HomePage from "./page";
import { savePreferences } from "@/lib/storage";
import { makePreferences } from "@/test/factories";

describe("HomePage", () => {
  it("does not use saved preferences during the server-compatible initial render", () => {
    localStorage.clear();
    savePreferences(makePreferences());

    const html = renderToString(<HomePage />);

    expect(html).toContain("保存厨房画像");
    expect(html).not.toContain("今天做什么");
  });
});
