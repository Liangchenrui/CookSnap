import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { makeIngredient } from "@/test/factories";
import { IngredientComposer } from "./IngredientComposer";

describe("IngredientComposer", () => {
  it("parses raw input and lets the user remove parsed tags", async () => {
    const user = userEvent.setup();
    const onRecommend = vi.fn();
    const parseIngredients = vi.fn().mockResolvedValue([
      makeIngredient({ id: "egg", name: "鸡蛋", amountText: "2 个" }),
      makeIngredient({ id: "tomato", name: "番茄", amountText: "3 个" })
    ]);

    render(<IngredientComposer parseIngredients={parseIngredients} onRecommend={onRecommend} />);

    await user.type(screen.getByLabelText("现有食材"), "鸡蛋 2 个，番茄 3 个");
    await user.click(screen.getByRole("button", { name: "解析食材" }));
    expect(await screen.findByDisplayValue("鸡蛋")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "删除 番茄" }));
    await user.click(screen.getByRole("button", { name: "生成推荐" }));

    expect(onRecommend).toHaveBeenCalledWith("鸡蛋 2 个，番茄 3 个", [
      expect.objectContaining({ id: "egg", name: "鸡蛋" })
    ]);
  });
});
