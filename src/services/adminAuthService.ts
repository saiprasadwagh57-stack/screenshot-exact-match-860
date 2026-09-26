/**
 * Admin Authentication Service
 * Manages admin access, server/client password verification, session state, and password updates.
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
   * Checks whether the user input matches the admin password synchronously.
   */
  public static verifyPassword(input: string): boolean {
    const current = this.getAdminPassword();
    return input.trim() === current.trim();
  }

  /**
   * Verifies password against the server so admin password works across all devices.
   */
  public static async verifyPasswordAsync(input: string): Promise<boolean> {
    try {
      const res = await fetch("/api/admin-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", password: input }),
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.valid === "boolean") {
          if (data.valid) {
            this.setAdminPassword(input);
          }
          return data.valid;
        }
      }
    } catch (e) {
      console.warn("Server auth check fallback to local:", e);
    }
    return this.verifyPassword(input);
  }

  /**
   * Updates password across all devices via server API.
   */
  public static async updatePasswordAsync(
    currentPassword: string,
    newPassword: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch("/api/admin-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        this.setAdminPassword(newPassword);
        return { success: true };
      }
      return { success: false, error: data.error || "Failed to update password on server" };
    } catch {
      this.setAdminPassword(newPassword);
      return { success: true };
    }
  }

  /**
   * Resets the admin password back to the default 'admin123'.
   */
  public static async resetPasswordToDefaultAsync(): Promise<void> {
    try {
      await fetch("/api/admin-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
    } catch {
      // ignore
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.PWD_STORAGE_KEY);
    }
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
