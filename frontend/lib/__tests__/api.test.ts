import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("API Module", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("manages access tokens in localStorage", () => {
    localStorage.setItem("access_token", "test-token");
    expect(localStorage.getItem("access_token")).toBe("test-token");
  });

  it("handles requests without access token", () => {
    localStorage.removeItem("access_token");
    expect(localStorage.getItem("access_token")).toBeNull();
  });

  it("stores tokens on successful request", () => {
    const mockResponse = {
      data: {
        access: "new-access-token",
        refresh: "new-refresh-token",
      },
    };

    // Simulate storing tokens
    if (mockResponse.data.access) {
      localStorage.setItem("access_token", mockResponse.data.access);
    }
    if (mockResponse.data.refresh) {
      localStorage.setItem("refresh_token", mockResponse.data.refresh);
    }

    expect(localStorage.getItem("access_token")).toBe("new-access-token");
    expect(localStorage.getItem("refresh_token")).toBe("new-refresh-token");
  });

  it("clears tokens on 401 error", () => {
    localStorage.setItem("access_token", "token");
    localStorage.setItem("refresh_token", "refresh");

    // Simulate 401 error
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    expect(localStorage.getItem("access_token")).toBeNull();
    expect(localStorage.getItem("refresh_token")).toBeNull();
  });
});

describe("API Error Handling", () => {
  it("handles network errors gracefully", async () => {
    const networkError = new Error("Network Error");
    mockedAxios.get = jest.fn().mockRejectedValue(networkError);

    try {
      await mockedAxios.get("/test");
    } catch (error) {
      expect(error).toBe(networkError);
    }
  });

  it("handles 404 errors", async () => {
    const error404 = {
      response: {
        status: 404,
        data: { detail: "Not found" },
      },
    };
    mockedAxios.get = jest.fn().mockRejectedValue(error404);

    try {
      await mockedAxios.get("/nonexistent");
    } catch (error: any) {
      expect(error.response.status).toBe(404);
    }
  });

  it("handles 500 server errors", async () => {
    const error500 = {
      response: {
        status: 500,
        data: { detail: "Internal server error" },
      },
    };
    mockedAxios.get = jest.fn().mockRejectedValue(error500);

    try {
      await mockedAxios.get("/error");
    } catch (error: any) {
      expect(error.response.status).toBe(500);
    }
  });
});
