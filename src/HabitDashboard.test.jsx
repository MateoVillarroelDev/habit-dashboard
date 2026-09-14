import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HabitDashboard from "./HabitDashboard";

beforeEach(() => {
  window.localStorage.clear();
});

const addHabit = async (user, name) => {
  await user.click(screen.getByRole("button", { name: /new habit/i }));
  await user.type(screen.getByPlaceholderText(/name your habit/i), name);
  await user.click(screen.getByRole("button", { name: /^add habit$/i }));
};

describe("HabitDashboard", () => {
  it("shows the empty state when there are no habits", async () => {
    render(<HabitDashboard />);
    expect(await screen.findByText(/nothing planted yet/i)).toBeInTheDocument();
  });

  it("adds a new habit and persists it to localStorage", async () => {
    const user = userEvent.setup();
    render(<HabitDashboard />);
    await screen.findByText(/nothing planted yet/i);

    await addHabit(user, "Read");

    expect(await screen.findByText("Read")).toBeInTheDocument();
    const stored = JSON.parse(window.localStorage.getItem("habits"));
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe("Read");
  });

  it("blocks adding a duplicate habit name and shows an error", async () => {
    const user = userEvent.setup();
    render(<HabitDashboard />);
    await screen.findByText(/nothing planted yet/i);

    await addHabit(user, "Read");
    await screen.findByText("Read");
    await addHabit(user, "Read");

    expect(await screen.findByRole("alert")).toHaveTextContent(/already have/i);
    const stored = JSON.parse(window.localStorage.getItem("habits"));
    expect(stored).toHaveLength(1);
  });

  it("marks today's completion and increments the streak", async () => {
    const user = userEvent.setup();
    render(<HabitDashboard />);
    await screen.findByText(/nothing planted yet/i);
    await addHabit(user, "Stretch");
    await screen.findByText("Stretch");

    await user.click(screen.getByRole("button", { name: /mark today/i }));

    expect(await screen.findByRole("button", { name: /done today/i })).toBeInTheDocument();
    const stored = JSON.parse(window.localStorage.getItem("habits"));
    expect(Object.keys(stored[0].completions)).toHaveLength(1);
  });

  it("removes a habit after confirming", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<HabitDashboard />);
    await screen.findByText(/nothing planted yet/i);
    await addHabit(user, "Journal");
    await screen.findByText("Journal");

    await user.click(screen.getByRole("button", { name: /delete journal/i }));

    expect(await screen.findByText(/nothing planted yet/i)).toBeInTheDocument();
    window.confirm.mockRestore();
  });
});
