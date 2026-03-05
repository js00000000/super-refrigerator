# Gemini Agent Development Guidelines

This document outlines the mandatory development standards and workflows for the Super Refrigerator project.

## 🧪 Test-Driven Development (TDD) Mandatory
All new features, bug fixes, and architectural changes **MUST** follow a strict TDD workflow. 

1.  **Red Phase:** Write a failing test that defines the desired behavior.
2.  **Green Phase:** Write the minimal amount of code required to make the test pass.
3.  **Refactor Phase:** Clean up the code while ensuring tests remain green.

### Testing Standards
-   **Coverage:** Aim for 80%+ test coverage for all new logic.
-   **Unit Tests:** Use **Vitest** for testing components, hooks, and utility functions.
-   **Integration Tests:** Ensure end-to-end flows (e.g., adding an item -> generating a recipe) are verified.
-   **Mocks:** Use the established patterns in `src/test/setup.ts` for mocking Supabase and AI APIs.

## 🛠 Project Standards
-   **UI/UX:** Maintain the modern, interactive aesthetic using Tailwind CSS.
-   **Responsive Web Design (RWD):** The application **MUST** be fully responsive and mobile-friendly. Use Tailwind's responsive modifiers (`sm:`, `md:`, `lg:`, etc.) to ensure a seamless experience across all device sizes (mobile, tablet, and desktop).
-   **Aesthetics:** Ensure all interactive elements provide visual feedback (e.g., active/hover states, loading animations).
-   **TypeScript:** Strict typing is required. Avoid `any` unless absolutely necessary for external library compatibility.
-   **Supabase:** All database operations must be performed through the Supabase client in `src/lib/supabase.ts`.

## 🚀 Execution Flow
Before submitting any pull request or finalizing a task:
1.  Run `npm run build` to ensure no compilation errors.
2.  Run `npm test` to ensure all tests pass.
3.  Run `npm run lint` to maintain code quality.
