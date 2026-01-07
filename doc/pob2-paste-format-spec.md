# PoB2貼り付け用アイテムテキスト仕様（Item.lua/ItemsTab.lua解析）

## 対象

この仕様は PoB2 の「Create Custom Item from Text」および貼り付け解析の入力形式を、
`src/Classes/Item.lua` と `src/Classes/ItemsTab.lua` の実装に基づいてまとめたものです。

参照元:

- https://github.com/PathOfBuildingCommunity/PathOfBuilding-PoE2/blob/dev/src/Classes/Item.lua
- https://github.com/PathOfBuildingCommunity/PathOfBuilding-PoE2/blob/dev/src/Classes/ItemsTab.lua

## 1. 入力形式の種類

PoB2は以下の2形式を受理します。

1. ゲーム内コピー形式  
   `Rarity:` から始まり、`--------` 区切りを含む形式。  
   `Item Class:` が先頭に存在する場合もある。

2. PoBカスタム形式  
   PoBが内部生成する形式（`Item:BuildRaw()`）。  
   `Implicits: N` を含み、`--------` 区切りを使わない。

本仕様では PoBカスタム形式 を基準として記述します。

## 2. 必須ヘッダ

以下の行が必須です。

```
Rarity: <RARITY>
<NAME_LINE_1>
<NAME_LINE_2 or BASE_LINE>
Implicits: <N>
```

### 2.1 Rarity

`Rarity:` は以下を想定:

- NORMAL
- MAGIC
- RARE
- UNIQUE
- RELIC

### 2.2 名前/ベース行

- UNIQUE/RELIC:  
  1行目 = ユニーク名、2行目 = ベース名
- それ以外:  
  1行目 = ベース名（magicは接頭/接尾を含むことあり）

## 3. 代表的な任意ヘッダ

以下は任意だが、PoBが理解するキー。

- `Item Level: <num>`
- `Quality: <num>`
- `Charm Slots: <num>`
- `Spirit: <num>`
- `Armour: <num>`
- `Evasion: <num>`
- `Energy Shield: <num>`
- `Ward: <num>`
- `Unique ID: <string>`
- `League: <string>`
- `Unreleased: true`
- `Crafted: true`
- `Prefix: {range:<0-1>}<modId>`
- `Suffix: {range:<0-1>}<modId>`
- `Catalyst: <name>`
- `CatalystQuality: <num>`
- `Cluster Jewel Skill: <id>`
- `Cluster Jewel Node Count: <num>`
- `Talisman Tier: <num>`
- `Sockets: S S S`（Sの個数がソケット数）
- `Rune: <runeName>`
- `LevelReq: <num>`
- `Radius: <label>`
- `Limited to: <num>`
- `Requires Class <className>`
- `Mirrored`
- `Corrupted`

## 4. ImplicitsとMod行

### 4.1 Implicitsの起点

```
Implicits: <N>
```

この行以降の Mod 行は以下の順で書くことが推奨される。

1. Rune Mods
2. Enchant Mods
3. Class Requirement Mods
4. Implicit Mods
5. Explicit Mods

PoBは `Implicits: N` によって、暗黙Modの数を判断する。

### 4.2 Mod行のタグ

Mod行の先頭に以下のタグを付与できる。

- `{range:<0-1>}`: 範囲値の解決比率
- `{corruptedRange:<0-1>}`: corrupted範囲
- `{variant:1,2,...}`: バリアント制御
- `{tags:tag1,tag2,...}`: Modタグ
- `{rune}` `{enchant}` `{custom}` `{fractured}` `{desecrated}` `{mutated}` `{implicit}`

複数タグは連結して記述可能。

### 4.3 Mod行の括弧フラグ

括弧フラグも同様に解釈される。

例:

```
Adds 1 to 2 Damage (implicit)
```

## 5. セクション区切り（ゲーム内形式）

ゲーム内コピー形式では `--------` がセクション区切りとして使われる。
PoBはこの区切りを利用して暗黙/明示の判定を行うが、
PoBカスタム形式では `Implicits: N` が判定の基点になる。

## 6. Mod行の解釈ルール概要

- `modLib.parseMod` がパース可能な行のみがModとして扱われる。
- `line` 内の `{range:...}` は `itemLib.applyRange` に渡される。
- `Implicits` 数が指定されている場合、暗黙Modの数はその値を優先する。
- 解析できないMod行は `extra` として保持される。

## 7. 最小入力例（PoBカスタム形式）

```
Rarity: RARE
Foe Cutter
Vaal Axe
Item Level: 80
Quality: 20
Sockets: S S
Rune: None
Rune: None
Implicits: 1
{implicit}+20% to Fire Resistance
Adds 10 to 20 Damage
```

## 8. 実装上の示唆

- Create Custom 用の入力は、PoB内部の `BuildRaw()` を模した形式が最も安全。
- PoBは `Implicits: N` を基準に暗黙/明示を切り分けるため、
  明示Modのみを渡す場合は `Implicits: 0` を付ける。
- `Rarity` とベース名が判定できないとアイテム生成に失敗する。
