# 引き継ぎメモ（カウントダウンタイマー）

## アプリ概要
iPhone（Safari / ホーム画面Webアプリ）向けのカウントダウンタイマー。3枠のタイマーを1画面で表示・設定する。ビルド不要の素のHTML/CSS/JS、外部ライブラリなし。

## 公開URL
https://salachannel.github.io/countdown-timer/ （GitHub Pages、ルート公開。パスは全て相対パス）

## ファイル構成
| ファイル | 役割 |
|---|---|
| index.html | 画面本体（iPhone向けmeta設定込み） |
| style.css | スタイル（ライト/ダーク、safe-area対応） |
| app.js | 画面制御（描画、1秒更新、保存/クリア、タブ切替） |
| countdown.js | 残り時間計算・表示整形（純粋関数） |
| storage.js | localStorage読み書きとデータ正規化 |
| manifest.webmanifest | ホーム画面追加用（standalone） |
| icons/ | icon-180/192/512.png（砂時計） |
| scripts/gen-icons.mjs | アイコン生成（`npm run icons`） |
| tests/ | `countdown.test.js` / `storage.test.js` |
| package.json | `"type":"module"`, `npm test` = `node --test` |

## 保存キーとデータ形式
- localStorage キー: `countdown:v1`
- 値: `[{label: string(最大20文字), target: ISO文字列|null} x 3]`
- 壊れたJSON・要素数不一致・不正な日付は未設定に正規化。読み書きは全てtry/catch。

## 実装済み機能
- タイマーカード3枚（名前 / 目標日時「10/3(土) 18:00」/ 残り「○日 00:00:00」）、色分け（青緑・橙・紫）
- 未設定表示、目標超過で「終了」＋赤系強調
- 1秒更新（毎回現在時刻から計算）、画面復帰(visibilitychange/pageshow)で即更新
- カードタップで選択→入力欄に反映、タイマー1/2/3切替
- 名前（20文字）・日時入力、保存/クリア、結果メッセージ、日時空はエラー、保存失敗メッセージ
- ライト/ダーク自動追従、tabular-nums
- iPhone対応: viewport-fit=cover, safe-area, 16px入力, 44px以上のタップ領域, ダブルタップ拡大/引っ張りスクロール抑制, apple-mobile-web-app-* / apple-touch-icon
- 390x844 / 375x667 で1画面に収まることをChromiumで確認済み
- テスト16件成功（`npm test`）

## 未完了タスク
- [ ] GitHub Pages有効化（Settings → Pages → Source: Deploy from a branch → main / (root)）
- [ ] iPhone実機確認（Safari表示、ホーム画面追加、ノッチ/ホームバー、入力時にズームしないこと、ダーク表示）

## 更新方法
1. ファイルを編集（ビルド不要）
2. `npm test` で全件成功を確認
3. main にコミット・push すると数分でGitHub Pagesに反映
4. アイコン変更時は `scripts/gen-icons.mjs` を編集して `npm run icons`
