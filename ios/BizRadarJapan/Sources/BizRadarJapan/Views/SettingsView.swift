import SwiftUI

struct SettingsView: View {
    @EnvironmentObject private var store: AppStore

    var body: some View {
        List {
            Section("接続状態") {
                Button {
                    Task { await store.refreshHealth() }
                } label: {
                    Label("再確認", systemImage: "arrow.clockwise")
                }

                if let health = store.healthStatus {
                    statusRow("モード", health.mode)
                    checkRow("gBizINFO", health.checks.gbizinfoToken)
                    checkRow("EDINET", health.checks.edinetKey)
                    checkRow("官公需API", health.checks.kkjEndpoint)
                    checkRow("デモデータ", health.checks.demoData)
                    checkRow("申込保存", health.checks.trialStorage)
                } else {
                    Text("APIに接続できません。未接続でもデモデータで利用できます。")
                        .foregroundStyle(.secondary)
                }
            }

            Section("App Store準備") {
                checkRow("Bundle ID", false)
                checkRow("Privacy Policy", false)
                checkRow("App Icon", false)
                checkRow("TestFlight", false)
            }
        }
        .navigationTitle("設定")
        .task {
            await store.refreshHealth()
        }
    }

    private func statusRow(_ title: String, _ value: String) -> some View {
        HStack {
            Text(title)
            Spacer()
            Text(value)
                .foregroundStyle(.secondary)
        }
    }

    private func checkRow(_ title: String, _ ready: Bool) -> some View {
        HStack {
            Label(title, systemImage: ready ? "checkmark.circle.fill" : "exclamationmark.circle.fill")
                .foregroundStyle(ready ? .green : .orange)
            Spacer()
            Text(ready ? "OK" : "未設定")
                .foregroundStyle(.secondary)
        }
    }
}
