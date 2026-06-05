import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

    expect(html).toContain("先记住你的厨房习惯。");
    expect(html).not.toContain("保存设置");
    expect(html).not.toContain("今天做什么");
  });

  it("returns to the ingredient flow after changing first-run settings", async () => {
    const user = userEvent.setup();
    localStorage.clear();
    render(<HomePage />);

    await user.click(screen.getByRole("button", { name: "编辑口味偏好" }));
    await user.click(screen.getByLabelText("少油"));

    expect(screen.getByLabelText("现有食材")).toBeInTheDocument();
  });

  it("keeps saved users on the settings view after auto-saving settings", async () => {
    const user = userEvent.setup();
    localStorage.clear();
    savePreferences(makePreferences());
    render(<HomePage />);

    await screen.findByLabelText("现有食材");
    await user.click(screen.getByRole("button", { name: "设置" }));
    await user.click(screen.getByRole("button", { name: "编辑口味偏好" }));
    await user.click(screen.getByLabelText("少油"));

    expect(screen.queryByLabelText("现有食材")).not.toBeInTheDocument();
  });

  it("lets saved users return home from settings", async () => {
    const user = userEvent.setup();
    localStorage.clear();
    savePreferences(makePreferences());
    render(<HomePage />);

    await screen.findByLabelText("现有食材");
    await user.click(screen.getByRole("button", { name: "设置" }));

    expect(screen.getByRole("heading", { name: "设置" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "今天做什么" }));

    expect(screen.getByLabelText("现有食材")).toBeInTheDocument();
  });
});
