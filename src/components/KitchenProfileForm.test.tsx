import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { KitchenProfileForm } from "./KitchenProfileForm";

describe("KitchenProfileForm", () => {
  it("submits the default beginner-friendly profile", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<KitchenProfileForm onSave={onSave} />);

    await user.click(screen.getByRole("button", { name: "保存设置" }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        tastes: ["清淡"],
        allergiesOrAvoids: [],
        cuisinePreferences: ["中式家常菜"],
        cookware: ["炒锅"],
        pantrySeasonings: expect.arrayContaining(["盐", "生抽", "食用油"]),
        servingCount: 1,
        cookingSkill: "beginner",
        maxCookingTimeMinutes: 30
      })
    );
  });

  it("uses the compact settings view without first-run copy or selected summary", () => {
    render(<KitchenProfileForm isFirstRun={false} onSave={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "设置" })).toBeInTheDocument();
    expect(screen.queryByText("首次设置")).not.toBeInTheDocument();
    expect(screen.queryByText("先记住你的厨房习惯。")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("已选厨房设置")).not.toBeInTheDocument();
  });

  it("places default condition controls before checklist sections", () => {
    render(<KitchenProfileForm onSave={vi.fn()} />);

    expect(screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent)).toEqual([
      "默认条件",
      "口味偏好",
      "忌口/避免",
      "菜系偏好",
      "常用厨具",
      "常备调料"
    ]);
  });

  it("saves selected and deselected checklist preferences", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<KitchenProfileForm onSave={onSave} />);

    await user.click(screen.getByLabelText("少油"));
    await user.click(screen.getByLabelText("清淡"));
    await user.click(screen.getByLabelText("蒸锅"));
    await user.click(screen.getByRole("button", { name: "保存设置" }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        tastes: ["少油"],
        cookware: expect.arrayContaining(["炒锅", "蒸锅"])
      })
    );
    expect(onSave.mock.calls[0][0].tastes).not.toContain("清淡");
  });

  it("adds a trimmed custom item and ignores duplicates", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<KitchenProfileForm onSave={onSave} />);

    await user.type(screen.getByLabelText("添加常用厨具"), "  砂锅  ");
    await user.click(screen.getByRole("button", { name: "添加常用厨具" }));
    await user.type(screen.getByLabelText("添加常用厨具"), "砂锅");
    await user.click(screen.getByRole("button", { name: "添加常用厨具" }));
    await user.click(screen.getByRole("button", { name: "保存设置" }));

    expect(onSave.mock.calls[0][0].cookware.filter((item: string) => item === "砂锅")).toHaveLength(1);
  });

  it("saves default condition controls", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<KitchenProfileForm onSave={onSave} />);

    await user.clear(screen.getByLabelText("默认人数"));
    await user.type(screen.getByLabelText("默认人数"), "3");
    await user.selectOptions(screen.getByLabelText("烹饪水平"), "normal");
    await user.selectOptions(screen.getByLabelText("最长时间"), "45");
    await user.click(screen.getByRole("button", { name: "保存设置" }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        servingCount: 3,
        cookingSkill: "normal",
        maxCookingTimeMinutes: 45
      })
    );
  });

  it("shows a saved message until settings change again", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<KitchenProfileForm onSave={onSave} />);

    await user.click(screen.getByRole("button", { name: "保存设置" }));

    expect(screen.getByRole("status")).toHaveTextContent("设置已保存");

    await user.click(screen.getByLabelText("少油"));

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
