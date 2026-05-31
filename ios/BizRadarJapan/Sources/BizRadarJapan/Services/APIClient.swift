import Foundation

final class APIClient {
    var baseURL = URL(string: "http://localhost:4174")!
    private let session: URLSession

    init(session: URLSession = .shared) {
        self.session = session
    }

    func fetchCompany(query: String) async throws -> CompanyPayload {
        var components = URLComponents(url: baseURL.appendingPathComponent("/api/company"), resolvingAgainstBaseURL: false)!
        components.queryItems = [URLQueryItem(name: "q", value: query)]
        guard let url = components.url else { throw APIError.invalidURL }

        let (data, response) = try await session.data(from: url)
        try validate(response)
        return try JSONDecoder().decode(CompanyPayload.self, from: data)
    }

    func fetchHealth() async throws -> HealthStatus {
        let url = baseURL.appendingPathComponent("/api/health")
        let (data, response) = try await session.data(from: url)
        try validate(response)
        return try JSONDecoder().decode(HealthStatus.self, from: data)
    }

    func submitTrial(_ request: TrialRequest) async throws {
        let url = baseURL.appendingPathComponent("/api/trial-requests")
        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = "POST"
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        urlRequest.httpBody = try JSONEncoder().encode(request)

        let (_, response) = try await session.data(for: urlRequest)
        try validate(response)
    }

    private func validate(_ response: URLResponse) throws {
        guard let http = response as? HTTPURLResponse else { return }
        guard (200..<300).contains(http.statusCode) else {
            throw APIError.httpStatus(http.statusCode)
        }
    }
}

enum APIError: LocalizedError {
    case invalidURL
    case httpStatus(Int)

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "URLが不正です。"
        case .httpStatus(let status):
            return "APIエラー: \(status)"
        }
    }
}
