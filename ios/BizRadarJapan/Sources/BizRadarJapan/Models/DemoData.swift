import Foundation

enum DemoData {
    static let sample = CompanyPayload(
        company: Company(
            source: "demo",
            corporateNumber: "1234567890123",
            name: "サンプル建設株式会社",
            location: "東京都千代田区霞が関1-1-1",
            industry: "建設・設備保守",
            subsidyCount: 7,
            procurementCount: 15,
            lastUpdated: "2026-05-24"
        ),
        bids: [
            Bid(source: "demo", category: "construction", title: "庁舎空調設備更新工事", organization: "関東地方整備局", deadline: "2026-06-12"),
            Bid(source: "demo", category: "service", title: "公共施設の保守点検業務", organization: "東京都", deadline: "2026-06-18"),
            Bid(source: "demo", category: "construction", title: "道路付属物補修工事", organization: "千葉県", deadline: "2026-06-21"),
            Bid(source: "demo", category: "goods", title: "防災備蓄品の調達", organization: "埼玉県", deadline: "2026-06-25")
        ],
        filings: [
            Filing(source: "demo", date: "2026-05-15", type: "有価証券報告書", title: "設備投資と公共部門向け売上が増加。"),
            Filing(source: "demo", date: "2026-04-10", type: "四半期報告書", title: "受注残高は前年同期比で改善。"),
            Filing(source: "demo", date: "2026-03-28", type: "訂正報告書", title: "セグメント注記の一部を訂正。")
        ],
        insight: Insight(
            score: 89,
            title: "公共案件との相性が高い",
            text: "調達履歴と入札候補が重なっています。営業先として優先度は高めです。"
        ),
        mode: "demo"
    )
}
