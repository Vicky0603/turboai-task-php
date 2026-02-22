import { renderHook, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../AuthContext";
import api from "@/lib/api";

// Mock the API module
jest.mock("@/lib/api");
const mockedApi = api as jest.Mocked<typeof api>;

describe("AuthContext", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  it("should initialize with no user", async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.user).toBeNull();

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it("should register a new user", async () => {
    const mockUser = {
      id: 1,
      email: "test@example.com",
      username: "test",
      created_at: new Date().toISOString(),
    };

    mockedApi.post.mockResolvedValueOnce({
      data: {
        user: mockUser,
        access: "mock-access-token",
        refresh: "mock-refresh-token",
      },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.register({
      email: "test@example.com",
      password: "password123",
    });

    expect(mockedApi.post).toHaveBeenCalledWith("/auth/register/", {
      email: "test@example.com",
      password: "password123",
    });
  });

  it("should login a user", async () => {
    const mockUser = {
      id: 1,
      email: "test@example.com",
      username: "test",
      created_at: new Date().toISOString(),
    };

    mockedApi.post.mockResolvedValueOnce({
      data: {
        user: mockUser,
        access: "mock-access-token",
        refresh: "mock-refresh-token",
      },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.login({
      email: "test@example.com",
      password: "password123",
    });

    expect(mockedApi.post).toHaveBeenCalledWith("/auth/login/", {
      email: "test@example.com",
      password: "password123",
    });

    expect(localStorage.getItem("access_token")).toBe("mock-access-token");
    expect(localStorage.getItem("refresh_token")).toBe("mock-refresh-token");
  });

  it("should logout a user", async () => {
    localStorage.setItem("access_token", "token");
    localStorage.setItem("refresh_token", "refresh");

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    result.current.logout();

    expect(localStorage.getItem("access_token")).toBeNull();
    expect(localStorage.getItem("refresh_token")).toBeNull();
    expect(result.current.user).toBeNull();
  });

  it("should throw error on useAuth without provider", () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow("useAuth must be used within an AuthProvider");

    consoleSpy.mockRestore();
  });
});
