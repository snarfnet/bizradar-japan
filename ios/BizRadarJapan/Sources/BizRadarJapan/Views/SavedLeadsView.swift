import SwiftUI

struct SavedLeadsView: View {
    @EnvironmentObject private var store: AppStore

    var body: some View {
        List {
            if store.savedLeads.isEmpty {
                ContentUnavailableView("保存した企業はありません", systemImage: "star", description: Text("企業分析から営業先を保存します。"))
            } else {
                ForEach(store.savedLeads) { lead in
                    VStack(alignment: .leading, spacing: 6) {
                        HStack {
                            Text(lead.companyName)
                                .font(.headline)
                            Spacer()
                            Text("\(lead.score)")
                                .font(.title3.weight(.black))
                                .foregroundStyle(Color.bizGreen)
                        }
                        Text(lead.reason)
                            .foregroundStyle(.secondary)
                        Text(lead.savedAt, style: .date)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    .padding(.vertical, 6)
                }
            }
        }
        .navigationTitle("保存リスト")
    }
}
