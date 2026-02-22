import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NotePage from "../page";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

jest.mock("@/contexts/AuthContext");
jest.mock("@/lib/api");
jest.mock("next/navigation", () => ({
  useParams: () => ({ id: "new" }),
  useRouter: () => ({ push: jest.fn() }),
}));

const mockedUseAuth = useAuth as unknown as jest.Mock;
const mockedApi = api as jest.Mocked<typeof api>;

describe("NotePage (new)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAuth.mockReturnValue({ user: { id: 1, email: "a@b.com" }, loading: false, login: jest.fn(), register: jest.fn(), logout: jest.fn() });
    mockedApi.get.mockResolvedValueOnce({ data: [{ id: 1, name: "Random Thoughts", color: "peach", notes_count: 0 }] }); // /categories/
    mockedApi.post.mockResolvedValue({ data: { id: 123 } });
  });

  it("creates a new note on Save", async () => {
    const user = userEvent.setup();
    render(<NotePage />);

    // Wait for categories to load
    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalledWith("/categories/");
    });

    const title = screen.getByPlaceholderText(/note title/i);
    const content = screen.getByPlaceholderText(/pour your heart out/i);

    await user.clear(title);
    await user.type(title, "Hello");
    await user.type(content, "World");

    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalledWith("/notes/", { title: "Hello", content: "World", category: 1 });
    });
  });
});

describe("NotePage (edit)", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("updates an existing note on Save", async () => {
    jest.doMock("next/navigation", () => ({
      useParams: () => ({ id: "5" }),
      useRouter: () => ({ push: jest.fn() }),
    }));

    const { default: NotePageDynamic } = await import("../page");

    mockedUseAuth.mockReturnValue({ user: { id: 1, email: "a@b.com" }, loading: false, login: jest.fn(), register: jest.fn(), logout: jest.fn() });
    mockedApi.get.mockImplementation((url: string) => {
      if (url === "/categories/") return Promise.resolve({ data: [{ id: 1, name: "Random Thoughts", color: "peach" }] });
      if (url === "/notes/5/") return Promise.resolve({ data: { id: 5, title: "Old", content: "C", category: 1, updated_at: new Date().toISOString() } });
      return Promise.resolve({ data: {} });
    });
    mockedApi.put.mockResolvedValue({ data: { id: 5, title: "New", content: "C", category: 1 } });

    const user = userEvent.setup();
    render(<NotePageDynamic />);

    const title = await screen.findByDisplayValue("Old");
    await user.clear(title);
    await user.type(title, "New");
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(mockedApi.put).toHaveBeenCalledWith("/notes/5/", { title: "New", content: "C", category: 1 });
    });
  });
});

