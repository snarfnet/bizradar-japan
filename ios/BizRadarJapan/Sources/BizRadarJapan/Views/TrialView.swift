import SwiftUI

struct TrialView: View {
    @EnvironmentObject private var store: AppStore
    @State private var company = ""
    @State private var email = ""
    @State private var plan = "Pro"

    var body: some View {
        Form {
            Section("トライアル申込") {
                TextField("会社名", text: $company)
                    .textContentType(.organizationName)
                TextField("担当者メール", text: $email)
                    .textContentType(.emailAddress)
                    .keyboardType(.emailAddress)
                    .textInputAutocapitalization(.never)
                Picker("希望プラン", selection: $plan) {
                    Text("Starter").tag("Starter")
                    Text("Pro").tag("Pro")
                    Text("Enterprise").tag("Enterprise")
                }
            }

            Section {
                Button {
                    Task {
                        await store.submitTrial(company: company, email: email, plan: plan)
                    }
                } label: {
                    Label("申込を送信", systemImage: "paperplane")
                }
            }
        }
        .navigationTitle("トライアル")
    }
}
