import { describe, expect, it } from "vitest";
import { buildDouyinSearchUrl, buildXiaohongshuSearchUrl } from "./searchLinks";

describe("search link builders", () => {
  it("builds a Xiaohongshu search URL with encoded keyword", () => {
    const url = buildXiaohongshuSearchUrl("番茄炒蛋 家常");
    expect(url).toContain("xiaohongshu.com/search_result");
    expect(url).toContain(encodeURIComponent("番茄炒蛋 家常"));
  });

  it("builds a Douyin search URL with encoded keyword", () => {
    const url = buildDouyinSearchUrl("番茄炒蛋 教程");
    expect(url).toContain("douyin.com/search");
    expect(url).toContain(encodeURIComponent("番茄炒蛋 教程"));
  });
});
