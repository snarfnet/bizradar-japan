const demoCompanies = {
  "サンプル建設株式会社": {
    company: {
      source: "demo",
      corporateNumber: "1234567890123",
      name: "サンプル建設株式会社",
      location: "東京都千代田区霞が関1-1-1",
      industry: "建設・設備保守",
      subsidyCount: 7,
      procurementCount: 15,
      lastUpdated: "2026-05-24"
    },
    bids: [
      { category: "construction", title: "庁舎空調設備更新工事", organization: "関東地方整備局", deadline: "2026-06-12" },
      { category: "service", title: "公共施設の保守点検業務", organization: "東京都", deadline: "2026-06-18" },
      { category: "construction", title: "道路付属物補修工事", organization: "千葉県", deadline: "2026-06-21" },
      { category: "goods", title: "防災備蓄品の調達", organization: "埼玉県", deadline: "2026-06-25" }
    ],
    filings: [
      { date: "2026-05-15", type: "有価証券報告書", title: "設備投資と公共部門向け売上が増加。" },
      { date: "2026-04-10", type: "四半期報告書", title: "受注残高は前年同期比で改善。" },
      { date: "2026-03-28", type: "訂正報告書", title: "セグメント注記の一部を訂正。" }
    ],
    insight: {
      score: 89,
      title: "公共案件との相性が高い",
      text: "調達履歴と入札候補が重なっています。営業先として優先度は高めです。"
    }
  },
  "地域DX株式会社": {
    company: {
      source: "demo",
      corporateNumber: "9876543210987",
      name: "地域DX株式会社",
      location: "大阪府大阪市北区梅田1-1-1",
      industry: "IT・自治体DX",
      subsidyCount: 11,
      procurementCount: 8,
      lastUpdated: "2026-05-19"
    },
    bids: [
      { category: "service", title: "自治体向け電子申請システム運用", organization: "大阪府", deadline: "2026-06-14" },
      { category: "service", title: "職員向けDX研修業務", organization: "兵庫県", deadline: "2026-06-20" },
      { category: "goods", title: "窓口端末機器一式", organization: "京都市", deadline: "2026-06-27" }
    ],
    filings: [
      { date: "2026-05-02", type: "臨時報告書", title: "主要取引先との契約変更を開示。" },
      { date: "2026-03-31", type: "有価証券報告書", title: "公共領域のSaaS売上が伸長。" }
    ],
    insight: {
      score: 74,
      title: "自治体DX案件に反応しやすい",
      text: "システム導入、運用支援、研修系の公告に合います。補助金履歴も営業トークに使えます。"
    }
  }
};

const elements = {
  form: document.querySelector("#searchForm"),
  input: document.querySelector("#companyInput"),
  scoreValue: document.querySelector("#scoreValue"),
  scoreTitle: document.querySelector("#scoreTitle"),
  scoreText: document.querySelector("#scoreText"),
  activityCount: document.querySelector("#activityCount"),
  bidCount: document.querySelector("#bidCount"),
  filingCount: document.querySelector("#filingCount"),
  profileList: document.querySelector("#profileList"),
  bidList: document.querySelector("#bidList"),
  filingTimeline: document.querySelector("#filingTimeline"),
  bidFilter: document.querySelector("#bidFilter"),
  copyReport: document.querySelector("#copyReport"),
  saveLead: document.querySelector("#saveLead"),
  savedList: document.querySelector("#savedList"),
  clearLeads: document.querySelector("#clearLeads"),
  exportCsv: document.querySelector("#exportCsv"),
  toast: document.querySelector("#toast"),
  apiMode: document.querySelector("#apiMode"),
  companySource: document.querySelector("#companySource"),
  nextAction: document.querySelector("#nextAction"),
  nextActionReason: document.querySelector("#nextActionReason"),
  offerTitle: document.querySelector("#offerTitle"),
  offerText: document.querySelector("#offerText"),
  riskTitle: document.querySelector("#riskTitle"),
  riskText: document.querySelector("#riskText"),
  setupList: document.querySelector("#setupList"),
  setupScore: document.querySelector("#setupScore"),
  alertList: document.querySelector("#alertList"),
  markAlertsRead: document.querySelector("#markAlertsRead"),
  trialForm: document.querySelector("#trialForm"),
  trialCompany: document.querySelector("#trialCompany"),
  trialEmail: document.querySelector("#trialEmail"),
  trialPlan: document.querySelector("#trialPlan"),
  teamList: document.querySelector("#teamList"),
  usageList: document.querySelector("#usageList"),
  auditList: document.querySelector("#auditList"),
  addAuditLog: document.querySelector("#addAuditLog")
};

