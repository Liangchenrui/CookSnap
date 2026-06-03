import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { KitchenProfileForm } from "./KitchenProfileForm";

describe("KitchenProfileForm", () => {
  it("submits a default beginner-friendly profile", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<KitchenProfileForm onSave={onSave} />);

    await user.click(screen.getByRole("button", { name: "保存厨房画像" }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        cuisinePreferences: ["中式家常菜"],
        pantrySeasonings: expect.arrayContaining(["盐", "生抽", "食用油"]),
        servingCount: 1,
        cookingSkill: "beginner",
        maxCookingTimeMinutes: 30
      })
    );
  });
});
