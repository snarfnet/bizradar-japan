import { createServer } from "node:http";
import { mkdir, readFile, writeFile, appendFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const port = Number(process.env.PORT || 4173);
const root = process.cwd();
const dataDir = join(root, "data");
const trialRequestsPath = join(dataDir, "trial-requests.jsonl");

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png"
};

const demoCompanies = {
  "サンプル建設株式会社": {
    source: "demo",
    corporateNumber: "1234567890123",
    name: "サンプル建設株式会社",
    location: "東京都千代田区霞が関1-1-1",
    industry: "建設・設備保守",
    subsidyCount: 7,
    procurementCount: 15,
    lastUpdated: "2026-05-24"
  },
  "地域DX株式会社": {
    source: "demo",
    corporateNumber: "9876543210987",
    name: "地域DX株式会社",
    location: "大阪府大阪市北区梅田1-1-1",
    industry: "IT・自治体DX",
    subsidyCount: 11,
    procurementCount: 8,
    lastUpdated: "2026-05-19"
  }
};

const demoBids = [
  { source: "demo", category: "construction", title: "庁舎空調設備更新工事", organization: "関東地方整備局", deadline: "2026-06-12" },
  { source: "demo", category: "service", title: "公共施設の保守点検業務", organization: "東京都", deadline: "2026-06-18" },
  { source: "demo", category: "construction", title: "道路付属物補修工事", organization: "千葉県", deadline: "2026-06-21" },
  { source: "demo", category: "goods", title: "防災備蓄品の調達", organization: "埼玉県", deadline: "2026-06-25" }
];

const demoFilings = [
  { source: "demo", date: "2026-05-15", type: "有価証券報告書", title: "設備投資と公共部門向け売上が増加。" },
  { source: "demo", date: "2026-04-10", type: "四半期報告書", title: "受注残高は前年同期比で改善。" },
  { source: "demo", date: "2026-03-28", type: "訂正報告書", title: "セグメント注記の一部を訂正。" }
];

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  res.end(JSON.stringify(payload));
}

async function readRequestJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks).toString("utf8");
  if (!body) return {};
  return JSON.parse(body);
}

function normalizeStaticPath(pathname) {
  const target = pathname === "/" ? "/index.html" : pathname;
  const clean = normalize(decodeURIComponent(target)).replace(/^(\.\.[/\\])+/, "");
  return join(root, clean);
}