let currentPayload = demoCompanies["サンプル建設株式会社"];
let savedLeads = readSavedLeads();
let alertRead = localStorage.getItem("bizradar.alertsRead") === "true";

const setupItems = [
  { label: "gBizINFO APIトークン", ready: false, note: "法人情報を本番取得するために必要" },
  { label: "EDINET Subscription Key", ready: false, note: "開示イベントを本番取得するために必要" },
  { label: "官公需API URL", ready: false, note: "入札公告の取得先を指定" },
  { label: "デモデータ", ready: true, note: "API未設定でも商談デモ可能" },
  { label: "CSV出力", ready: true, note: "営業リストをすぐ持ち出せる" },
  { label: "トライアル導線", ready: true, note: "申込データを画面で作成" }
];

const teamMembers = [
  { name: "営業責任者", role: "管理者", email: "sales-lead@example.jp", status: "招待済み" },
  { name: "入札担当", role: "メンバー", email: "bid-team@example.jp", status: "有効" },
  { name: "経営企画", role: "閲覧者", email: "strategy@example.jp", status: "有効" }
];

let auditLogs = JSON.parse(localStorage.getItem("bizradar.auditLogs") || "[]");

function readSavedLeads() {
  try {
    return JSON.parse(localStorage.getItem("bizradar.leads") || "[]");
  } catch {
    return [];
  }
}

function writeSavedLeads() {
  localStorage.setItem("bizradar.leads", JSON.stringify(savedLeads));
}

function yenSafe(value) {
  return String(value ?? "").replaceAll('"', '""');
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  setTimeout(() => elements.toast.classList.remove("show"), 1400);
}

function categoryLabel(category) {
  if (category === "construction") return "工事";
  if (category === "goods") return "物品";
  return "役務";
}

function deriveDealAdvice(payload) {
  const company = payload.company;
  const hasConstruction = payload.bids.some((bid) => bid.category === "construction");
  const hasService = payload.bids.some((bid) => bid.category === "service");
  const filings = payload.filings.length;

  if (hasConstruction) {
    return {
      nextAction: "施設保守・更新工事の提案を優先",
      reason: "公告テーマと調達履歴が一致しています。過去案件に近い提案書を先に作る価値があります。",
      offer: "公共施設向け保守点検パッケージ",
      offerText: "入札前の仕様確認、見積作成、実績整理までをセットで提案できます。",
      risk: filings > 0 ? "開示内容と受注余力を確認" : "直近開示が少ない",
      riskText: filings > 0 ? "投資や受注残の説明と営業仮説が矛盾しないか見ます。" : "EDINET側で材料が薄い企業は、調達履歴を中心に判断します。"
    };
  }

  if (hasService || /DX|IT|システム/.test(company.industry)) {
    return {
      nextAction: "自治体向け運用支援の接点を作る",
      reason: "役務公告と補助金履歴があり、導入後の運用・研修提案に広げやすいです。",
      offer: "自治体DX伴走パッケージ",
      offerText: "電子申請、職員研修、運用改善を組み合わせた提案が合います。",
      risk: "競合が多い領域",
      riskText: "価格勝負になりやすいため、過去実績と短期導入の根拠を前面に出します。"
    };
  }

  return {
    nextAction: "公告テーマを継続監視",
    reason: "今すぐ強い一致は少ないため、法人活動と公告の変化を追います。",
    offer: "営業調査レポート",
    offerText: "補助金、調達、開示の変化を週次でまとめる提案が無難です。",
    risk: "名寄せ精度は要確認",
    riskText: "法人番号、会社名、EDINET提出者名が一致しないケースがあります。"
  };
}

