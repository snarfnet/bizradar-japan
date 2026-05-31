import SwiftUI

extension Color {
    static let bizPaper = Color(red: 0.96, green: 0.94, blue: 0.88)
    static let bizPanel = Color(red: 1.0, green: 1.0, blue: 0.98)
    static let bizLine = Color(red: 0.83, green: 0.80, blue: 0.72)
    static let bizGreen = Color(red: 0.04, green: 0.38, blue: 0.28)
    static let bizGold = Color(red: 0.78, green: 0.58, blue: 0.20)
}

struct MetricCard: View {
    var title: String
    var value: String
    var detail: String

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.caption.weight(.bold))
                .foregroundStyle(.secondary)
            Text(value)
                .font(.system(size: 30, weight: .black, design: .rounded))
            Text(detail)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(18)
        .background(Color.bizPanel, in: RoundedRectangle(cornerRadius: 14))
    }
}

struct CompanyProfileView: View {
    var company: Company

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("法人プロファイル")
                .font(.headline)
            row("法人名", company.name)
            row("法人番号", company.corporateNumber)
            row("所在地", company.location)
            row("業種推定", company.industry)
            row("最終更新", company.lastUpdated)
        }
        .cardStyle()
    }

    private func row(_ title: String, _ value: String) -> some View {
        HStack(alignment: .top) {
            Text(title)
                .foregroundStyle(.secondary)
            Spacer()
            Text(value)
                .fontWeight(.semibold)
                .multilineTextAlignment(.trailing)
        }
        .font(.subheadline)
    }
}

struct BidListView: View {
    var bids: [Bid]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("狙える入札案件")
                .font(.headline)
            ForEach(bids) { bid in
                VStack(alignment: .leading, spacing: 6) {
                    HStack {
                        Text(bid.title)
                            .fontWeight(.semibold)
                        Spacer()
                        Text(bid.categoryLabel)
                            .font(.caption.weight(.bold))
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Color.bizGreen.opacity(0.12), in: Capsule())
                    }
                    Text("\(bid.organization) / \(bid.deadline)締切")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Divider()
            }
        }
        .cardStyle()
    }
}

struct FilingListView: View {
    var filings: [Filing]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("開示イベント")
                .font(.headline)
            ForEach(filings) { filing in
                VStack(alignment: .leading, spacing: 5) {
                    Text(filing.date)
                        .font(.caption.weight(.bold))
                        .foregroundStyle(.bizGreen)
                    Text(filing.type)
                        .fontWeight(.semibold)
                    Text(filing.title)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Divider()
            }
        }
        .cardStyle()
    }
}

extension View {
    func cardStyle() -> some View {
        self
            .padding(18)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color.bizPanel, in: RoundedRectangle(cornerRadius: 14))
    }
}
