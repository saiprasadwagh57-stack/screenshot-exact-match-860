import { createFileRoute } from "@tanstack/react-router";
import fs from "node:fs";
import path from "node:path";
import { SchemeRecord } from "../../types/scheme";

const DB_PATH = path.resolve(process.cwd(), "data/active_schemes.json");
const DEFAULT_SOURCE_PATH = path.resolve(
  process.cwd(),
  "public/__l5e/assets-v1/2953ad13-2705-4945-aa3a-99d1dc73bd1c/schemes.json",
);
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

function verifyPassword(pwd?: string): boolean {
  if (!pwd) return false;
  return pwd.trim() === getAdminPassword().trim();
}

function readActiveSchemes(): SchemeRecord[] {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } else if (fs.existsSync(DEFAULT_SOURCE_PATH)) {
      const raw = fs.readFileSync(DEFAULT_SOURCE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
        fs.writeFileSync(DB_PATH, JSON.stringify(parsed));
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error reading active schemes from server storage:", e);
  }
  return [];
}

function writeActiveSchemes(schemes: SchemeRecord[]): void {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(schemes));
}

export const Route = createFileRoute("/api/schemes")({
  server: {
    handlers: {
      GET: async () => {
        const schemes = readActiveSchemes();
        return Response.json({
          schemes,
          count: schemes.length,
          timestamp: new Date().toISOString(),
        });
      },
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { password, action, schemes: newSchemes } = body;

          if (!verifyPassword(password)) {
            return Response.json(
              { error: "Unauthorized: Incorrect admin password." },
              { status: 401 },
            );
          }

          if (action === "reset") {
            if (fs.existsSync(DEFAULT_SOURCE_PATH)) {
              const defaultRaw = fs.readFileSync(DEFAULT_SOURCE_PATH, "utf-8");
              const defaultSchemes = JSON.parse(defaultRaw);
              writeActiveSchemes(defaultSchemes);
              return Response.json({
                success: true,
                count: defaultSchemes.length,
                message: `Database successfully reset to default authentic collection (${defaultSchemes.length} schemes).`,
                schemes: defaultSchemes,
              });
            }
            writeActiveSchemes([]);
            return Response.json({
              success: true,
              count: 0,
              message: "Default database file not found. Reset to empty database.",
              schemes: [],
            });
          }

          if (!Array.isArray(newSchemes)) {
            return Response.json(
              { error: "Invalid payload: 'schemes' must be an array." },
              { status: 400 },
            );
          }

          let updated: SchemeRecord[] = [];
          if (action === "replace") {
            updated = newSchemes;
            writeActiveSchemes(updated);
          } else {
            // Append mode
            const current = readActiveSchemes();
            const existingIds = new Set(current.map((s) => s.id?.toLowerCase()));
            const toAdd = newSchemes.filter((s) => !existingIds.has(s.id?.toLowerCase()));
            updated = [...current, ...toAdd];
            writeActiveSchemes(updated);
          }

          return Response.json({
            success: true,
            count: updated.length,
            message: `Successfully ${action === "replace" ? "replaced whole database with" : "appended"} ${newSchemes.length} schemes. Total active schemes now: ${updated.length}.`,
            schemes: updated,
          });
        } catch (error: any) {
          console.error("Error updating schemes database:", error);
          return Response.json(
            { error: error?.message || "Failed to update database" },
            { status: 500 },
          );
        }
      },
      DELETE: async ({ request }) => {
        try {
          let password = "";
          try {
            const body = await request.json();
            password = body?.password || "";
          } catch {
            const url = new URL(request.url);
            password = url.searchParams.get("password") || "";
          }

          if (!verifyPassword(password)) {
            return Response.json(
              { error: "Unauthorized: Incorrect admin password." },
              { status: 401 },
            );
          }

          // Completely wipe database to 0 schemes
          writeActiveSchemes([]);
          return Response.json({
            success: true,
            count: 0,
            message: "The entire website scheme database has been erased.",
            schemes: [],
          });
        } catch (error: any) {
          console.error("Error erasing schemes database:", error);
          return Response.json(
            { error: error?.message || "Failed to erase database" },
            { status: 500 },
          );
        }
      },
    },
  },
});