function renderProfile(company) {
  const profile = {
    法人名: company.name,
    法人番号: company.corporateNumber || "未取得",
    所在地: company.location || "未取得",
    業種推定: company.industry || "未分類",
    補助金履歴: `${company.subsidyCount || 0}件`,
    調達履歴: `${company.procurementCount || 0}件`,
    最終更新: company.lastUpdated || "未取得"
  };

  elements.profileList.innerHTML = Object.entries(profile)
    .map(([key, value]) => `<div><dt>${key}</dt><dd>${value}</dd></div>`)
    .join("");
}

function renderBids(bids) {
  const filter = elements.bidFilter.value;
  const visibleBids = filter === "all" ? bids : bids.filter((bid) => bid.category === filter);
  elements.bidList.innerHTML = visibleBids.length
    ? visibleBids
        .map(
          (bid) => `
        <article class="bid-item">
          <div>
            <h3>${bid.title}</h3>
            <p>${bid.organization || "機関不明"}${bid.deadline ? ` / ${bid.deadline}締切` : ""}</p>
          </div>
          <span class="tag">${categoryLabel(bid.category)}</span>
        </article>
      `
        )
        .join("")
    : `<p class="empty">条件に合う公告がありません。</p>`;
}

function renderFilings(filings) {
  elements.filingTimeline.innerHTML = filings.length
    ? filings
        .map(
          (filing) => `
        <article class="filing">
          <time datetime="${filing.date}">${filing.date || "日付不明"}</time>
          <h3>${filing.type || "開示書類"}</h3>
          <p>${filing.title || "提出者不明"}</p>
        </article>
      `
        )
        .join("")
    : `<p class="empty">直近の開示データがありません。</p>`;
}

function renderDealAdvice(payload) {
  const advice = deriveDealAdvice(payload);
  elements.nextAction.textContent = advice.nextAction;
  elements.nextActionReason.textContent = advice.reason;
  elements.offerTitle.textContent = advice.offer;
  elements.offerText.textContent = advice.offerText;
  elements.riskTitle.textContent = advice.risk;
  elements.riskText.textContent = advice.riskText;
}

function renderSavedLeads() {
  elements.savedList.innerHTML = savedLeads.length
    ? savedLeads
        .map(
          (lead) => `
        <article class="saved-item">
          <div>
            <h3>${lead.name}</h3>
            <p>${lead.reason}</p>
          </div>
          <strong>${lead.score}</strong>
        </article>
      `
        )
        .join("")
    : `<p class="empty">まだ保存した企業はありません。</p>`;
}

function renderSetupList() {
  const readyCount = setupItems.filter((item) => item.ready).length;
  elements.setupScore.textContent = `${readyCount}/${setupItems.length}`;
  elements.setupList.innerHTML = setupItems
    .map(
      (item) => `
        <div class="setup-item ${item.ready ? "ready" : ""}">
          <span>${item.ready ? "✓" : "!"}</span>
          <div>
            <strong>${item.label}</strong>
            <p>${item.note}</p>
          </div>
        </div>
      `
    )
    .join("");
}

function buildAlerts(payload) {
  const { company, bids, filings, insight } = payload;
  const topBid = bids[0];
  const topFiling = filings[0];
  return [
    {
      level: insight.score >= 80 ? "high" : "mid",
      title: `${company.name} の優先度が ${insight.score} 点`,
      body: insight.text
    },
    {
      level: "mid",
      title: topBid ? `新しい公告候補: ${topBid.title}` : "公告候補なし",
      body: topBid ? `${topBid.organization || "機関不明"} / ${topBid.deadline || "締切未取得"}` : "検索条件を広げるか、アラート条件を見直します。"
    },
    {
      level: "low",
      title: topFiling ? `開示イベント: ${topFiling.type}` : "開示イベントなし",
      body: topFiling ? topFiling.title : "EDINETキー設定後に実データで確認します。"
    }
  ];
}