async function serveStatic(res, url) {
  try {
    const filePath = normalizeStaticPath(url.pathname);
    const body = await readFile(filePath);
    res.writeHead(200, {
      "content-type": contentTypes[extname(filePath)] || "application/octet-stream"
    });
    res.end(body);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

function compactCompany(raw, fallbackName) {
  const item = Array.isArray(raw?.hojinInfos) ? raw.hojinInfos[0] : raw?.hojinInfo || raw;
  return {
    source: "gbizinfo",
    corporateNumber: item?.corporate_number || item?.corporateNumber || item?.hojinBango || "",
    name: item?.name || item?.hojinName || fallbackName,
    location: item?.location || item?.address || [item?.prefecture_name, item?.city_name, item?.street_number].filter(Boolean).join(""),
    industry: item?.business_summary || item?.industry || "未分類",
    subsidyCount: Array.isArray(item?.subsidy) ? item.subsidy.length : 0,
    procurementCount: Array.isArray(item?.procurement) ? item.procurement.length : 0,
    lastUpdated: item?.update_date || item?.last_update_date || ""
  };
}

async function getCompany(query) {
  const token = process.env.GBIZINFO_TOKEN;
  if (!token) return demoCompanies[query] || demoCompanies["地域DX株式会社"];

  const isCorporateNumber = /^\d{13}$/.test(query);
  const endpoint = isCorporateNumber
    ? `https://api.info.gbiz.go.jp/hojin/v1/hojin/${encodeURIComponent(query)}`
    : `https://api.info.gbiz.go.jp/hojin/v1/hojin?name=${encodeURIComponent(query)}`;

  const raw = await fetchJson(endpoint, {
    headers: {
      accept: "application/json",
      "X-hojinInfo-api-token": token
    }
  });
  return compactCompany(raw, query);
}

function textBetween(xml, tag) {
  const match = xml.match(new RegExp(`<[^:>]*:?${tag}[^>]*>([\\s\\S]*?)<\\/[^:>]*:?${tag}>`, "i"));
  return match ? match[1].replace(/<[^>]+>/g, "").trim() : "";
}

function guessBidCategory(title) {
  if (/工事|建設|補修|改修/.test(title)) return "construction";
  if (/物品|購入|備蓄|機器/.test(title)) return "goods";
  return "service";
}

function parseProcurementXml(xml) {
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) || xml.match(/<entry[\s\S]*?<\/entry>/gi) || [];
  return blocks.slice(0, 12).map((block) => {
    const title = textBetween(block, "title") || "名称未設定の公告";
    return {
      source: "kkj",
      category: guessBidCategory(title),
      title,
      organization: textBetween(block, "organization") || textBetween(block, "author") || "機関不明",
      deadline: textBetween(block, "deadline") || textBetween(block, "updated") || ""
    };
  });
}

async function getBids(keyword) {
  const endpoint = process.env.KKJ_API_URL;
  if (!endpoint) return demoBids;

  const url = new URL(endpoint);
  url.searchParams.set("keyword", keyword);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return parseProcurementXml(await response.text());
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

async function getFilings() {
  const key = process.env.EDINET_SUBSCRIPTION_KEY;
  if (!key) return demoFilings;

  const date = formatDate(new Date());
  const url = new URL("https://api.edinet-fsa.go.jp/api/v2/documents.json");
  url.searchParams.set("date", date);
  url.searchParams.set("type", "2");
  url.searchParams.set("Subscription-Key", key);
  const raw = await fetchJson(url);
  return (raw.results || []).slice(0, 12).map((item) => ({
    source: "edinet",
    date: item.submitDateTime?.slice(0, 10) || date,
    type: item.docDescription || item.ordinanceCode || "開示書類",
    title: item.filerName || item.docID || "提出者不明"
  }));
}

function scoreCompany(company, bids, filings) {
  const score = Math.min(95, 45 + company.procurementCount * 2 + company.subsidyCount + bids.length + filings.length);
  return {
    score,
    title: score >= 80 ? "公共案件との相性が高い" : "条件が合う案件を追える",
    text:
      score >= 80
        ? "調達履歴と入札候補が重なっています。営業先として優先度は高めです。"
        : "法人活動と公告を継続監視すると、提案タイミングを拾えます。"
  };
}

async function saveTrialRequest(payload) {
  await mkdir(dataDir, { recursive: true });
  const record = {
    id: `trial_${Date.now()}`,
    company: String(payload.company || "").trim(),
    email: String(payload.email || "").trim(),
    plan: String(payload.plan || "Pro").trim(),
    sourceLead: String(payload.sourceLead || "").trim(),
    currentScore: Number(payload.currentScore || 0),
    requestedAt: new Date().toISOString()
  };

  if (!record.company || !record.email) {
    const error = new Error("company and email are required");
    error.statusCode = 400;
    throw error;
  }

  await appendFile(trialRequestsPath, `${JSON.stringify(record)}\n`, "utf8");
  await writeFile(join(dataDir, "latest-trial-request.json"), JSON.stringify(record, null, 2), "utf8");
  return record;
}

async function readTrialRequests() {
  try {
    const body = await readFile(trialRequestsPath, "utf8");
    return body
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line))
      .slice(-20)
      .reverse();
  } catch {
    return [];
  }
}

function apiStatus() {
  return {
    ok: true,
    service: "BizRadar Japan",
    mode: process.env.GBIZINFO_TOKEN || process.env.EDINET_SUBSCRIPTION_KEY || process.env.KKJ_API_URL ? "mixed" : "demo",
    port,
    checks: {
      gbizinfoToken: Boolean(process.env.GBIZINFO_TOKEN),
      edinetKey: Boolean(process.env.EDINET_SUBSCRIPTION_KEY),
      kkjEndpoint: Boolean(process.env.KKJ_API_URL),
      demoData: true,
      trialStorage: true
    },
    generatedAt: new Date().toISOString()
  };
}

async function handleApi(req, res, url) {
  try {
    if (url.pathname === "/api/health") {
      return sendJson(res, 200, apiStatus());
    }

    if (url.pathname === "/api/company") {
      const query = url.searchParams.get("q")?.trim() || "サンプル建設株式会社";
      const [company, bids, filings] = await Promise.all([getCompany(query), getBids(query), getFilings(query)]);
      return sendJson(res, 200, {
        company,
        bids,
        filings,
        insight: scoreCompany(company, bids, filings),
        mode: company.source === "demo" ? "demo" : "live"
      });
    }

    if (url.pathname === "/api/trial-requests" && req.method === "POST") {
      const payload = await readRequestJson(req);
      const record = await saveTrialRequest(payload);
      return sendJson(res, 201, { ok: true, record });
    }

    if (url.pathname === "/api/trial-requests" && req.method === "GET") {
      const records = await readTrialRequests();
      return sendJson(res, 200, { ok: true, records });
    }

    return sendJson(res, 404, { error: "API route not found" });
  } catch (error) {
    return sendJson(res, error.statusCode || 502, {
      error: error.statusCode ? "Invalid request" : "Upstream API request failed",
      detail: error.message
    });
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname.startsWith("/api/")) {
    await handleApi(req, res, url);
    return;
  }
  await serveStatic(res, url);
});

server.listen(port, () => {
  console.log(`BizRadar Japan: http://localhost:${port}`);
});
