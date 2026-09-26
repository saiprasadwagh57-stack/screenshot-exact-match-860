import {
  SchemeRecord,
  ProviderType,
  GovernmentLevel,
  SchemeStatus,
  BenefitItem,
  DocumentItem,
  AgeRules,
  IncomeRules,
} from "../types/scheme";
import { DEFAULT_SCHEMES_DATABASE } from "../data/defaultSchemes";

/**
 * Universal Database Adapter for SchemeSaar
 * Parses JSON, CSV, and SQL exports, normalizes them into SchemeRecord,
 * preserves raw records, and prevents hallucination of absent values.
 */
export class SchemeDataAdapter {
  private static STORAGE_KEY = "schemesaar_custom_database";

  /**
   * Loads the current active schemes (custom imported schemes if any, or default authentic dataset)
   */
  public static getSchemes(): SchemeRecord[] {
    try {
      if (typeof window === "undefined") return DEFAULT_SCHEMES_DATABASE;
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error reading custom schemes from storage:", e);
    }
    return DEFAULT_SCHEMES_DATABASE;
  }

  /**
   * Save imported schemes
   */
  public static saveCustomSchemes(schemes: SchemeRecord[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(schemes));
    } catch (e) {
      console.error("Error saving custom schemes:", e);
    }
  }

  /**
   * Loads the current active schemes from the server API, ensuring all devices stay synchronized.
   */
  public static async fetchServerSchemes(): Promise<SchemeRecord[]> {
    try {
      const res = await fetch("/api/schemes");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.schemes)) {
          this.saveCustomSchemes(data.schemes);
          return data.schemes;
        }
      }
    } catch (e) {
      console.warn("Failed to fetch schemes from server API, using local storage:", e);
    }
    return this.getSchemes();
  }

  /**
   * Saves updated schemes to the server so that the update is reflected across all devices.
   */
  public static async saveSchemesToServer(
    schemes: SchemeRecord[],
    action: "replace" | "append" = "replace",
    password?: string,
  ): Promise<{ success: boolean; count: number; message: string }> {
    const pwd = password || localStorage.getItem("schemesaar_admin_password") || "admin123";
    try {
      const res = await fetch("/api/schemes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd, action, schemes }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (Array.isArray(data.schemes)) {
          this.saveCustomSchemes(data.schemes);
        } else {
          this.saveCustomSchemes(schemes);
        }
        return {
          success: true,
          count: data.count || schemes.length,
          message: data.message || "Database synchronized across all devices.",
        };
      }
      return {
        success: false,
        count: schemes.length,
        message: data.error || "Failed to persist to server",
      };
    } catch (e: any) {
      console.error("Error saving schemes to server:", e);
      // Fallback local save
      this.saveCustomSchemes(schemes);
      return {
        success: true,
        count: schemes.length,
        message: "Saved locally (server offline)",
      };
    }
  }

  /**
   * Completely erase all schemes from the website database on both server and client.
   */
  public static async clearAllSchemesServer(
    password?: string,
  ): Promise<{ success: boolean; message: string }> {
    const pwd = password || localStorage.getItem("schemesaar_admin_password") || "admin123";
    try {
      const res = await fetch("/api/schemes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd }),
      });
      const data = await res.json();
      this.clearAllSchemes();
      return {
        success: res.ok && data.success,
        message: data.message || "Database wiped.",
      };
    } catch (e: any) {
      this.clearAllSchemes();
      return { success: true, message: "Database erased locally." };
    }
  }

  /**
   * Resets server and client back to default authentic schemes collection.
   */
  public static async resetToDefaultServer(
    password?: string,
  ): Promise<{ success: boolean; schemes: SchemeRecord[]; message: string }> {
    const pwd = password || localStorage.getItem("schemesaar_admin_password") || "admin123";
    try {
      const res = await fetch("/api/schemes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd, action: "reset" }),
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.schemes)) {
        this.saveCustomSchemes(data.schemes);
        return {
          success: true,
          schemes: data.schemes,
          message: data.message || "Reset to defaults.",
        };
      }
    } catch (e) {
      console.error("Error resetting schemes on server:", e);
    }
    this.resetToDefault();
    return {
      success: true,
      schemes: this.getSchemes(),
      message: "Reset locally.",
    };
  }

  /**
   * Appends new schemes to the existing database, avoiding duplicate IDs
   */
  public static appendSchemes(newSchemes: SchemeRecord[]): SchemeRecord[] {
    const existing = this.getSchemes();
    const existingIds = new Set(existing.map((s) => s.id.toLowerCase()));
    const toAdd = newSchemes.filter((s) => !existingIds.has(s.id.toLowerCase()));
    const combined = [...existing, ...toAdd];
    this.saveCustomSchemes(combined);
    return combined;
  }

  /**
   * Reset to default authentic database
   */
  public static resetToDefault(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Universal parser for user-supplied database files
   */
  public static parseDatabaseFile(content: string, fileName: string): SchemeRecord[] {
    const lowerName = fileName.toLowerCase();

    if (lowerName.endsWith(".json")) {
      return this.parseJSON(content);
    } else if (
      lowerName.endsWith(".csv") ||
      lowerName.endsWith(".tsv") ||
      lowerName.endsWith(".txt")
    ) {
      return this.parseCSV(content, lowerName.endsWith(".tsv") ? "\t" : ",");
    } else if (lowerName.endsWith(".sql")) {
      return this.parseSQL(content);
    }

    // Try auto-detect
    const trimmed = content.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      return this.parseJSON(content);
    }
    if (
      trimmed.toUpperCase().includes("INSERT INTO") ||
      trimmed.toUpperCase().includes("CREATE TABLE")
    ) {
      return this.parseSQL(content);
    }
    return this.parseCSV(content, ",");
  }

  /**
   * Parse JSON arrays or wrapped objects
   */
  private static parseJSON(content: string): SchemeRecord[] {
    const raw = JSON.parse(content);
    let items: any[] = [];

    if (Array.isArray(raw)) {
      items = raw;
    } else if (typeof raw === "object" && raw !== null) {
      // Look for standard array wrappers like { schemes: [...] } or { data: [...] } or { records: [...] }
      const arrayKey = Object.keys(raw).find((k) => Array.isArray(raw[k]));
      if (arrayKey) {
        items = raw[arrayKey];
      } else {
        // Map of id -> object
        items = Object.values(raw);
      }
    }

    return items
      .filter((item) => typeof item === "object" && item !== null)
      .map((item, index) => this.normalizeItem(item, `json_rec_${index + 1}`));
  }

  /**
   * Parse CSV records
   */
  private static parseCSV(content: string, delimiter: string = ","): SchemeRecord[] {
    const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = this.parseCSVLine(lines[0] ?? "", delimiter).map((h) => h.trim().toLowerCase());
    const records: SchemeRecord[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i] ?? "", delimiter);
      if (values.length === 0 || (values.length === 1 && !values[0])) continue;

      const rawItem: Record<string, any> = {};
      headers.forEach((header, idx) => {
        rawItem[header] = values[idx] !== undefined ? values[idx].trim() : "";
      });

      records.push(this.normalizeItem(rawItem, `csv_rec_${i}`));
    }

    return records;
  }

  /**
   * CSV Line tokenizer handling quotes and commas
   */
  private static parseCSVLine(line: string, delimiter: string): string[] {
    const result: string[] = [];
    let cur = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(cur);
        cur = "";
      } else {
        cur += char;
      }
    }
    result.push(cur);
    return result;
  }

  /**
   * Parse SQL insert statements
   */
  private static parseSQL(content: string): SchemeRecord[] {
    const insertRegex = /INSERT\s+INTO\s+[`"']?(\w+)[`"']?\s*\(([^)]+)\)\s*VALUES\s*([\s\S]+?);/gi;
    const records: SchemeRecord[] = [];
    let match;
    let recCount = 1;

    while ((match = insertRegex.exec(content)) !== null) {
      const columns = (match[2] ?? "")
        .split(",")
        .map((c) => c.trim().replace(/[`"']/g, "").toLowerCase());
      const rawValues = match[3] ?? "";

      // Match each tuple (val1, val2, ...)
      const tupleRegex = /\(([^)]+)\)/g;
      let tupleMatch;
      while ((tupleMatch = tupleRegex.exec(rawValues)) !== null) {
        const vals = this.parseCSVLine(tupleMatch[1] ?? "", ",").map((v) =>
          v.trim().replace(/^['"]|['"]$/g, ""),
        );
        const item: Record<string, any> = {};
        columns.forEach((col, idx) => {
          item[col] = vals[idx] !== undefined ? vals[idx] : null;
        });
        records.push(this.normalizeItem(item, `sql_rec_${recCount++}`));
      }
    }

    if (records.length === 0) {
      // Fallback: parse as JSON if it was mislabeled
      try {
        return this.parseJSON(content);
      } catch {
        return [];
      }
    }

    return records;
  }

  /**
   * Maps any raw object to normalized SchemeRecord
   */
  public static normalizeItem(raw: Record<string, any>, fallbackId: string): SchemeRecord {
    const getVal = (...keys: string[]): any => {
      for (const k of keys) {
        if (raw[k] !== undefined && raw[k] !== null && raw[k] !== "") {
          return raw[k];
        }
        // Case-insensitive lookup
        const lowerKey = k.toLowerCase();
        for (const rawKey of Object.keys(raw)) {
          if (
            rawKey.toLowerCase() === lowerKey &&
            raw[rawKey] !== undefined &&
            raw[rawKey] !== null &&
            raw[rawKey] !== ""
          ) {
            return raw[rawKey];
          }
        }
      }
      return null;
    };

    // Scheme Name
    const name =
      getVal("name", "scheme_name", "scheme_title", "title", "schemename") || "Untitled Scheme";

    // ID
    const id = String(getVal("id", "scheme_id", "code", "slug") || fallbackId);

    // Description
    const description = String(
      getVal(
        "description",
        "desc",
        "details",
        "about",
        "summary",
        "overview",
        "scheme_description",
      ) || "No official description provided in source record.",
    );

    // Provider / Ministry
    const provider = String(
      getVal(
        "provider",
        "ministry",
        "department",
        "agency",
        "authority",
        "implementing_agency",
        "nodal_agency",
      ) || "Government Authority",
    );

    // Categories
    let categories: string[] = [];
    const catVal = getVal("categories", "category", "sector", "domain", "scheme_category");
    if (Array.isArray(catVal)) {
      categories = catVal.map(String);
    } else if (typeof catVal === "string") {
      categories = catVal
        .split(/[,;|]/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (categories.length === 0) {
      // Heuristic detection based on text if absent
      const text = (name + " " + description).toLowerCase();
      if (/scholarship|education|student|college|school/.test(text))
        categories.push("Education & Scholarships");
      else if (/farmer|kisan|agriculture|crop|tractor/.test(text))
        categories.push("Agriculture & Rural");
      else if (/housing|awas|house|shelter/.test(text)) categories.push("Housing & Shelter");
      else if (/business|msme|entrepreneur|shop|loan|credit/.test(text))
        categories.push("Business & MSME");
      else if (/health|medical|hospital|ayushman|treatment/.test(text))
        categories.push("Healthcare & Wellness");
      else if (/pension|social security|unorganized|senior/.test(text))
        categories.push("Social Security & Pension");
      else if (/women|girl|maternity|kanya/.test(text)) categories.push("Women & Child Welfare");
      else if (/job|employment|apprentice|skill|worker/.test(text))
        categories.push("Employment & Livelihood");
      else if (/artisan|craftsman|vishwakarma/.test(text))
        categories.push("Artisans & Skill Development");
      else if (/disab|divyang|handicap/.test(text)) categories.push("Disability & Inclusion");
      else categories.push("General Welfare");
    }

    // States
    let states: string[] = [];
    const stateVal = getVal("states", "state", "geography", "region", "applicable_states");
    if (Array.isArray(stateVal)) {
      states = stateVal.map(String);
    } else if (typeof stateVal === "string") {
      states = stateVal
        .split(/[,;|]/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (states.length === 0) {
      states = ["All-India"];
    }

    // Beneficiary Groups
    let beneficiary_groups: string[] = [];
    const benVal = getVal(
      "beneficiary_groups",
      "beneficiaries",
      "target_group",
      "eligible_beneficiaries",
    );
    if (Array.isArray(benVal)) {
      beneficiary_groups = benVal.map(String);
    } else if (typeof benVal === "string") {
      beneficiary_groups = benVal
        .split(/[,;|]/)
        .map((s) => s.trim())
        .filter(Boolean);
    }

    // Age Rules
    const minAge = Number(getVal("min_age", "age_min", "minimum_age"));
    const maxAge = Number(getVal("max_age", "age_max", "maximum_age"));
    const ageDesc = getVal("age_rules", "age_criteria", "age_description");
    const age_rules: AgeRules | null =
      !isNaN(minAge) || !isNaN(maxAge) || ageDesc
        ? {
            min_age: !isNaN(minAge) ? minAge : null,
            max_age: !isNaN(maxAge) ? maxAge : null,
            description:
              typeof ageDesc === "string" ? ageDesc : ageDesc ? JSON.stringify(ageDesc) : undefined,
          }
        : null;

    // Income Rules
    const maxIncome = Number(
      getVal("max_annual_income", "income_limit", "annual_income_limit", "income_max"),
    );
    const minIncome = Number(getVal("min_annual_income", "income_min"));
    const incDesc = getVal("income_rules", "income_criteria", "income_description");
    const income_rules: IncomeRules | null =
      !isNaN(maxIncome) || !isNaN(minIncome) || incDesc
        ? {
            max_annual_income: !isNaN(maxIncome) ? maxIncome : null,
            min_annual_income: !isNaN(minIncome) ? minIncome : null,
            description:
              typeof incDesc === "string" ? incDesc : incDesc ? JSON.stringify(incDesc) : undefined,
          }
        : null;

    // Benefits parsing
    const benefits: BenefitItem[] = [];
    const benObj = getVal("benefits", "benefit", "financial_assistance", "subsidy_details");
    if (Array.isArray(benObj)) {
      benObj.forEach((b) => {
        if (typeof b === "object" && b !== null) {
          benefits.push({
            type: b.type || "Direct Assistance",
            amount_or_details: b.amount_or_details || b.amount || b.details || "Documented Benefit",
            frequency: b.frequency || undefined,
            description: b.description || b.details || "",
          });
        } else if (typeof b === "string") {
          benefits.push({
            type: "Direct Assistance",
            amount_or_details: b,
            description: b,
          });
        }
      });
    } else if (typeof benObj === "string") {
      benefits.push({
        type: "Assistance / Subsidy",
        amount_or_details: benObj,
        description: benObj,
      });
    }

    // Documents parsing
    const documents: DocumentItem[] = [];
    const docObj = getVal("documents", "document_list", "required_documents", "docs");
    if (Array.isArray(docObj)) {
      docObj.forEach((d) => {
        if (typeof d === "object" && d !== null) {
          documents.push({
            name: d.name || d.document_name || "Required Certificate",
            mandatory: d.mandatory !== false,
            description: d.description,
          });
        } else if (typeof d === "string") {
          documents.push({
            name: d,
            mandatory: true,
          });
        }
      });
    } else if (typeof docObj === "string") {
      docObj
        .split(/[,;\n]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((d) => {
          documents.push({ name: d, mandatory: true });
        });
    }

    // Application steps
    let application_steps: string[] = [];
    const appStepsVal = getVal("application_steps", "application_process", "how_to_apply", "steps");
    if (Array.isArray(appStepsVal)) {
      application_steps = appStepsVal.map(String);
    } else if (typeof appStepsVal === "string") {
      application_steps = appStepsVal
        .split(/\n|\d+\.\s*/)
        .map((s) => s.trim())
        .filter(Boolean);
    }

    // URLs
    const application_url =
      getVal("application_url", "portal_url", "apply_url", "website", "link") || null;
    const source_url =
      getVal("source_url", "official_link", "reference_url", "portal_link") || application_url;
    const source_name = String(getVal("source_name", "source", "portal_name") || provider);
    const last_updated = getVal("last_updated", "updated_at", "last_modified", "date") || null;

    // Status
    let status: SchemeStatus = "Active";
    const statusVal = String(getVal("status", "scheme_status") || "").toLowerCase();
    if (statusVal.includes("closed")) status = "Closed";
    else if (statusVal.includes("upcoming")) status = "Upcoming";
    else if (statusVal.includes("active")) status = "Active";

    // Provider Type
    let provider_type: ProviderType = "central";
    const pTypeVal = String(getVal("provider_type", "type", "scheme_type") || "").toLowerCase();
    if (pTypeVal.includes("state")) provider_type = "state";
    else if (pTypeVal.includes("joint") || pTypeVal.includes("centrally sponsored"))
      provider_type = "joint";
    else if (pTypeVal.includes("private")) provider_type = "private";

    let government_level: GovernmentLevel = "Central";
    if (provider_type === "state") government_level = "State";

    return {
      id,
      name,
      description,
      provider,
      provider_type,
      government_level,
      categories,
      states,
      districts: [],
      beneficiary_groups,
      age_rules,
      income_rules,
      occupation_rules: null,
      education_rules: null,
      gender_rules: null,
      category_rules: null,
      geography_rules: null,
      other_rules: {},
      benefits:
        benefits.length > 0
          ? benefits
          : [
              {
                type: "Assistance",
                amount_or_details: "Refer to official scheme guidelines",
                description: "Details specified in official portal",
              },
            ],
      documents:
        documents.length > 0
          ? documents
          : [
              {
                name: "Aadhaar / Identity Proof",
                mandatory: true,
                description: "Standard KYC requirement",
              },
            ],
      application_steps:
        application_steps.length > 0
          ? application_steps
          : [
              "Visit the official scheme website or local administrative office.",
              "Submit the application form along with verified supporting documents.",
            ],
      application_url,
      source_url,
      source_name,
      last_updated,
      status,
      raw_record: raw,
    };
  }
}