function renderAlerts(payload) {
  const alerts = alertRead ? [] : buildAlerts(payload);
  elements.alertList.innerHTML = alerts.length
    ? alerts
        .map(
          (alert) => `
        <article class="alert-item ${alert.level}">
          <span></span>
          <div>
            <h3>${alert.title}</h3>
            <p>${alert.body}</p>
          </div>
        </article>
      `
        )
        .join("")
    : `<p class="empty">未読アラートはありません。</p>`;
}

function renderTeamList() {
  elements.teamList.innerHTML = teamMembers
    .map(
      (member) => `
        <article class="team-item">
          <div>
            <h3>${member.name}</h3>
            <p>${member.email}</p>
          </div>
          <span>${member.role}</span>
          <strong>${member.status}</strong>
        </article>
      `
    )
    .join("");
}

function renderUsageList() {
  const usage = [
    { label: "検索回数", value: savedLeads.length + 42, limit: 2000 },
    { label: "保存企業", value: savedLeads.length, limit: 500 },
    { label: "CSV出力", value: Number(localStorage.getItem("bizradar.csvExports") || "0"), limit: 100 }
  ];

  elements.usageList.innerHTML = usage
    .map((item) => {
      const percent = Math.min(100, Math.round((item.value / item.limit) * 100));
      return `
        <div class="usage-item">
          <div>
            <strong>${item.label}</strong>
            <span>${item.value} / ${item.limit}</span>
          </div>
          <div class="usage-bar"><span style="width: ${percent}%"></span></div>
        </div>
      `;
    })
    .join("");
}

function writeAuditLog(action) {
  const record = {
    action,
    company: currentPayload.company.name,
    at: new Date().toISOString()
  };
  auditLogs = [record, ...auditLogs].slice(0, 8);
  localStorage.setItem("bizradar.auditLogs", JSON.stringify(auditLogs));
  renderAuditList();
}

function renderAuditList() {
  elements.auditList.innerHTML = auditLogs.length
    ? auditLogs
        .map(
          (log) => `
        <article class="audit-item">
          <strong>${log.action}</strong>
          <p>${log.company} / ${new Date(log.at).toLocaleString("ja-JP")}</p>
        </article>
      `
        )
        .join("")
    : `<p class="empty">まだ監査ログはありません。</p>`;
}

function render(payload) {
  currentPayload = payload;
  const { company, bids, filings, insight } = payload;
  elements.scoreValue.textContent = insight.score;
  elements.scoreTitle.textContent = insight.title;
  elements.scoreText.textContent = insight.text;
  elements.activityCount.textContent = `${(company.subsidyCount || 0) + (company.procurementCount || 0)}件`;
  elements.bidCount.textContent = `${bids.length}件`;
  elements.filingCount.textContent = `${filings.length}件`;
  elements.companySource.textContent = company.source || "demo";
  document.querySelector(".score-ring").style.background =
    `radial-gradient(circle at center, var(--panel) 56%, transparent 58%), conic-gradient(var(--green) 0 ${insight.score}%, #e8e2d0 ${insight.score}% 100%)`;
  renderProfile(company);
  renderBids(bids);
  renderFilings(filings);
  renderDealAdvice(payload);
  renderSavedLeads();
  renderSetupList();
  renderAlerts(payload);
  renderTeamList();
  renderUsageList();
  renderAuditList();
}

function fallbackPayload(query) {
  return demoCompanies[query] || demoCompanies["地域DX株式会社"];
}

