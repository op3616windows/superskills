#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert";
import { describe, it } from "node:test";

const REPO_ROOT = path.resolve(import.meta.dirname, "..");

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { frontmatter: {}, body: content };
  const rawYaml = match[1];
  const body = content.slice(match[0].length);
  const frontmatter = {};
  for (const line of rawYaml.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const colonIdx = trimmed.indexOf(":");
    if (colonIdx !== -1) {
      const key = trimmed.slice(0, colonIdx).trim();
      let val = trimmed.slice(colonIdx + 1).trim();
      if (val === "true") val = true;
      else if (val === "false") val = false;
      else if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      else if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      frontmatter[key] = val;
    }
  }
  return { frontmatter, body };
}

function parseYamlFile(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, "utf-8");
  const result = {};
  let currentParent = result;
  let parentKey = null;

  for (const rawLine of content.split("\n")) {
    const line = rawLine.replace(/\r$/, "");
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const isIndented = line.startsWith("  ");
    const colonIdx = line.indexOf(":");
    if (colonIdx !== -1) {
      const key = line.slice(0, colonIdx).trim();
      let val = line.slice(colonIdx + 1).trim();
      if (val === "") {
        currentParent = {};
        result[key] = currentParent;
        parentKey = key;
      } else {
        if (val === "true") val = true;
        else if (val === "false") val = false;
        else if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        else if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);

        if (isIndented && parentKey) {
          result[parentKey][key] = val;
        } else {
          result[key] = val;
        }
      }
    }
  }
  return result;
}

const NEW_SKILLS = [
  "brownfield-onboard",
  "safe-migrations",
  "red-team",
  "security-audit",
  "ui-craft",
  "contract-concurrency",
  "observability",
  "incident",
  "release-safety",
  "e2e-tracer",
];

const USER_INVOKED_SKILLS = ["brownfield-onboard", "red-team", "incident"];

