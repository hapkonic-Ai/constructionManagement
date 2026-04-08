export type AppRole = "SA" | "CEO" | "CTO" | "CDO" | "COO" | "CMO" | "CFO";

export const ROLE_HOME: Record<AppRole, string> = {
  SA: "/superadmin",
  CEO: "/ceo",
  CTO: "/cto",
  CDO: "/cdo",
  COO: "/coo",
  CMO: "/cmo",
  CFO: "/cfo",
};

export const ROLE_PREFIX_ACCESS: Record<string, AppRole[]> = {
  "/superadmin": ["SA"],
  "/ceo": ["SA", "CEO"],
  "/cto": ["SA", "CTO"],
  "/cdo": ["SA", "CDO"],
  "/coo": ["SA", "COO"],
  "/cmo": ["SA", "CMO"],
  "/cfo": ["SA", "CFO"],
};
