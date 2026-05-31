import Foundation

struct CompanyPayload: Codable, Equatable {
    var company: Company
    var bids: [Bid]
    var filings: [Filing]
    var insight: Insight
    var mode: String?
}

struct Company: Codable, Equatable, Identifiable {
    var id: String { corporateNumber.isEmpty ? name : corporateNumber }
    var source: String
    var corporateNumber: String
    var name: String
    var location: String
    var industry: String
    var subsidyCount: Int
    var procurementCount: Int
    var lastUpdated: String
}

struct Bid: Codable, Equatable, Identifiable {
    var id: String { "\(title)-\(organization)-\(deadline)" }
    var source: String?
    var category: String
    var title: String
    var organization: String
    var deadline: String

    var categoryLabel: String {
        switch category {
        case "construction": return "工事"
        case "goods": return "物品"
        default: return "役務"
        }
    }
}

struct Filing: Codable, Equatable, Identifiable {
    var id: String { "\(date)-\(type)-\(title)" }
    var source: String?
    var date: String
    var type: String
    var title: String
}

struct Insight: Codable, Equatable {
    var score: Int
    var title: String
    var text: String
}

struct SavedLead: Identifiable, Codable, Equatable {
    var id = UUID()
    var companyName: String
    var corporateNumber: String
    var score: Int
    var reason: String
    var savedAt: Date
}

struct TrialRequest: Codable, Equatable {
    var company: String
    var email: String
    var plan: String
    var sourceLead: String
    var currentScore: Int
}

struct HealthStatus: Codable, Equatable {
    var ok: Bool
    var service: String
    var mode: String
    var port: Int
    var checks: HealthChecks
    var generatedAt: String
}

struct HealthChecks: Codable, Equatable {
    var gbizinfoToken: Bool
    var edinetKey: Bool
    var kkjEndpoint: Bool
    var demoData: Bool
    var trialStorage: Bool
}
