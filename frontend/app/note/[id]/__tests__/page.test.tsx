import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
// Mock dependencies before loading the page
jest.mock("react-markdown", () => ({ __esModule: true, default: ({ children }: any) => <div>{children}</div> }));
jest.mock("@/contexts/AuthContext", () => ({ __esModule: true, useAuth: jest.fn() }));
jest.mock("@/lib/api", () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() } }));
let mockParams: { id: string } = { id: "new" };
jest.mock("next/navigation", () => ({
  useParams: () => mockParams,
  useRouter: () => ({ push: jest.fn() }),
}));

const { useAuth } = require("@/contexts/AuthContext");
const api = require("@/lib/api").default;
const mockedUseAuth = useAuth as jest.Mock;
const mockedApi = api as jest.Mocked<typeof api>;
let NotePage: any;
beforeAll(() => {
  NotePage = require("../page").default;
});

describe("NotePage (new)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAuth.mockReturnValue({ user: { id: 1, email: "a@b.com" }, loading: false, login: jest.fn(), register: jest.fn(), logout: jest.fn() });
    mockedApi.get.mockImplementation((url: string) => {
      if (url === "/categories/") return Promise.resolve({ data: [{ id: 1, name: "Random Thoughts", color: "peach", notes_count: 0 }] });
      return Promise.resolve({ data: {} });
    });
    mockedApi.post.mockResolvedValue({ data: { id: 123 } });
  });

  it("creates a new note on Save", async () => {
    const user = userEvent.setup();
    render(<NotePage />);

    // Wait for categories to load
    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalledWith("/categories/");
    });

    // Wait for inputs to appear after loading finishes
    const title = await screen.findByPlaceholderText(/note title/i);
    const content = await screen.findByPlaceholderText(/pour your heart out/i);

    await user.clear(title);
    await user.type(title, "Hello");
    await user.type(content, "World");

    // Two "Save" buttons exist (mobile and desktop toolbars). Click one deterministically.
    const saveButtons = await screen.findAllByRole("button", { name: /save/i });
    await user.click(saveButtons[saveButtons.length - 1]);

    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalledWith("/notes/", { title: "Hello", content: "World", category: 1 });
    });
  });
});

// Removed edit-mode test for now.