async function loadCompany(query) {
  elements.scoreTitle.textContent = "取得中";
  elements.scoreText.textContent = "法人情報、入札公告、開示情報をまとめて確認しています。";

  try {
    const response = await fetch(`/api/company?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error("API request failed");
    const payload = await response.json();
    render(payload);
    elements.apiMode.textContent = payload.mode === "live" ? "Live API" : "Demo mode";
  } catch {
    render(fallbackPayload(query));
    elements.apiMode.textContent = "Demo mode";
  }
}

function currentSummary() {
  const { company, bids, filings, insight } = currentPayload;
  return [
    `企業名: ${company.name}`,
    `営業優先度: ${insight.score}/100`,
    `判断: ${insight.title}`,
    `理由: ${insight.text}`,
    `法人番号: ${company.corporateNumber || "未取得"}`,
    `入札候補: ${bids.length}件`,
    `開示書類: ${filings.length}件`,
    `次の一手: ${elements.nextAction.textContent}`
  ].join("\n");
}

function saveCurrentLead() {
  const { company, insight } = currentPayload;
  const lead = {
    name: company.name,
    corporateNumber: company.corporateNumber || "",
    score: insight.score,
    reason: insight.title,
    savedAt: new Date().toISOString()
  };
  savedLeads = [lead, ...savedLeads.filter((item) => item.corporateNumber !== lead.corporateNumber)].slice(0, 50);
  writeSavedLeads();
  renderSavedLeads();
  renderUsageList();
  writeAuditLog("営業リスト保存");
  showToast("保存しました");
}

function exportCsv() {
  const rows = [
    ["企業名", "法人番号", "営業優先度", "理由", "保存日時"],
    ...savedLeads.map((lead) => [lead.name, lead.corporateNumber, lead.score, lead.reason, lead.savedAt])
  ];
  const csv = rows.map((row) => row.map((cell) => `"${yenSafe(cell)}"`).join(",")).join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "bizradar-leads.csv";
  link.click();
  URL.revokeObjectURL(url);
  localStorage.setItem("bizradar.csvExports", String(Number(localStorage.getItem("bizradar.csvExports") || "0") + 1));
  renderUsageList();
  writeAuditLog("CSV出力");
  showToast("CSVを出力しました");
}

function buildTrialRecord() {
  const record = {
    company: elements.trialCompany.value.trim(),
    email: elements.trialEmail.value.trim(),
    plan: elements.trialPlan.value,
    requestedAt: new Date().toISOString(),
    sourceLead: currentPayload.company.name,
    currentScore: currentPayload.insight.score
  };
  localStorage.setItem("bizradar.trialRequest", JSON.stringify(record));
  return record;
}

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  loadCompany(elements.input.value.trim() || "サンプル建設株式会社");
});

document.querySelectorAll("[data-query]").forEach((button) => {
  button.addEventListener("click", () => {
    elements.input.value = button.dataset.query;
    loadCompany(button.dataset.query);
  });
});

elements.bidFilter.addEventListener("change", () => renderBids(currentPayload.bids));
elements.copyReport.addEventListener("click", async () => {
  await navigator.clipboard.writeText(currentSummary());
  showToast("要約をコピーしました");
});
elements.saveLead.addEventListener("click", saveCurrentLead);
elements.clearLeads.addEventListener("click", () => {
  savedLeads = [];
  writeSavedLeads();
  renderSavedLeads();
  showToast("保存リストを消去しました");
});
elements.exportCsv.addEventListener("click", exportCsv);
elements.markAlertsRead.addEventListener("click", () => {
  alertRead = true;
  localStorage.setItem("bizradar.alertsRead", "true");
  renderAlerts(currentPayload);
  showToast("アラートを既読にしました");
});
document.querySelectorAll(".plan-button").forEach((button) => {
  button.addEventListener("click", () => {
    elements.trialPlan.value = button.dataset.plan;
    elements.trialCompany.focus();
    showToast(`${button.dataset.plan} を選択しました`);
  });
});
elements.trialForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const record = buildTrialRecord();
  if (!record.company || !record.email) {
    showToast("会社名とメールを入力してください");
    return;
  }
  try {
    const response = await fetch("/api/trial-requests", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(record)
    });
    if (!response.ok) throw new Error("trial request failed");
    const payload = await response.json();
    await navigator.clipboard.writeText(JSON.stringify(payload.record, null, 2));
    writeAuditLog("トライアル申込");
    showToast("申込データを保存しました");
  } catch {
    await navigator.clipboard.writeText(JSON.stringify(record, null, 2));
    showToast("保存失敗。申込データをコピーしました");
  }
});
elements.addAuditLog.addEventListener("click", () => {
  writeAuditLog("手動メモ");
  showToast("監査ログに記録しました");
});

render(currentPayload);
