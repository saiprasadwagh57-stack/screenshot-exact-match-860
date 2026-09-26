/**
 * Admin Authentication Service
 * Manages admin access, password verification, session state, and password updates.
 */

export class AdminAuthService {
  private static PWD_STORAGE_KEY = "schemesaar_admin_password";
  private static SESSION_AUTH_KEY = "schemesaar_admin_session_auth";
  public static DEFAULT_PASSWORD = "admin123";

  /**
   * Retrieves the current configured admin password.
   * Defaults to 'admin123' if not yet customized.
   */
  public static getAdminPassword(): string {
    if (typeof window === "undefined") return this.DEFAULT_PASSWORD;
    const stored = localStorage.getItem(this.PWD_STORAGE_KEY);
    return stored ? stored : this.DEFAULT_PASSWORD;
  }

  /**
   * Updates the admin password in persistent storage.
   */
  public static setAdminPassword(newPassword: string): boolean {
    if (typeof window === "undefined") return false;
    const trimmed = newPassword.trim();
    if (!trimmed) return false;
    localStorage.setItem(this.PWD_STORAGE_KEY, trimmed);
    return true;
  }

  /**
   * Resets the admin password back to the default 'admin123'.
   */
  public static resetPasswordToDefault(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.PWD_STORAGE_KEY);
    }
  }

  /**
   * Checks whether the user input matches the admin password.
   */
  public static verifyPassword(input: string): boolean {
    const current = this.getAdminPassword();
    return input.trim() === current.trim();
  }

  /**
   * Checks if the admin is currently authenticated in this browser session.
   */
  public static isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(this.SESSION_AUTH_KEY) === "true";
  }

  /**
   * Marks the current session as authenticated as admin.
   */
  public static setSessionAuthenticated(authenticated: boolean): void {
    if (typeof window === "undefined") return;
    if (authenticated) {
      sessionStorage.setItem(this.SESSION_AUTH_KEY, "true");
    } else {
      sessionStorage.removeItem(this.SESSION_AUTH_KEY);
    }
  }

  /**
   * Logs out the admin by clearing the session token.
   */
  public static logout(): void {
    this.setSessionAuthenticated(false);
  }
}
