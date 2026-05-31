# TestFlight / App Store Connect 設定

GitHub ActionsからTestFlightへアップロードするには、Apple Developer Programの登録とApp Store Connect APIキーが必要です。

## GitHub Secrets

リポジトリの `Settings > Secrets and variables > Actions` に設定します。

| Secret | 内容 |
| --- | --- |
| `APP_STORE_CONNECT_API_KEY_ID` | App Store Connect API Key ID |
| `APP_STORE_CONNECT_API_ISSUER_ID` | Issuer ID |
| `APP_STORE_CONNECT_API_KEY_BASE64` | `.p8` キーをbase64化した文字列 |
| `APPLE_TEAM_ID` | Apple Developer Team ID |
| `BUNDLE_ID` | 例: `jp.yourcompany.bizradar` |

## .p8をbase64化する例

macOS:

```bash
base64 -i AuthKey_XXXXXXXXXX.p8 | pbcopy
```

Windows PowerShell:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("AuthKey_XXXXXXXXXX.p8")) | Set-Clipboard
```

## 実行

1. GitHubにpushする
2. `Actions > iOS Build` が通ることを確認する
3. Secretsを設定する
4. `Actions > iOS TestFlight > Run workflow` を実行する

## 注意

- App Store Connect側に同じBundle IDのAppレコードが必要です。
- 初回はApple側の証明書・プロビジョニング設定で失敗することがあります。
- 失敗した場合はActionsログの `build_app` または `upload_to_testflight` のエラーを確認します。
