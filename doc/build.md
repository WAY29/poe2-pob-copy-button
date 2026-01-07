# ビルド手順（Vite）

## 前提

- Node.js がインストールされていること

## セットアップ

```
npm install
```

## ビルド

```
npm run build
```

複数のエントリ（content-script/background/page-hook）をモードごとに個別ビルドして `dist/` に出力します。

`dist/` に拡張機能一式が出力されるので、Chrome の「パッケージ化されていない拡張機能を読み込む」から `dist/` を指定してください。

## 個別ビルド（必要な場合）

```
npm run build -- --mode content
npm run build -- --mode background
npm run build -- --mode page-hook
```

## アイコン生成

`public/icons/icon.svg` を元にPNGを生成します。

```
npm run icons
```

## フォーマット

```
npm run format
```

## Releaseルール

`v*` タグをpushするとGitHub Actionsがビルドし、
`poe2-pob-copy-button-dist.zip` をReleaseに添付します。

例:

```
git tag v0.2.0
git push origin v0.2.0
```
