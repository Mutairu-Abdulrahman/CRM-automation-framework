export const LoginSelectors = {
  usernameInput: (page) => page.locator('input[name="username"]'),
  passwordInput: (page) => page.locator('input[name="password"]'),
  loginButton: (page) => page.getByRole('button', { name: 'Login with Username' }),
};
