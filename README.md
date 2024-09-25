# Amazon Bedrock Chat Application

## 概要

このプロジェクトは、Amazon Bedrock サービスを利用した対話型チャットアプリケーションです。複数の言語モデルを選択でき、テキストメッセージと画像を同時に送信することができます。

## 主な機能

- 複数の Amazon Bedrock モデル（Claude 3 Haiku, Claude 3 Sonnet, Claude v2）の選択
- テキストメッセージの送信
- 複数画像の同時アップロードと送信
- レスポンシブデザインのユーザーインターフェース

## 技術スタック

- Next.js
- TypeScript
- Tailwind CSS
- Amazon Bedrock SDK
- Formidable (ファイルアップロード処理)

## セットアップ手順

1. リポジトリをクローンします：

```
git clone git@github.com:keisuke2236/bedrock_sample.git
cd bedrock_sample
```

2. 依存関係をインストールします：

```
bun install
```

3. 環境変数を設定します。プロジェクトのルートに `.env` ファイルを作成し、以下の内容を追加します：

```
AWS_REGION=your_aws_region
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
```

4. Tailwind CSS の設定：

```
bunx tailwindcss init -p
```

5. 開発サーバーを起動します：

```
bun run dev
```

6. ブラウザで `http://localhost:3000` にアクセスしてアプリケーションを使用します。

## 使用方法

1. ドロップダウンメニューから使用したい言語モデルを選択します。
2. テキストエリアにメッセージを入力します。
3. 必要に応じて、「ファイル添付」ボタンから画像をアップロードします（複数可）。
4. 「送信」ボタンをクリックして、メッセージと画像を送信します。
5. AI からの応答が表示されます。

## 注意事項

- AWS の認証情報を適切に設定していることを確認してください。
- 大きなファイルや多数のファイルのアップロードは、パフォーマンスに影響を与える可能性があります。
- 本番環境にデプロイする際は、適切なセキュリティ対策を実装してください。

## ライセンス

MIT

## コントリビューション

プロジェクトへの貢献に興味がある場合は、Issue を開くか、Pull Request を送信してください。

## お問い合わせ

rorensu2236@gmail.com
