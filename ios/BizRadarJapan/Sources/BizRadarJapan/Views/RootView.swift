import SwiftUI

struct RootView: View {
    @EnvironmentObject private var store: AppStore

    var body: some View {
        NavigationSplitView {
            List {
                NavigationLink {
                    DashboardView()
                } label: {
                    Label("企業分析", systemImage: "chart.line.uptrend.xyaxis")
                }

                NavigationLink {
                    SavedLeadsView()
                } label: {
                    Label("保存リスト", systemImage: "star")
                }

                NavigationLink {
                    TrialView()
                } label: {
                    Label("トライアル", systemImage: "paperplane")
                }

                NavigationLink {
                    SettingsView()
                } label: {
                    Label("設定", systemImage: "gearshape")
                }
            }
            .navigationTitle("BizRadar")
        } detail: {
            DashboardView()
        }
    }
}

#Preview {
    RootView()
        .environmentObject(AppStore())
}
