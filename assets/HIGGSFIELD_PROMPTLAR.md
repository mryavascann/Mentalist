# Higgsfield prompt listesi (v1)

> Kullanıcı üretir; ajan listeyi hazırlar ve `KAYIT.md`'yi tutar. Kredi ekonomisi: az sayıda, tekrar kullanılabilir, tek stil. Görsel gelene kadar oyun SVG siluet yer tutucularıyla çalışır (`src/arayuz/ekranlar/Portre.tsx`).
> Dosya adı kuralı: `assets/portreler/p01.webp` … ; `assets/mekanlar/malikane.webp` …; ≤ 60 KB/portre, ≤ 150 KB/mekân (tek dosya dağıtımı, K-010).

## Ortak stil eki (her prompta sonuna ekle)
"muted paper-and-ink illustration, desaturated warm palette (cream, manila, cork brown, ink black, single red accent), soft grain, no text, no logo, no watermark, consistent series style"

## 1. Portre havuzu (24 adet) — NÖTR ifade, omuz üstü, düz arka plan
Her portre: "neutral resting expression, direct gaze, shoulders-up portrait, plain warm-grey background, even soft light". İfade nötr olmalı: oyunda yüz ifadesi ipucu DEĞİLDİR (Barrett 2019); bilgi metinde.

| # | Prompt çekirdeği |
|---|---|
| p01 | woman in her late 20s, dark shoulder-length hair, plain blouse |
| p02 | man in his early 30s, short beard, knit sweater |
| p03 | woman around 45, tied-back greying hair, blazer |
| p04 | man around 50, glasses, cardigan, tired eyes |
| p05 | woman in her early 20s, curly hair, denim jacket |
| p06 | man in his late 60s, white hair, wool coat |
| p07 | woman around 35, headscarf, calm face |
| p08 | man around 40, shaved head, work shirt |
| p09 | woman in her 60s, short silver hair, pearl earrings |
| p10 | man in his 20s, tousled hair, hoodie |
| p11 | woman around 50, bob haircut, turtleneck |
| p12 | man around 35, moustache, leather jacket |
| p13 | woman in her 40s, long braid, linen shirt |
| p14 | man in his 70s, flat cap, weathered face |
| p15 | woman in her late 30s, glasses, lab coat collar visible |
| p16 | man around 45, suit and loosened tie |
| p17 | woman around 30, athletic build, zip jacket |
| p18 | man in his 60s, thick eyebrows, sweater vest |
| p19 | woman in her 20s, bleached short hair, band t-shirt |
| p20 | man around 55, grey stubble, nurse scrubs |
| p21 | woman in her 50s, hijab, reading glasses on head |
| p22 | man in his 30s, long hair tied back, apron |
| p23 | woman around 65, cropped grey hair, cardigan |
| p24 | man in his 40s, boxer's nose, plain t-shirt |

## 2. Takım portreleri (4 adet) — aynı stil, hafif karakter ipucu
| # | Prompt çekirdeği |
|---|---|
| t01 | Lider: woman around 45, sharp gaze, dark suit, folded arms — "rules first" |
| t02 | Sorgucu: man around 40, expressionless, plain shirt, notebook — "few words" |
| t03 | İnanan analist: woman in her late 20s, bright eyes, layered necklaces, cardigan — "believes in signs" |
| t04 | Saha ajanı: man in his early 30s, eager grin, rolled sleeves, coffee cup — "quick to judge" |

## 3. Mekân arka planları (8 adet) — insansız, geniş açı, hafif dramatik ışık
| # | Prompt çekirdeği |
|---|---|
| m01 | malikâne salonu: old mansion drawing room, velvet chairs, tall windows, dusk light |
| m02 | ofis: open-plan office at night, desk lamps, glass meeting room |
| m03 | sahil evi: seaside house terrace, wooden pier, overcast sea |
| m04 | tarikat çiftliği: rural commune farm, meeting hall, greenhouse, lantern light |
| m05 | hastane koridoru: hospital ward corridor at night, nurse station, pale green light |
| m06 | motel: roadside motel at night, neon sign, parking lot, rain |
| m07 | karnaval: travelling carnival at night, mirror house, generators, bulbs |
| m08 | apartman: old apartment building lobby, stairwell, mailboxes, warm bulb |

## 4. Ana görsel (1 adet)
"a detective's cluttered desk seen from above: case file folder, typewriter report, teacup, cork board with red thread in background, single lamp" + ortak stil eki

## 5. Sorgu odası (1 adet, opsiyonel)
"bare interview room, two chairs, table, one-way mirror, single overhead lamp" + ortak stil eki

## Üretim sonrası
1. WebP'ye çevir, boyutları küçült (portre 512×512, mekân 1280×720).
2. `assets/portreler/`, `assets/mekanlar/` altına koy; `assets/KAYIT.md`'ye satır ekle.
3. Ajan: `src/arayuz/ekranlar/Portre.tsx` yer tutucusunu gerçek dosyayla değiştirir (base64 gömme, K-010).
