# assets/KAYIT.md — Görsel üretim kaydı

> Her Higgsfield (veya başka araç) üretimi buraya işlenir. Kredi ekonomisi için önce liste hazırlanır, kullanıcı onaylar, sonra üretilir.
> Yer tutucular (SVG siluet vb.) da listelenir ki neyin gerçek görselle değiştirileceği belli olsun.

| Tarih | Amaç | Araç | Prompt (özet) | Dosya adı | Tahmini kredi | Durum |
|---|---|---|---|---|---|---|
| — | — | — | Henüz üretim yok | — | — | — |
| 2026-09-16 | Deneme (p01 portre, m01 malikâne) | Higgsfield CLI | GPT Image 2.5 / Z Image / Soul Location | — | 0 (reddedildi) | **Engellendi:** hesap deneme durumunda, CLI ve workflow üretimi kapalı (`only_mcp_usage_on_trial_is_available`); yalnızca MCP açık. Çözüm: Higgsfield MCP sunucusu Claude Code'a eklendi (`claude mcp add … https://mcp.higgsfield.ai/mcp`), kullanıcı `/mcp` ile tarayıcıdan yetkilendirecek. |

## Maliyet tablosu (2026-09-16, CLI `generate cost`; bütçe 110 kredi)
| Model | Kredi/görsel | Kullanım |
|---|---|---|
| GPT Image 2.5 (`gpt_image_2_5`, kalite medium) | 1 | Portreler + takım + ana görsel (29 görsel ≈ 29 kredi) |
| Nano Banana 2 Lite (`nano_banana_2_lite`) | 1 | Yedek (karakter tutarlılığı) |
| Z Image (`z_image`) | 0.15 | Ucuz deneme/iterasyon |
| Soul Location (`soul_location`, 16:9) | 0.12 | 8 mekân + sorgu odası (≈ 1.1 kredi) |
Plan: tam liste (38 görsel) ≈ 31 kredi; tekrar/seçim payıyla ≤ 60 kredi. MCP'de fiyatlar aynı ("standart oran").

## Prompt listesi
`assets/HIGGSFIELD_PROMPTLAR.md` (24 portre, 4 takım, 8 mekân, 1 ana görsel, 1 sorgu odası). Görsel gelene kadar `Portre.tsx` SVG siluet çizer.

## Planlanan (brand.md §6)
1. Portre havuzu (~20–24, nötr ifade, aynı stil)
2. Takım portreleri (4–5)
3. Mekân arka planları (6–8)
4. Ana görsel (1)
5. Tanıtım videosu (opsiyonel, en sona)
