import Foundation

@MainActor
final class AppStore: ObservableObject {
    @Published var query = "サンプル建設株式会社"
    @Published var payload = DemoData.sample
    @Published var savedLeads: [SavedLead] = []
    @Published var healthStatus: HealthStatus?
    @Published var isLoading = false
    @Published var message: String?

    private let api = APIClient()

    func search() async {
        isLoading = true
        defer { isLoading = false }

        do {
            payload = try await api.fetchCompany(query: query)
            message = payload.mode == "live" ? "Live API" : "Demo mode"
        } catch {
            payload = DemoData.sample
            message = "API未接続のためデモデータを表示しています。"
        }
    }

    func refreshHealth() async {
        do {
            healthStatus = try await api.fetchHealth()
        } catch {
            healthStatus = nil
            message = "ヘルスチェックに接続できません。"
        }
    }

    func saveCurrentLead() {
        let company = payload.company
        let insight = payload.insight
        let lead = SavedLead(
            companyName: company.name,
            corporateNumber: company.corporateNumber,
            score: insight.score,
            reason: insight.title,
            savedAt: Date()
        )
        savedLeads.removeAll { $0.corporateNumber == lead.corporateNumber }
        savedLeads.insert(lead, at: 0)
        message = "保存しました。"
    }

    func submitTrial(company: String, email: String, plan: String) async {
        let request = TrialRequest(
            company: company,
            email: email,
            plan: plan,
            sourceLead: payload.company.name,
            currentScore: payload.insight.score
        )

        do {
            try await api.submitTrial(request)
            message = "トライアル申込を送信しました。"
        } catch {
            message = "送信できませんでした。入力内容は控えてください。"
        }
    }
}
