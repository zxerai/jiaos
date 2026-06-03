import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { loadProjectConfig } from "../utils/config-loader.js";

const ENV_KEYS = [
  "NOVELIX_LLM_SERVICE",
  "NOVELIX_LLM_PROVIDER",
  "NOVELIX_LLM_BASE_URL",
  "NOVELIX_LLM_MODEL",
  "NOVELIX_LLM_API_KEY",
  "NOVELIX_LLM_TEMPERATURE",
  "NOVELIX_LLM_THINKING_BUDGET",
  "NOVELIX_LLM_API_FORMAT",
  "NOVELIX_LLM_STREAM",
  "NOVELIX_LLM_EXTRA_top_p",
  "NOVELIX_DEFAULT_LANGUAGE",
] as const;

describe("loadProjectConfig local provider auth", () => {
  let root = "";
  const previousEnv = new Map<string, string | undefined>();

  afterEach(async () => {
    for (const key of ENV_KEYS) {
      const previous = previousEnv.get(key);
      if (previous === undefined) delete process.env[key];
      else process.env[key] = previous;
    }
    previousEnv.clear();

    if (root) {
      await rm(root, { recursive: true, force: true });
      root = "";
    }
  });

  it("allows missing API keys for localhost OpenAI-compatible endpoints", async () => {
    root = await mkdtemp(join(tmpdir(), "novelix-config-loader-local-"));
    for (const key of ENV_KEYS) {
      previousEnv.set(key, process.env[key]);
      process.env[key] = "";
    }

    await writeFile(join(root, "novelix.json"), JSON.stringify({
      name: "local-project",
      version: "0.1.0",
      llm: {
        provider: "openai",
        baseUrl: "http://127.0.0.1:11434/v1",
        model: "gpt-oss:20b",
      },
    }, null, 2), "utf-8");
    await writeFile(join(root, ".env"), "", "utf-8");

    const config = await loadProjectConfig(root);

    expect(config.llm.baseUrl).toBe("http://127.0.0.1:11434/v1");
    expect(config.llm.model).toBe("gpt-oss:20b");
    expect(config.llm.apiKey).toBe("");
  });

  it("still requires API keys for remote hosted endpoints", async () => {
    root = await mkdtemp(join(tmpdir(), "novelix-config-loader-remote-"));
    for (const key of ENV_KEYS) {
      previousEnv.set(key, process.env[key]);
      process.env[key] = "";
    }

    await writeFile(join(root, "novelix.json"), JSON.stringify({
      name: "remote-project",
      version: "0.1.0",
      llm: {
        provider: "openai",
        baseUrl: "https://api.openai.com/v1",
        model: "gpt-5.4",
      },
    }, null, 2), "utf-8");
    await writeFile(join(root, ".env"), "", "utf-8");
    await expect(loadProjectConfig(root)).rejects.toThrow(/NOVELIX_LLM_API_KEY not set/i);
  });

  it("loads service-based config using defaultModel and project secrets", async () => {
    root = await mkdtemp(join(tmpdir(), "novelix-config-loader-services-"));
    for (const key of ENV_KEYS) {
      previousEnv.set(key, process.env[key]);
      process.env[key] = "";
    }

    await writeFile(join(root, "novelix.json"), JSON.stringify({
      name: "service-project",
      version: "0.1.0",
      language: "zh",
      llm: {
        services: [
          { service: "moonshot", temperature: 1, maxTokens: 4096 },
        ],
        defaultModel: "kimi-k2.5",
      },
      notify: [],
    }, null, 2), "utf-8");
    await mkdir(join(root, ".novelix"), { recursive: true });
    await writeFile(
      join(root, ".novelix", "secrets.json"),
      JSON.stringify({ services: { moonshot: { apiKey: "sk-moon" } } }, null, 2),
      "utf-8",
    );

    const config = await loadProjectConfig(root, { consumer: "studio" });

    expect(config.llm.service).toBe("moonshot");
    expect(config.llm.provider).toBe("openai");
    expect(config.llm.baseUrl).toBe("https://api.moonshot.cn/v1");
    expect(config.llm.model).toBe("kimi-k2.5");
    expect(config.llm.apiKey).toBe("sk-moon");
    expect(config.llm.temperature).toBe(1);
  });

  it("derives provider/baseUrl from the MiniMax preset single source of truth", async () => {
    root = await mkdtemp(join(tmpdir(), "novelix-config-loader-minimax-"));
    for (const key of ENV_KEYS) {
      previousEnv.set(key, process.env[key]);
      process.env[key] = "";
    }

    await writeFile(join(root, "novelix.json"), JSON.stringify({
      name: "minimax-project",
      version: "0.1.0",
      language: "zh",
      llm: {
        services: [
          { service: "minimax", temperature: 0.9, maxTokens: 4096 },
        ],
        defaultModel: "MiniMax-M2.7",
      },
      notify: [],
    }, null, 2), "utf-8");
    await mkdir(join(root, ".novelix"), { recursive: true });
    await writeFile(
      join(root, ".novelix", "secrets.json"),
      JSON.stringify({ services: { minimax: { apiKey: "sk-minimax" } } }, null, 2),
      "utf-8",
    );

    const config = await loadProjectConfig(root);

    expect(config.llm.service).toBe("minimax");
    expect(config.llm.provider).toBe("openai");
    expect(config.llm.baseUrl).toBe("https://api.minimaxi.com/v1");
    expect(config.llm.model).toBe("MiniMax-M2.7");
    expect(config.llm.apiKey).toBe("sk-minimax");
  });

  it("loads custom service config using custom secret key and entry baseUrl", async () => {
    root = await mkdtemp(join(tmpdir(), "novelix-config-loader-custom-"));
    for (const key of ENV_KEYS) {
      previousEnv.set(key, process.env[key]);
      process.env[key] = "";
    }

    await writeFile(join(root, "novelix.json"), JSON.stringify({
      name: "custom-project",
      version: "0.1.0",
      language: "zh",
      llm: {
        services: [
          { service: "custom", name: "内网GPT", baseUrl: "https://llm.internal.corp/v1", temperature: 0.9, apiFormat: "responses", stream: false },
        ],
        defaultModel: "corp-chat",
      },
      notify: [],
    }, null, 2), "utf-8");
    await mkdir(join(root, ".novelix"), { recursive: true });
    await writeFile(
      join(root, ".novelix", "secrets.json"),
      JSON.stringify({ services: { "custom:内网GPT": { apiKey: "sk-corp" } } }, null, 2),
      "utf-8",
    );

    const config = await loadProjectConfig(root);

    expect(config.llm.service).toBe("custom");
    expect(config.llm.provider).toBe("custom");
    expect(config.llm.baseUrl).toBe("https://llm.internal.corp/v1");
    expect(config.llm.model).toBe("corp-chat");
    expect(config.llm.apiKey).toBe("sk-corp");
    expect(config.llm.temperature).toBe(0.9);
    expect(config.llm.apiFormat).toBe("responses");
    expect(config.llm.stream).toBe(false);
  });

  it("keeps Studio config active when llm.configSource is studio", async () => {
    root = await mkdtemp(join(tmpdir(), "novelix-config-loader-studio-source-"));
    for (const key of ENV_KEYS) {
      previousEnv.set(key, process.env[key]);
      process.env[key] = "";
    }

    await writeFile(join(root, "novelix.json"), JSON.stringify({
      name: "studio-source-project",
      version: "0.1.0",
      language: "zh",
      llm: {
        configSource: "studio",
        services: [
          { service: "custom", name: "内网GPT", baseUrl: "https://llm.internal.corp/v1", temperature: 0.9 },
        ],
        defaultModel: "corp-chat",
      },
      notify: [],
    }, null, 2), "utf-8");
    await writeFile(join(root, ".env"), [
      "NOVELIX_LLM_PROVIDER=openai",
      "NOVELIX_LLM_BASE_URL=https://api-vip.codex-for.me/v1",
      "NOVELIX_LLM_MODEL=gpt-5.4",
      "NOVELIX_LLM_API_KEY=sk-env",
    ].join("\n"), "utf-8");
    await mkdir(join(root, ".novelix"), { recursive: true });
    await writeFile(
      join(root, ".novelix", "secrets.json"),
      JSON.stringify({ services: { "custom:内网GPT": { apiKey: "sk-corp" } } }, null, 2),
      "utf-8",
    );

    const config = await loadProjectConfig(root);

    expect(config.llm.configSource).toBe("studio");
    expect(config.llm.provider).toBe("custom");
    expect(config.llm.baseUrl).toBe("https://llm.internal.corp/v1");
    expect(config.llm.model).toBe("corp-chat");
    expect(config.llm.apiKey).toBe("sk-corp");
  });

  it("does not mix stale top-level env-era model/baseUrl with selected Studio service", async () => {
    root = await mkdtemp(join(tmpdir(), "novelix-config-loader-studio-stale-top-level-"));
    for (const key of ENV_KEYS) {
      previousEnv.set(key, process.env[key]);
      process.env[key] = "";
    }

    await writeFile(join(root, "novelix.json"), JSON.stringify({
      name: "studio-stale-project",
      version: "0.1.0",
      language: "zh",
      llm: {
        configSource: "studio",
        service: "google",
        model: "kimi-k2.5",
        baseUrl: "https://api.moonshot.cn/v1",
        apiKey: "sk-moon-inline",
        services: [
          { service: "google", temperature: 0.7, apiFormat: "chat", stream: true },
          { service: "moonshot", temperature: 1, apiFormat: "chat", stream: true },
        ],
        defaultModel: "gemini-2.5-flash",
      },
      notify: [],
    }, null, 2), "utf-8");
    await writeFile(join(root, ".env"), [
      "NOVELIX_LLM_PROVIDER=custom",
      "NOVELIX_LLM_BASE_URL=https://api.moonshot.cn/v1",
      "NOVELIX_LLM_MODEL=kimi-k2.5",
      "NOVELIX_LLM_API_KEY=sk-env-moon",
    ].join("\n"), "utf-8");
    await mkdir(join(root, ".novelix"), { recursive: true });
    await writeFile(
      join(root, ".novelix", "secrets.json"),
      JSON.stringify({
        services: {
          google: { apiKey: "sk-google" },
          moonshot: { apiKey: "sk-moon" },
        },
      }, null, 2),
      "utf-8",
    );

    const config = await loadProjectConfig(root, { consumer: "studio", requireApiKey: false });

    expect(config.llm.configSource).toBe("studio");
    expect(config.llm.service).toBe("google");
    expect(config.llm.provider).toBe("openai");
    expect(config.llm.baseUrl).toBe("https://generativelanguage.googleapis.com/v1beta");
    expect(config.llm.model).toBe("gemini-2.5-flash");
    expect(config.llm.apiKey).toBe("sk-google");
  });

  it("falls back to env when Studio config is still the empty bootstrap state", async () => {
    root = await mkdtemp(join(tmpdir(), "novelix-config-loader-studio-bootstrap-"));
    for (const key of ENV_KEYS) {
      previousEnv.set(key, process.env[key]);
      process.env[key] = "";
    }

    process.env.NOVELIX_LLM_PROVIDER = "openai";
    process.env.NOVELIX_LLM_BASE_URL = "https://api-vip.codex-for.me/v1";
    process.env.NOVELIX_LLM_MODEL = "gpt-5.4";
    process.env.NOVELIX_LLM_API_KEY = "sk-env";

    await writeFile(join(root, "novelix.json"), JSON.stringify({
      name: "studio-bootstrap-project",
      version: "0.1.0",
      language: "zh",
      llm: {
        provider: "openai",
        service: "custom",
        configSource: "studio",
        baseUrl: "",
        model: "",
        apiFormat: "chat",
        stream: true,
      },
      notify: [],
    }, null, 2), "utf-8");
    await writeFile(join(root, ".env"), "", "utf-8");

    const config = await loadProjectConfig(root);

    expect(config.llm.configSource).toBe("studio");
    expect(config.llm.provider).toBe("openai");
    expect(config.llm.baseUrl).toBe("https://api-vip.codex-for.me/v1");
    expect(config.llm.model).toBe("gpt-5.4");
    expect(config.llm.apiKey).toBe("sk-env");
  });
});
