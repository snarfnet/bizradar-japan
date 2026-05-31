# BizRadar Japan iOS

SwiftUIで作るネイティブiOS / iPadOS版です。

## 作り方

1. MacでXcodeを開く
2. `File > New > Project > iOS > App` を選ぶ
3. Product Name: `BizRadarJapan`
4. Interface: `SwiftUI`
5. Language: `Swift`
6. 生成されたプロジェクトに、このフォルダの `Sources/BizRadarJapan` 配下のSwiftファイルを追加する
7. `Assets.xcassets` にアプリアイコンを設定する

## 対応方針

- iPhone: タブ型の業務アプリ
- iPad: サイドバー付きの分析画面
- API: 既存Nodeサーバーの `/api/company` を利用
- API未接続時: アプリ内デモデータで動作

## API設定

初期値はローカル開発向けです。

```swift
http://localhost:4174
```

実機で試す場合は、MacのLAN IPや本番API URLに変えてください。

変更箇所:

```text
Sources/BizRadarJapan/Services/APIClient.swift
```

## App Store提出前に必要なもの

- Bundle ID
- App Icon
- Privacy Nutrition Labels
- APIキーのサーバー側保管
- 利用規約
- プライバシーポリシー
- サポートURL
- スクリーンショット
- 課金する場合はStoreKitまたは外部決済の整理
