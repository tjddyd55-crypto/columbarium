/**
 * Supabase DB audit – run: node scripts/audit-db.mjs
 * Requires .env with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnv() {
  const path = resolve(root, ".env");
  if (!existsSync(path)) return {};
  const content = readFileSync(path, "utf8");
  const out = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const m = trimmed.match(/^([^#=]+)=(.*)$/);
    if (m) out[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return out;
}

const env = loadEnv();
const url = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const result = {
  connection: null,
  envFile: existsSync(resolve(root, ".env")),
  envVars: !!(url && key),
  waitlistSelect: null,
  contractsSelect: null,
  waitlistInsert: null,
  waitlistCount: null,
  errors: [],
};

function log(msg) {
  console.log(msg);
}

async function run() {
  log("=== Supabase DB Audit ===\n");

  if (!result.envFile) {
    result.errors.push(".env file missing");
    log("❌ .env file not found. Copy .env.example to .env and set VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY");
  } else {
    log("✅ .env file exists");
  }

  if (!url || !key) {
    result.errors.push("VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY undefined");
    log("❌ VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is undefined");
    printSummary();
    process.exit(1);
  }
  log("✅ Env vars present (URL and ANON_KEY)\n");

  const supabase = createClient(url, key);
  result.connection = "ok";

  // 1) Select waitlist
  try {
    const { data, error } = await supabase.from("waitlist").select("*").limit(1);
    if (error) throw error;
    result.waitlistSelect = "ok";
    log("✅ waitlist table: select works");
  } catch (e) {
    result.waitlistSelect = "fail";
    result.errors.push("waitlist select: " + e.message);
    log("❌ waitlist select: " + e.message);
  }

  // 2) Select contracts
  try {
    const { data, error } = await supabase.from("contracts").select("*").limit(1);
    if (error) throw error;
    result.contractsSelect = "ok";
    log("✅ contracts table: select works");
  } catch (e) {
    result.contractsSelect = "fail";
    result.errors.push("contracts select: " + e.message);
    log("❌ contracts select: " + e.message);
  }

  // 3) Count waitlist
  try {
    const { count, error } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true });
    if (error) throw error;
    result.waitlistCount = count !== null ? "ok" : "fail";
    if (result.waitlistCount === "ok") log("✅ waitlist count query: " + count);
    else {
      result.errors.push("waitlist count returned null");
      log("❌ waitlist count returned null");
    }
  } catch (e) {
    result.waitlistCount = "fail";
    result.errors.push("waitlist count: " + e.message);
    log("❌ waitlist count: " + e.message);
  }

  // 4) Insert test (then we don't delete to avoid side effects; optional: delete by id if you want)
  try {
    const { data, error } = await supabase.from("waitlist").insert([
      { seat_id: "AUDIT-TEST", user_name: "test", user_phone: "000" },
    ]).select("id").single();
    if (error) throw error;
    result.waitlistInsert = "ok";
    log("✅ waitlist insert: works (test row id: " + (data?.id ?? "n/a") + ")");
    if (data?.id) {
      await supabase.from("waitlist").delete().eq("id", data.id);
    }
  } catch (e) {
    result.waitlistInsert = "fail";
    result.errors.push("waitlist insert: " + e.message);
    log("❌ waitlist insert: " + e.message);
  }

  printSummary();
  process.exit(result.errors.length ? 1 : 0);
}

function printSummary() {
  log("\n--- Diagnosis ---");
  log("connection:    " + (result.connection ? "✅ OK" : "❌ broken"));
  log("tables exist:  " + (result.waitlistSelect === "ok" && result.contractsSelect === "ok" ? "✅ yes" : "❌ missing or error"));
  log("insert works:  " + (result.waitlistInsert === "ok" ? "✅ yes" : "❌ blocked"));
  log("select/count:  " + (result.waitlistCount === "ok" ? "✅ yes" : "❌ config/RLS issue"));
  log("RLS:           (check Supabase dashboard; if insert/select fail, add policy or disable RLS for dev)");
  if (result.errors.length) log("\nErrors: " + result.errors.join("; "));
}

run();
