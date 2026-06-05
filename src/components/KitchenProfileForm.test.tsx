import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { KitchenProfileForm } from "./KitchenProfileForm";

describe("KitchenProfileForm", () => {
  it("does not render a manual save button", () => {
    render(<KitchenProfileForm onSave={vi.fn()} />);

    expect(screen.queryByRole("button", { name: "保存设置" })).not.toBeInTheDocument();
  });

  it("uses the compact settings view without first-run copy or selected summary", () => {
    render(<KitchenProfileForm isFirstRun={false} onSave={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "设置" })).toBeInTheDocument();
    expect(screen.queryByText("首次设置")).not.toBeInTheDocument();
    expect(screen.queryByText("先记住你的厨房习惯。")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("已选厨房设置")).not.toBeInTheDocument();
  });

  it("shows setting entries without expanding all checklist options", () => {
    render(<KitchenProfileForm onSave={vi.fn()} />);

    expect(screen.getAllByRole("button", { name: /编辑/ }).map((button) => button.textContent)).toEqual([
      "默认条件",
      "口味偏好",
      "忌口/避免",
      "菜系偏好",
      "常用厨具",
      "常备调料"
    ]);
    expect(screen.queryByLabelText("少油")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("蒸锅")).not.toBeInTheDocument();
  });

  it("auto-saves selected and deselected checklist preferences", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<KitchenProfileForm onSave={onSave} />);

    await user.click(screen.getByRole("button", { name: "编辑口味偏好" }));
    await user.click(screen.getByLabelText("少油"));
    await user.click(screen.getByLabelText("清淡"));
    await user.click(screen.getByRole("button", { name: "返回设置" }));
    await user.click(screen.getByRole("button", { name: "编辑常用厨具" }));
    await user.click(screen.getByLabelText("蒸锅"));

    expect(onSave).toHaveBeenLastCalledWith(
      expect.objectContaining({
        tastes: ["少油"],
        cookware: expect.arrayContaining(["炒锅", "蒸锅"])
      })
    );
    expect(onSave.mock.lastCall?.[0].tastes).not.toContain("清淡");
  });

  it("auto-saves a trimmed custom item and ignores duplicates", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<KitchenProfileForm onSave={onSave} />);

    await user.click(screen.getByRole("button", { name: "编辑常用厨具" }));
    await user.type(screen.getByLabelText("添加常用厨具"), "  砂锅  ");
    await user.click(screen.getByRole("button", { name: "添加常用厨具" }));
    await user.type(screen.getByLabelText("添加常用厨具"), "砂锅");
    await user.click(screen.getByRole("button", { name: "添加常用厨具" }));

    expect(onSave.mock.calls).toHaveLength(1);
    expect(onSave.mock.lastCall?.[0].cookware.filter((item: string) => item === "砂锅")).toHaveLength(1);
  });

  it("auto-saves default condition controls", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<KitchenProfileForm onSave={onSave} />);

    await user.click(screen.getByRole("button", { name: "编辑默认条件" }));
    await user.clear(screen.getByLabelText("默认人数"));
    await user.type(screen.getByLabelText("默认人数"), "3");
    await user.selectOptions(screen.getByLabelText("烹饪水平"), "normal");
    await user.selectOptions(screen.getByLabelText("最长时间"), "45");

    expect(onSave).toHaveBeenLastCalledWith(
      expect.objectContaining({
        servingCount: 3,
        cookingSkill: "normal",
        maxCookingTimeMinutes: 45
      })
    );
  });

  it("selects and clears every option on a checklist subpage", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<KitchenProfileForm onSave={onSave} />);

    await user.click(screen.getByRole("button", { name: "编辑口味偏好" }));
    await user.click(screen.getByRole("button", { name: "全选口味偏好" }));

    expect(onSave).toHaveBeenLastCalledWith(
      expect.objectContaining({
        tastes: ["清淡", "少油", "微辣", "重辣", "酸甜", "咸鲜", "少糖"]
      })
    );

    await user.click(screen.getByRole("button", { name: "取消全选口味偏好" }));

    expect(onSave.mock.lastCall?.[0].tastes).toEqual([]);
  });

  it("does not show a manual saved message after auto-saving", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<KitchenProfileForm onSave={onSave} />);

    await user.click(screen.getByRole("button", { name: "编辑口味偏好" }));
    await user.click(screen.getByLabelText("少油"));

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
