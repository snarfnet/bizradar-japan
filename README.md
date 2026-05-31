# BizRadar Japan

BizRadar Japan は、gBizINFO、官公需情報ポータル検索API、EDINETを組み合わせたBtoB営業・入札リサーチSaaSのMVPです。

企業名を入れると、法人活動、公共調達の候補、開示イベント、営業優先度、次の一手を1画面で確認できます。

## いま入っているもの

- 企業名・法人番号検索
- gBizINFO / 官公需API / EDINETを束ねるバックエンドAPI
- APIキー未設定でも動くデモデータ
- 営業優先度スコア
- 次の一手、想定提案、注意点の表示
- 入札カテゴリ絞り込み
- 案件アラート
- 保存リスト
- CSV出力
- 営業要約コピー
- トライアル申込フォーム
- トライアル申込のサーバー保存
- PoCチーム、利用状況、監査ログの管理UI
- imagegenで作成したヒーロー画像と案件スコア画像

## 起動

```powershell
npm start
```

ブラウザで開きます。

```text
http://localhost:4173
```

構文チェック:

```powershell
npm run check
```

## デモ検索

- `サンプル建設株式会社`
- `地域DX株式会社`

## 実API接続

APIキーやトークンはブラウザに置かず、`server.js` 側で環境変数として管理します。

```powershell
$env:GBIZINFO_TOKEN="..."
$env:EDINET_SUBSCRIPTION_KEY="..."
$env:KKJ_API_URL="https://..."
npm start
```

未設定の場合はデモデータで動きます。必要な環境変数は `.env.example` にまとめています。

## トライアル申込データ

画面のトライアルフォームを送信すると、以下に保存されます。

- `data/trial-requests.jsonl`
- `data/latest-trial-request.json`

本番ではCRM、メール通知、決済サービスへ接続します。

## PoCで見せる管理機能

- PoCチーム
- 利用上限
- 監査ログ
- 案件アラート
- 導入チェック

## 売り方の仮説

最初のターゲットは、入札支援会社、建設・設備会社、自治体向けIT会社です。

価格案:

- Starter: 月額 19,800円、3ユーザー、検索300回、CSV出力
- Pro: 月額 49,800円、10ユーザー、検索2,000回、案件アラート
- Enterprise: 個別見積、名寄せ調整、API連携、監査ログ

## 次に作る機能

1. gBizINFO APIの実レスポンスに合わせた項目マッピング調整
2. 官公需XMLの実データ仕様に合わせたパーサー調整
3. EDINETコードと法人番号の名寄せ
4. 案件アラート通知
5. ユーザー認証と組織管理
6. Stripeなどの課金導線

## 販売用メモ

商談の流れ、想定ターゲット、価格案は `SALES.md` にまとめています。

## 生成画像

imagegenで作成した画像を `assets` に保存しています。

- `assets/hero-dashboard.png`
- `assets/opportunity-card.png`
