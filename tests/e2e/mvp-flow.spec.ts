import { expect, test } from "@playwright/test";

test("returning user parses ingredients and receives recommendations", async ({ page }) => {
  await page.route("**/api/parse-ingredients", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        ingredients: [
          { id: "egg", name: "鸡蛋", amountText: "2 个" },
          { id: "tomato", name: "番茄", amountText: "3 个" }
        ]
      })
    });
  });

  await page.route("**/api/recommend-recipes", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        groups: [
          {
            group: "best_match",
            title: "最匹配",
            recipes: [
              {
                id: "recipe-1",
                name: "番茄炒蛋",
                group: "best_match",
                matchReason: "主要食材都已具备。",
                usedIngredients: ["鸡蛋", "番茄"],
                missingNonCoreIngredients: [],
                timeMinutes: 15,
                difficulty: "easy",
                steps: ["打蛋", "切番茄", "炒鸡蛋", "炒番茄", "合炒调味"],
                searchKeywords: {
                  xiaohongshu: "番茄炒蛋 家常 新手 做法",
                  douyin: "番茄炒蛋 新手 教程"
                }
              }
            ]
          }
        ]
      })
    });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "编辑口味偏好" }).click();
  await page.getByLabel("少油").click();
  await expect(page.getByLabel("现有食材")).toBeVisible();
  await page.getByLabel("现有食材").fill("鸡蛋 2 个，番茄 3 个");
  await page.getByRole("button", { name: "解析食材" }).click();
  await expect(page.getByRole("textbox", { name: "鸡蛋 名称" })).toBeVisible();
  await page.getByRole("button", { name: "生成推荐" }).click();
  await expect(page.getByRole("heading", { name: "番茄炒蛋" })).toBeVisible();
  await page.getByRole("button", { name: "收藏 番茄炒蛋" }).click();
  await page.getByRole("navigation", { name: "主导航" }).getByRole("button", { name: "收藏", exact: true }).click();
  await expect(page.getByText("主要食材都已具备。")).toBeVisible();
});