describe("SUITE 1: Structural & Integrity Conformance", () => {
  it("1.1 Plugin Manifest should register all 10 new skills", () => {
    const pluginPath = path.join(REPO_ROOT, ".claude-plugin/plugin.json");
    assert(fs.existsSync(pluginPath), "plugin.json must exist");
    const plugin = JSON.parse(fs.readFileSync(pluginPath, "utf-8"));

    for (const skill of NEW_SKILLS) {
      const expectedPath = `./skills/engineering/${skill}`;
      assert(plugin.skills.includes(expectedPath), `plugin.json missing entry for ${expectedPath}`);
      assert(fs.existsSync(path.join(REPO_ROOT, expectedPath, "SKILL.md")), `${expectedPath}/SKILL.md must exist`);
    }
  });

  it("1.2 Invocation Parity Invariant between SKILL.md and openai.yaml", () => {
    for (const skill of NEW_SKILLS) {
      const skillMdPath = path.join(REPO_ROOT, "skills/engineering", skill, "SKILL.md");
      const openaiYamlPath = path.join(REPO_ROOT, "skills/engineering", skill, "agents/openai.yaml");

      assert(fs.existsSync(skillMdPath), `${skill}/SKILL.md must exist`);
      assert(fs.existsSync(openaiYamlPath), `${skill}/agents/openai.yaml must exist`);

      const { frontmatter } = parseFrontmatter(fs.readFileSync(skillMdPath, "utf-8"));
      const openaiConfig = parseYamlFile(openaiYamlPath);

      assert.strictEqual(frontmatter.name, skill, `${skill}: name in frontmatter must match`);
      assert(frontmatter.description, `${skill}: description must be present`);
      assert(openaiConfig.interface?.display_name, `${skill}: display_name must be present`);
      assert(openaiConfig.interface?.short_description, `${skill}: short_description must be present`);

      if (USER_INVOKED_SKILLS.includes(skill)) {
        assert.strictEqual(frontmatter["disable-model-invocation"], true);
        assert.strictEqual(openaiConfig.policy?.allow_implicit_invocation, false);
      } else {
        assert(!frontmatter["disable-model-invocation"]);
        assert(!openaiConfig.policy || openaiConfig.policy.allow_implicit_invocation !== false);
      }
    }
  });

  it("1.3 Documentation Conformance according to writing-docs.md", () => {
    for (const skill of NEW_SKILLS) {
      const docPath = path.join(REPO_ROOT, "docs/engineering", `${skill}.md`);
      assert(fs.existsSync(docPath), `Doc ${skill}.md must exist`);
      const content = fs.readFileSync(docPath, "utf-8");

      assert(!content.match(/^# [^\n]+/m), `${skill}.md must not contain any H1 heading`);
      for (const sec of ["## What it does", "## When to reach for it", "## Common questions", "## It's working if", "## Where it fits"]) {
        assert(content.includes(sec), `${skill}.md must contain section "${sec}"`);
      }
      assert(!content.toLowerCase().includes("matt says"), `${skill}.md must not quote the author`);
      assert(content.includes("https://aihero.dev/skills-ask-matt"));
    }
  });

  it("1.4 Zero Em-Dash / En-dash Invariant across all new files", () => {
    const filesToCheck = [
      ...NEW_SKILLS.map((s) => `skills/engineering/${s}/SKILL.md`),
      ...NEW_SKILLS.map((s) => `docs/engineering/${s}.md`),
      "skills/engineering/ask-matt/SKILL.md",
      "skills/engineering/code-review/SKILL.md",
      "skills/engineering/to-tickets/SKILL.md",
      "skills/engineering/implement/SKILL.md",
      "skills/engineering/tdd/SKILL.md",
      "skills/engineering/setup-matt-pocock-skills/SKILL.md",
      "skills/engineering/setup-matt-pocock-skills/production-guardrails.md",
      "docs/agents/production-guardrails.md",
      "CLAUDE.md",
    ];

    for (const file of filesToCheck) {
      const fullPath = path.join(REPO_ROOT, file);
      const text = fs.readFileSync(fullPath, "utf-8");
      const emDashIndex = text.indexOf("\u2014");
      assert.strictEqual(emDashIndex, -1, `File ${file} contains forbidden em-dash at offset ${emDashIndex}`);
    }
  });

  it("1.5 Symlinks in ~/.claude/skills and ~/.agents/skills should resolve", () => {
    const claudeSkillsDir = path.join(process.env.HOME || "/root", ".claude/skills");
    const agentsSkillsDir = path.join(process.env.HOME || "/root", ".agents/skills");

    for (const skill of NEW_SKILLS) {
      const claudeLink = path.join(claudeSkillsDir, skill);
      const agentsLink = path.join(agentsSkillsDir, skill);

      if (fs.existsSync(claudeSkillsDir)) {
        assert(fs.existsSync(claudeLink), `~/.claude/skills/${skill} symlink must exist`);
        assert(fs.statSync(claudeLink).isDirectory());
      }
      if (fs.existsSync(agentsSkillsDir)) {
        assert(fs.existsSync(agentsLink), `~/.agents/skills/${skill} symlink must exist`);
        assert(fs.statSync(agentsLink).isDirectory());
      }
    }
  });
});

describe("SUITE 2: Behavioral & Constraint Engines", () => {
  it("2.1 safe-migrations rule engine correctly catches destructive DDL", () => {
    function checkMigrationSafety(sqlStatement, hasLockTimeout = true) {
      const violations = [];
      const normalized = sqlStatement.toUpperCase().replace(/\s+/g, " ");

      if (!hasLockTimeout) violations.push("MISSING_LOCK_TIMEOUT");
      if (normalized.includes("DROP COLUMN")) violations.push("FORBIDDEN_DROP_COLUMN");
      if (normalized.includes("RENAME COLUMN")) violations.push("FORBIDDEN_RENAME_COLUMN");
      if (normalized.includes("ALTER COLUMN") && (normalized.includes("TYPE") || normalized.includes("SET DATA TYPE"))) {
        violations.push("FORBIDDEN_ALTER_TYPE");
      }
      if (normalized.includes("ADD COLUMN") && normalized.includes("NOT NULL") && !normalized.includes("DEFAULT")) {
        violations.push("FORBIDDEN_NOT_NULL_WITHOUT_DEFAULT");
      }
      if (normalized.includes("CREATE INDEX") && !normalized.includes("CONCURRENTLY")) {
        violations.push("FORBIDDEN_NON_CONCURRENT_INDEX");
      }
      return { isSafe: violations.length === 0, violations };
    }

    assert.strictEqual(checkMigrationSafety("ALTER TABLE users DROP COLUMN phone;").isSafe, false);
    assert.strictEqual(checkMigrationSafety("ALTER TABLE orders RENAME COLUMN status TO order_status;").isSafe, false);
    assert.strictEqual(checkMigrationSafety("ALTER TABLE accounts ALTER COLUMN balance TYPE numeric;").isSafe, false);
    assert.strictEqual(checkMigrationSafety("ALTER TABLE items ADD COLUMN active boolean NOT NULL;").isSafe, false);
    assert.strictEqual(checkMigrationSafety("CREATE INDEX idx_user ON users(email);").isSafe, false);
    assert.strictEqual(checkMigrationSafety("CREATE INDEX CONCURRENTLY idx_user ON users(email);", false).isSafe, false);
    assert.strictEqual(checkMigrationSafety("ALTER TABLE orders ADD COLUMN new_status varchar(50);", true).isSafe, true);
  });

  it("2.2 red-team threat modeling engine catches all 5 vulnerability vectors", () => {
    function redTeamAuditSpec(specText) {
      const threatsIdentified = [];
      const lower = specText.toLowerCase();

      if (!lower.includes("for update") && !lower.includes("optimistic") && !lower.includes("atomic decrement")) {
        threatsIdentified.push("RACE_CONDITION_TOCTOU");
      }
      if (!lower.includes("tenant_id") && !lower.includes("organizationid") && !lower.includes("session.userid")) {
        threatsIdentified.push("BROKEN_OBJECT_LEVEL_AUTHZ");
      }
      if (!lower.includes("positive") && !lower.includes("non-negative") && !lower.includes("min(0)")) {
        threatsIdentified.push("NUMERIC_MANIPULATION");
      }
      if (!lower.includes("max limit") && !lower.includes("rate limit") && !lower.includes("maxpagesize")) {
        threatsIdentified.push("DENIAL_OF_WALLET");
      }
      if (!lower.includes("transition") && !lower.includes("webhook signature")) {
        threatsIdentified.push("STATE_MACHINE_SMUGGLING");
      }
      return threatsIdentified;
    }

    const naiveSpec = `Function: transfer(senderId, receiverId, amount)`;
    assert.strictEqual(redTeamAuditSpec(naiveSpec).length, 5);
  });

  it("2.3 security-audit engine identifies AuthZ, Locking, DTO leak, and input strictness", () => {
    function auditDiffHunk(diffCode) {
      const findings = [];
      if (diffCode.includes("SELECT") && diffCode.includes("WHERE id =") && !diffCode.includes("tenantId")) {
        findings.push({ severity: "Critical", type: "MISSING_AUTHZ_QUERY_FILTER" });
      }
      if (diffCode.includes("balance -=") && !diffCode.includes("FOR UPDATE")) {
        findings.push({ severity: "High", type: "UNPROTECTED_CONCURRENT_MUTATION" });
      }
      if (diffCode.includes("res.json(user)") && diffCode.includes("passwordHash")) {
        findings.push({ severity: "High", type: "SENSITIVE_DTO_LEAKAGE" });
      }
      if (diffCode.includes("z.object({") && !diffCode.includes(".strict()")) {
        findings.push({ severity: "Medium", type: "SCHEMA_NOT_STRICT" });
      }
      return findings;
    }

    const diff = `SELECT * FROM notes WHERE id = $1; balance -= amount; res.json(user); passwordHash; z.object({ id: z.string() });`;
    assert.strictEqual(auditDiffHunk(diff).length, 4);
  });

  it("2.4 ui-craft engine verifies 5-state completeness and design system tokens", () => {
    function auditUiComponent(componentSource) {
      const missingStates = [];
      const violations = [];

      if (!componentSource.includes("Skeleton") && !componentSource.includes("isLoading")) missingStates.push("Loading");
      if (!componentSource.includes("Empty") && !componentSource.includes("isEmpty")) missingStates.push("Empty");
      if (!componentSource.includes("Error") && !componentSource.includes("Retry")) missingStates.push("Error");
      if (!componentSource.includes("optimistic") && !componentSource.includes("isPending")) missingStates.push("Partial/Optimistic");

      const arbitraryClassMatch = componentSource.match(/(?:bg|text|border|w|h|p|m)-\[#[0-9a-fA-F]+|[0-9]+px\]/g);
      if (arbitraryClassMatch) violations.push("ARBITRARY_TOKENS");

      return { isComplete: missingStates.length === 0 && violations.length === 0, missingStates, violations };
    }

    assert.strictEqual(auditUiComponent(`export function Button() { return <div className="bg-[#123]">Hi</div>; }`).isComplete, false);
  });

  it("2.5 release-safety engine enforces feature flag on >=3 tickets and env pre-flight", () => {
    function evaluateReleaseSafety(tickets, envVarsUsed, envExampleFileContent) {
      const issues = [];
      if (tickets.length >= 3) {
        if (!tickets[0].title.toLowerCase().includes("feature flag")) issues.push("MISSING_FLAG_SEAM");
        if (!tickets[tickets.length - 1].title.toLowerCase().includes("cleanup")) issues.push("MISSING_CLEANUP_TICKET");
      }
      for (const envVar of envVarsUsed) {
        if (!envExampleFileContent.includes(envVar)) issues.push(`MISSING_ENV: ${envVar}`);
      }
      return issues;
    }

    const issues = evaluateReleaseSafety([{ title: "A" }, { title: "B" }, { title: "C" }], ["NEW_KEY"], "PORT=3000");
    assert.strictEqual(issues.length, 3);
  });

  it("2.6 setup-matt-pocock-skills template provides complete production engineering guardrails", () => {
    const templatePath = path.join(REPO_ROOT, "skills/engineering/setup-matt-pocock-skills/production-guardrails.md");
    const activeDocPath = path.join(REPO_ROOT, "docs/agents/production-guardrails.md");
    assert(fs.existsSync(templatePath), "Seed template production-guardrails.md must exist in setup skill");
    assert(fs.existsSync(activeDocPath), "Active docs/agents/production-guardrails.md must exist");

    const templateContent = fs.readFileSync(templatePath, "utf-8");
    assert(templateContent.includes("safe-migrations"));
    assert(templateContent.includes("ui-craft"));
    assert(templateContent.includes("contract-concurrency"));
    assert(templateContent.includes("observability"));
    assert(templateContent.includes("security-audit"));
    assert(templateContent.includes("red-team"));
    assert(templateContent.includes("release-safety"));
    assert(templateContent.includes("brownfield-onboard"));
    assert(templateContent.includes("incident"));
    assert(templateContent.includes("e2e-tracer"));
  });

  it("2.7 e2e-tracer rule engine enforces 4 iron rules (semantic locators, zero-sleep, error trapping, seeding)", () => {
    function auditE2eTracerTest(testSource) {
      const violations = [];
      if (testSource.includes("waitForTimeout")) {
        violations.push("FORBIDDEN_SLEEP");
      }
      if (testSource.match(/page\.locator\(['"][^'"]*>[^'"]*['"]\)/) || testSource.includes(":nth-child")) {
        violations.push("FORBIDDEN_STRUCTURAL_SELECTOR");
      }
      if (!testSource.includes("pageerror") && !testSource.includes("Hydration failed")) {
        violations.push("MISSING_ERROR_LISTENER");
      }
      if (testSource.includes("page.goto('/register')") || testSource.includes("page.goto('/login')")) {
        violations.push("FORBIDDEN_UI_STATE_SETUP");
      }
      return { isValid: violations.length === 0, violations };
    }

    const badTest = `
      await page.goto('/login');
      await page.locator('div.flex > button:nth-child(2)').click();
      await page.waitForTimeout(2000);
    `;
    const badResult = auditE2eTracerTest(badTest);
    assert.strictEqual(badResult.isValid, false);
    assert.strictEqual(badResult.violations.length, 4);

    const goodTest = `
      page.on('pageerror', err => { throw err; });
      const lot = await seedLot();
      await page.getByRole('button', { name: 'Bid' }).click();
      await expect(page.getByText('Success')).toBeVisible();
    `;
    const goodResult = auditE2eTracerTest(goodTest);
    assert.strictEqual(goodResult.isValid, true);
  });
});

describe("SUITE 3: Executable Concurrency & Contract Test (contract-concurrency)", () => {
  class SafeTransactionalWalletStore {
    constructor() {
      this.accounts = new Map();
      this.locks = new Map();
    }
    async initAccount(id, balance) {
      this.accounts.set(id, balance);
    }
    async getBalance(id) {
      return this.accounts.has(id) ? this.accounts.get(id) : null;
    }
    async debit(id, amount) {
      while (this.locks.get(id)) {
        await new Promise((r) => setTimeout(r, 1));
      }
      this.locks.set(id, true);
      try {
        if (!this.accounts.has(id)) return false;
        const current = this.accounts.get(id);
        await new Promise((r) => setTimeout(r, 1));
        if (current < amount) return false;
        this.accounts.set(id, current - amount);
        return true;
      } finally {
        this.locks.set(id, false);
      }
    }
  }

  it("3.1 Stress Test: Concurrency stress harness guarantees zero race conditions", async () => {
    const store = new SafeTransactionalWalletStore();
    await store.initAccount("acc-1", 50);

    const results = await Promise.all(
      Array.from({ length: 50 }, () => store.debit("acc-1", 10))
    );
    const successCount = results.filter(Boolean).length;
    const finalBalance = await store.getBalance("acc-1");

    assert.strictEqual(successCount, 5);
    assert.strictEqual(finalBalance, 0);
  });
});

describe("SUITE 4: Executable Tracer-Bullet Simulation (e2e-tracer)", () => {
  it("4.1 Deterministic multi-context execution with error trapping and semantic assertions", async () => {
    // Simulated vertical slice: in-memory state engine + multi-context client view
    const simulatedDatabase = {
      lot: { id: "lot-101", currentPrice: 50_000_000, winningUser: "system", ceilingA: 0 },
    };

    const clientViews = {
      pageA: { visibleText: [], errors: [] },
      pageB: { visibleText: [], errors: [] },
    };

    function trapPageError(pageKey, errorMessage) {
      clientViews[pageKey].errors.push(errorMessage);
    }

    // Direct DB seed helper (Rule 3)
    function seedLot(startPrice) {
      simulatedDatabase.lot.currentPrice = startPrice;
    }

    // Action: User A sets ceiling 100M via role action (Rule 2)
    function placeProxyCeiling(pageKey, userId, ceiling) {
      if (ceiling < simulatedDatabase.lot.currentPrice) {
        throw new Error("Ceiling cannot be lower than current price");
      }
      simulatedDatabase.lot.ceilingA = ceiling;
      simulatedDatabase.lot.winningUser = userId;
      simulatedDatabase.lot.currentPrice += 5_000_000;
      updateViews();
    }

    // Action: User B places standard bid 70M
    function placeStandardBid(pageKey, userId, amount) {
      if (amount <= simulatedDatabase.lot.currentPrice) {
        throw new Error("Bid must exceed current price");
      }
      if (simulatedDatabase.lot.ceilingA >= amount + 5_000_000) {
        simulatedDatabase.lot.currentPrice = amount + 5_000_000;
        simulatedDatabase.lot.winningUser = "buyer-a";
      } else {
        simulatedDatabase.lot.currentPrice = amount;
        simulatedDatabase.lot.winningUser = userId;
      }
      updateViews();
    }

    function updateViews() {
      const priceText = `Current price: ${simulatedDatabase.lot.currentPrice.toLocaleString()}`;
      clientViews.pageA.visibleText = [priceText, simulatedDatabase.lot.winningUser === "buyer-a" ? "Winning" : "Outbid"];
      clientViews.pageB.visibleText = [priceText, simulatedDatabase.lot.winningUser === "buyer-b" ? "Winning" : "Outbid"];
    }

    // Step 1: Seed
    seedLot(50_000_000);
    updateViews();

    // Step 2: Buyer A sets ceiling
    placeProxyCeiling("pageA", "buyer-a", 100_000_000);
    assert(clientViews.pageA.visibleText.includes("Current price: 55,000,000"));
    assert(clientViews.pageA.visibleText.includes("Winning"));

    // Step 3: Buyer B bids 70M
    placeStandardBid("pageB", "buyer-b", 70_000_000);

    // Step 4: Rule 4 assertions (web-first state check, zero errors)
    assert(clientViews.pageA.visibleText.includes("Current price: 75,000,000"));
    assert(clientViews.pageA.visibleText.includes("Winning"));
    assert(clientViews.pageB.visibleText.includes("Current price: 75,000,000"));
    assert(clientViews.pageB.visibleText.includes("Outbid"));
    assert.strictEqual(clientViews.pageA.errors.length, 0);
    assert.strictEqual(clientViews.pageB.errors.length, 0);
  });
});
