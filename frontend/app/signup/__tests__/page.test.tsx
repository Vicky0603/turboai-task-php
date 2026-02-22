import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignupPage from "../page";
import { useAuth } from "@/contexts/AuthContext";

// Mock the AuthContext
jest.mock("@/contexts/AuthContext");
const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe("SignupPage", () => {
  const mockRegister = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAuth.mockReturnValue({
      user: null,
      loading: false,
      login: jest.fn(),
      register: mockRegister,
      logout: jest.fn(),
    });
  });

  it("renders signup form", () => {
    render(<SignupPage />);

    expect(screen.getByText("Yay, New Friend!")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email address")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign up/i })
    ).toBeInTheDocument();
  });

  it("displays cat illustration", () => {
    render(<SignupPage />);

    const image = screen.getByAltText("Cute sleeping cat");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "/cat-signup.svg");
  });

  it("allows user to type email and password", async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    const emailInput = screen.getByPlaceholderText("Email address");
    const passwordInput = screen.getByPlaceholderText("Password");

    await user.type(emailInput, "newuser@example.com");
    await user.type(passwordInput, "password123");

    expect(emailInput).toHaveValue("newuser@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  it("toggles password visibility", async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    const passwordInput = screen.getByPlaceholderText("Password");
    // The toggle button is inside a tooltip div and has no text, so we query by test structure
    const toggleButton = screen
      .getAllByRole("button")
      .find((btn) => btn.type === "button" && btn.querySelector("svg"));

    expect(passwordInput).toHaveAttribute("type", "password");

    if (toggleButton) {
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute("type", "text");

      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute("type", "password");
    }
  });

  it("submits form with email and password", async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValueOnce(undefined);

    render(<SignupPage />);

    const emailInput = screen.getByPlaceholderText("Email address");
    const passwordInput = screen.getByPlaceholderText("Password");
    const submitButton = screen.getByRole("button", { name: /sign up/i });

    await user.type(emailInput, "newuser@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: "newuser@example.com",
        password: "password123",
      });
    });
  });

  it("displays error message on registration failure", async () => {
    const user = userEvent.setup();
    const errorMessage = "Email already exists";
    mockRegister.mockRejectedValueOnce({
      response: { data: { message: errorMessage } },
    });

    render(<SignupPage />);

    const emailInput = screen.getByPlaceholderText("Email address");
    const passwordInput = screen.getByPlaceholderText("Password");
    const submitButton = screen.getByRole("button", { name: /sign up/i });

    await user.type(emailInput, "existing@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it("displays generic error on unknown failure", async () => {
    const user = userEvent.setup();
    mockRegister.mockRejectedValueOnce(new Error("Network error"));

    render(<SignupPage />);

    const emailInput = screen.getByPlaceholderText("Email address");
    const passwordInput = screen.getByPlaceholderText("Password");
    const submitButton = screen.getByRole("button", { name: /sign up/i });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Failed to register. Please try again.")
      ).toBeInTheDocument();
    });
  });

  it("has link to login page", () => {
    render(<SignupPage />);

    const loginLink = screen.getByText(/sign in/i);
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest("a")).toHaveAttribute("href", "/login");
  });

  it("validates required fields", () => {
    render(<SignupPage />);

    const emailInput = screen.getByPlaceholderText("Email address");
    const passwordInput = screen.getByPlaceholderText("Password");

    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
    expect(emailInput).toHaveAttribute("type", "email");
  });
});
