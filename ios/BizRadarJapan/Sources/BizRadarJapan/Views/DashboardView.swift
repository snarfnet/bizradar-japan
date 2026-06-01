import SwiftUI

struct DashboardView: View {
    @EnvironmentObject private var store: AppStore

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                header
                scoreSection
                actionCards
                contentGrid
            }
            .padding()
            .frame(maxWidth: 1180, alignment: .leading)
        }
        .background(Color.bizPaper)
        .navigationTitle("企業分析")
        .task {
            await store.refreshHealth()
        }
        .alert("BizRadar", isPresented: Binding(
            get: { store.message != nil },
            set: { if !$0 { store.message = nil } }
        )) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(store.message ?? "")
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("gBizINFO + 官公需API + EDINET")
                .font(.caption.weight(.bold))
                .foregroundStyle(Color.bizGreen)

            Text("営業先を、公共データで選ぶ。")
                .font(.system(size: 34, weight: .black, design: .rounded))

            HStack(spacing: 10) {
                TextField("企業名・法人番号", text: $store.query)
                    .textFieldStyle(.roundedBorder)
                    .submitLabel(.search)
                    .onSubmit {
                        Task { await store.search() }
                    }

                Button {
                    Task { await store.search() }
                } label: {
                    if store.isLoading {
                        ProgressView()
                    } else {
                        Label("分析", systemImage: "magnifyingglass")
                    }
                }
                .buttonStyle(.borderedProminent)
            }
        }
        .padding(20)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 16))
    }

    private var scoreSection: some View {
        HStack(alignment: .center, spacing: 18) {
            ZStack {
                Circle()
                    .stroke(Color.bizLine, lineWidth: 16)
                Circle()
                    .trim(from: 0, to: CGFloat(store.payload.insight.score) / 100)
                    .stroke(Color.bizGreen, style: StrokeStyle(lineWidth: 16, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                VStack {
                    Text("\(store.payload.insight.score)")
                        .font(.system(size: 38, weight: .black, design: .rounded))
                    Text("/100")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            .frame(width: 128, height: 128)

            VStack(alignment: .leading, spacing: 8) {
                Text("営業優先度")
                    .font(.caption.weight(.bold))
                    .foregroundStyle(Color.bizGreen)
                Text(store.payload.insight.title)
                    .font(.title2.weight(.bold))
                Text(store.payload.insight.text)
                    .foregroundStyle(.secondary)
                HStack {
                    Button {
                        store.saveCurrentLead()
                    } label: {
                        Label("保存", systemImage: "star")
                    }
                    .buttonStyle(.borderedProminent)

                    ShareLink(item: salesSummary) {
                        Label("共有", systemImage: "square.and.arrow.up")
                    }
                    .buttonStyle(.bordered)
                }
            }
        }
        .padding(20)
        .background(Color.bizPanel, in: RoundedRectangle(cornerRadius: 16))
    }

    private var actionCards: some View {
        LazyVGrid(columns: [GridItem(.adaptive(minimum: 250), spacing: 14)], spacing: 14) {
            MetricCard(title: "法人活動", value: "\(store.payload.company.subsidyCount + store.payload.company.procurementCount)件", detail: "補助金・調達")
            MetricCard(title: "入札候補", value: "\(store.payload.bids.count)件", detail: "直近公告")
            MetricCard(title: "開示書類", value: "\(store.payload.filings.count)件", detail: "EDINET")
        }
    }

    private var contentGrid: some View {
        LazyVGrid(columns: [GridItem(.adaptive(minimum: 330), spacing: 16)], alignment: .leading, spacing: 16) {
            CompanyProfileView(company: store.payload.company)
            BidListView(bids: store.payload.bids)
            FilingListView(filings: store.payload.filings)
        }
    }

    private var salesSummary: String {
        """
        企業名: \(store.payload.company.name)
        営業優先度: \(store.payload.insight.score)/100
        判断: \(store.payload.insight.title)
        理由: \(store.payload.insight.text)
        入札候補: \(store.payload.bids.count)件
        開示書類: \(store.payload.filings.count)件
        """
    }
}
