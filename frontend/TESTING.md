# 🧪 Testing Documentation

This document describes the testing strategy and how to run tests for the Notes App frontend.

## 📚 Testing Stack

- **Jest** - JavaScript testing framework
- **React Testing Library** - React component testing utilities
- **@testing-library/user-event** - User interaction simulation
- **@testing-library/jest-dom** - Custom Jest matchers for DOM

## 🚀 Running Tests

### Run all tests

```bash
pnpm test
```

### Watch mode (re-run on file changes)

```bash
pnpm test:watch
```

### Coverage report

```bash
pnpm test:coverage
```

## 📁 Test Structure

Tests are colocated with the code they test:

```
frontend/
├── app/
│   ├── login/
│   │   ├── page.tsx
│   │   └── __tests__/
│   │       └── page.test.tsx
│   └── signup/
│       ├── page.tsx
│       └── __tests__/
│           └── page.test.tsx
├── contexts/
│   ├── AuthContext.tsx
│   └── __tests__/
│       └── AuthContext.test.tsx
└── lib/
    ├── api.ts
    └── __tests__/
        └── api.test.ts
```

## ✅ Test Coverage

### AuthContext Tests

- ✅ Initialization with no user
- ✅ User registration
- ✅ User login with JWT tokens
- ✅ User logout
- ✅ Error handling for missing provider
- ✅ LocalStorage token management

### Login Page Tests

- ✅ Renders login form
- ✅ Displays cute cactus illustration
- ✅ Email and password input
- ✅ Password visibility toggle
- ✅ Form submission
- ✅ Error message display
- ✅ Link to signup page
- ✅ Field validation

### Signup Page Tests

- ✅ Renders signup form
- ✅ Displays cute cat illustration
- ✅ Email and password input
- ✅ Password visibility toggle
- ✅ Form submission
- ✅ Error handling (specific and generic)
- ✅ Link to login page
- ✅ Field validation

### API Module Tests

- ✅ Axios instance configuration
- ✅ Default headers
- ✅ Access token in requests
- ✅ Token storage
- ✅ Token clearing on 401
- ✅ Network error handling
- ✅ HTTP error handling (404, 500)

## 🎯 Testing Best Practices

### 1. Test User Behavior, Not Implementation

**Good:**

```typescript
await user.type(
  screen.getByPlaceholderText("Email address"),
  "test@example.com"
);
await user.click(screen.getByRole("button", { name: /sign in/i }));
```

**Bad:**

```typescript
component.setState({ email: "test@example.com" });
component.handleSubmit();
```

### 2. Use Semantic Queries

Priority order:

1. `getByRole` - Accessible to screen readers
2. `getByLabelText` - Form elements
3. `getByPlaceholderText` - Inputs
4. `getByText` - Non-interactive content
5. `getByTestId` - Last resort

### 3. Test Accessibility

```typescript
expect(screen.getByPlaceholderText("Email address")).toBeRequired();
expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
```

### 4. Mock External Dependencies

```typescript
jest.mock("@/lib/api");
jest.mock("@/contexts/AuthContext");
```

### 5. Clean Up Between Tests

```typescript
beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});
```

## 📊 Coverage Goals

| Type       | Target | Current        |
| ---------- | ------ | -------------- |
| Statements | 80%    | To be measured |
| Branches   | 75%    | To be measured |
| Functions  | 80%    | To be measured |
| Lines      | 80%    | To be measured |

View detailed coverage:

```bash
pnpm test:coverage
open coverage/lcov-report/index.html
```

## 🔍 Writing New Tests

### Example: Testing a Component

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MyComponent from "../MyComponent";

describe("MyComponent", () => {
  it("renders correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("handles user interaction", async () => {
    const user = userEvent.setup();
    render(<MyComponent />);

    await user.click(screen.getByRole("button"));
    expect(screen.getByText("Clicked")).toBeInTheDocument();
  });
});
```

### Example: Testing Async Operations

```typescript
it("loads data on mount", async () => {
  const mockData = { name: "Test" };
  mockApi.get.mockResolvedValue({ data: mockData });

  render(<MyComponent />);

  await waitFor(() => {
    expect(screen.getByText("Test")).toBeInTheDocument();
  });
});
```

### Example: Testing Errors

```typescript
it("displays error message", async () => {
  mockApi.get.mockRejectedValue(new Error("Failed"));

  render(<MyComponent />);

  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

## 🐛 Common Issues

### Issue: "Cannot find module"

**Solution:** Check jest.config.js moduleNameMapper

### Issue: "window is not defined"

**Solution:** Use jest-environment-jsdom

### Issue: "localStorage is not defined"

**Solution:** Already mocked in jest.setup.js

### Issue: "useRouter is not a function"

**Solution:** Next.js navigation is mocked in jest.setup.js

## 📝 Test Checklist

For each component, test:

- [ ] Renders without crashing
- [ ] Displays correct content
- [ ] Handles user interactions
- [ ] Shows loading states
- [ ] Displays error messages
- [ ] Validates form inputs
- [ ] Calls APIs correctly
- [ ] Updates UI after async operations
- [ ] Has accessible markup
- [ ] Works with keyboard navigation

## 🎓 Learning Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Accessibility Testing](https://testing-library.com/docs/queries/about/#priority)

## 🔄 Continuous Integration

Tests run automatically on:

- Pull requests
- Pre-commit hooks (if configured)
- CI/CD pipeline

Example GitHub Actions workflow:

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test:coverage
```

## 💡 Tips

1. **Write tests first** - TDD helps design better APIs
2. **Keep tests simple** - One assertion per test when possible
3. **Use descriptive names** - Test names should explain what they test
4. **Test edge cases** - Empty states, errors, loading
5. **Mock sparingly** - Only mock what you need
6. **Avoid testing implementation details** - Test behavior, not code

---

**Happy Testing!** 🚀
