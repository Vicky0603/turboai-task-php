import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DashboardPage from "../page";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

jest.mock("@/contexts/AuthContext");
jest.mock("@/lib/api");

const mockedUseAuth = useAuth as unknown as jest.Mock;
const mockedApi = api as jest.Mocked<typeof api>;

describe("DashboardPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAuth.mockReturnValue({
      user: { id: 1, email: "a@b.com" },
      loading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    });

    mockedApi.get.mockImplementation((url: string) => {
      if (url === "/categories/") {
        return Promise.resolve({
          data: [
            { id: 1, name: "Random Thoughts", color: "peach", notes_count: 2 },
            { id: 2, name: "School", color: "yellow", notes_count: 1 },
          ],
        });
      }
      if (url === "/notes/") {
        return Promise.resolve({
          data: [
            { id: 10, title: "Note A", content: "C", category: 1, category_name: "Random Thoughts", category_color: "peach", updated_at: new Date().toISOString() },
            { id: 11, title: "Note B", content: "C", category: 2, category_name: "School", category_color: "yellow", updated_at: new Date().toISOString() },
          ],
        });
      }
      return Promise.resolve({ data: [] });
    });
  });

  it("renders categories and notes", async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("All Notes")).toBeInTheDocument();
      expect(screen.getByText(/Random Thoughts/)).toBeInTheDocument();
      expect(screen.getByText(/School/)).toBeInTheDocument();
    });

    // Cards rendered
    expect(await screen.findByText("Note A")).toBeInTheDocument();
    expect(await screen.findByText("Note B")).toBeInTheDocument();
  });

  it("filters notes by selected category", async () => {
    const user = userEvent.setup();
    render(<DashboardPage />);

    // Wait initial load
    await screen.findByText("Note A");

    // Click "School" category
    await user.click(screen.getByText(/School/));

    // Only Note B remains
    await waitFor(() => {
      expect(screen.queryByText("Note A")).not.toBeInTheDocument();
      expect(screen.getByText("Note B")).toBeInTheDocument();
    });
  });
});

