# PoB2貼り付け用フォーマット仕様（ItemTools.lua解析）

## 対象

本ドキュメントは `PathOfBuilding-PoE2/src/Modules/ItemTools.lua` の挙動から、
**Mod行の文字列フォーマットと数値の扱い**を整理したものです。
アイテム全体の貼り付けフォーマット（ヘッダ/レアリティ等）はこのファイルだけでは定義されていません。

参照元:

- https://github.com/PathOfBuildingCommunity/PathOfBuilding-PoE2/blob/dev/src/Modules/ItemTools.lua

## 1. Mod行の基本

- 1行のMod文字列を処理単位とする。
- 数値・範囲表記を解決し、最終的な表示文字列に整形する。
- 0値のMod行は非表示になる条件がある。

## 2. 範囲表記（range）の解釈

`itemLib.applyRange` で以下のパターンが解釈される。

- 単一範囲:
  - `+(min-max)` / `-(min-max)` / `(min-max)`
- 複合範囲:
  - `(min-max) to (min-max)`

範囲は `range`（0〜1）を用いて `min + range * (max - min)` に変換される。
符号 `+/-` は結果の符号に反映される。

## 3. マイナス％の変換（increased/reduced/more/less）

以下の形は反対語に変換される。

- `-10% increased` → `10% reduced`
- `-10% reduced` → `10% increased`
- `-10% more` → `10% less`
- `-10% less` → `10% more`

該当しない単語は `-10% X` のまま残る。

## 4. 数値スケーリングと精度

### 4.1 スケール対象の決定

- Mod行内の数値を `#` に置換した「テンプレート」を作る。
- `data.modScalability` に一致するテンプレートがある場合、該当する値のみをスケーリング対象にする。
- どの値をスケールするかは、`#`置換の組合せを上から探して一致したものを採用する。

### 4.2 スケーリングと表示精度

`itemLib.formatValue` の挙動:

- `valueScalar` / `baseValueScalar` を掛けて値を変換する。
- `precision` に応じて内部値を丸め、再度表示用の精度に変換する。
- 小数は最大2桁が基本（`data.defaultHighPrecision` の影響あり）。

### 4.3 代表的な精度指定

`data.modScalability[*].formats` により分母が決まる。
例:

- `divide_by_ten_0dp` → 10で割り、小数0桁で表示
- `divide_by_one_hundred_2dp` → 100で割り、小数2桁で表示
- `per_minute_to_per_second` → 60で割る
- `milliseconds_to_seconds` → 1000で割る

## 5. 0値Modの非表示条件

`itemLib.formatModLine` で以下の条件に一致する行は出力しない。

- 行頭が `+0` / `0` で始まる（%有無問わず）
- `0-0` や `0 to 0` が含まれる
- `0%` を含み、`0 to 1+` / `0% to N%` でない

## 6. カラーコード付与（出力側の情報）

Mod行は内部的にカラーコードを付与して返される。
貼り付けテキストを作る側では**カラーコードは不要**だが、
PoB内部では次のように分類される。

- `custom` → CUSTOM
- `enchant` → ENCHANTED
- `fractured` → FRACTURED
- `mutated` → MUTATED
- それ以外 → MAGIC
- `extra` がある場合は UNSUPPORTED 扱い

## 7. 実装上の示唆（Create Custom向け）

ItemTools.luaの処理から読み取れる実装指針:

- 範囲表記が含まれる場合は、貼り付け前に確定値へ解決する方が安全。
- `#` を含む行は内部的には解釈可能だが、外部入力では誤判定の可能性がある。
- 数値の丸めは小数2桁が基準となるため、極端な精度を持つModは削除・丸めが推奨。

## 8. まとめ

- ItemTools.luaは**Mod行の数値解決と表示整形**のルールを担う。
- PoB2の貼り付け向けには、範囲・スケール・0値除外の仕様が重要。
- アイテム全体の貼り付けフォーマット（ヘッダ/区切り）は別モジュールに依存する。
