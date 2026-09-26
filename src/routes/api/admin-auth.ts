import { createFileRoute } from "@tanstack/react-router";
import fs from "node:fs";
import path from "node:path";

const CONFIG_PATH = path.resolve(process.cwd(), "data/admin_config.json");

function getAdminPassword(): string {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
      return config.password || "admin123";
    }
  } catch (e) {
    console.error("Error reading admin config:", e);
  }
  return "admin123";
}

function setAdminPassword(newPassword: string): void {
  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify({ password: newPassword }, null, 2));
}

export const Route = createFileRoute("/api/admin-auth")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { action, password, currentPassword, newPassword } = body;

          const currentConfigured = getAdminPassword();

          if (action === "verify") {
            const isValid = (password || "").trim() === currentConfigured.trim();
            return Response.json({ valid: isValid });
          }

          if (action === "update") {
            if ((currentPassword || "").trim() !== currentConfigured.trim()) {
              return Response.json(
                { success: false, error: "Current password does not match." },
                { status: 400 },
              );
            }
            if (!newPassword || newPassword.trim().length < 4) {
              return Response.json(
                { success: false, error: "New password must be at least 4 characters." },
                { status: 400 },
              );
            }
            setAdminPassword(newPassword.trim());
            return Response.json({
              success: true,
              message: "Admin password successfully updated on server.",
            });
          }

          if (action === "reset") {
            setAdminPassword("admin123");
            return Response.json({
              success: true,
              message: "Admin password reset to default 'admin123'.",
            });
          }

          return Response.json({ error: "Invalid action." }, { status: 400 });
        } catch (error: any) {
          console.error("Error in admin auth endpoint:", error);
          return Response.json({ error: error?.message || "Server error" }, { status: 500 });
        }
      },
    },
  },
});
