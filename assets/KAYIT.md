# assets/KAYIT.md — Görsel üretim kaydı

> Her Higgsfield (veya başka araç) üretimi buraya işlenir. Kaynak PNG'ler Higgsfield hesabında (job geçmişi); repoda yalnızca küçültülmüş WebP'ler durur ve derlemede tek HTML'e gömülür (K-010). Kod tarafı: `src/arayuz/gorseller.ts` (`import.meta.glob`), test: `tests/arayuz/gorseller.test.ts` (varlık, boyut bütçesi, portre eşlemesi örüntü denetimi).

## Üretim özeti (2026-09-16, Higgsfield MCP, hesap: plus, 110 kredi → 0)

| Klasör | Adet | Model | Boyut / kalite | Toplam | Kullanım |
|---|---|---|---|---|---|
| `portreler/` p01–p56 | 56 | GPT Image 2.5 (quality medium, 1:1) | 448², q68 (≤ 60 KB) | ~950 KB | Kişi portreleri: cinsiyet uyumlu, yaşa yakın, vakada tekrarsız, seed'le deterministik (`portreEslemesi`) |
| `portreler/` t01–t04 | 4 | GPT Image 2.5 | 448² | ~70 KB | Takım: lider (t01), sorgucu (t02), inanan analist (t03), saha ajanı (t04); sorgu yorumu, Analiz ofis sahnesi, Watson |
| `mekanlar/` | 9 | Soul Location (m01–m03, m06–m09) + GPT Image 2.5 (çiftlik, hastane; Soul figür ekliyordu) | 1024×576, q60 | 382 KB | Vaka açılışında olay yeri; `mekanGorseli(tur)`; `sorgu-odasi` yedek |
| `odalar/` | 18 | GPT Image 2.5 (13) + Soul Location (5) | 1024×576, q60 | 908 KB | `odaGorseli(vaka, odaId)`: kütüphane, mutfak, bahçe, çalışma odası, üst kat koridoru, garaj, toplantı odası, arşiv, merdiven, oturma odası, kayıkhane, sera, yemekhane, hasta odası, motel odası, ana çadır, daire, bodrum. Henüz ekranda kullanılmıyor (fikir: zaman çizelgesi / "neredeydin" cevabı) |
| `kilavuz/` | 12 | GPT Image 2.5 (16:9) | 960×540, q62 | 682 KB | Kılavuz bölüm başlığı görseli (madde açıkken) |
| `tatbikat/` | 7 | GPT Image 2.5 (16:9) | 960×540 | 269 KB | Tatbikat ekranı başlığı |
| `delil/` | 4 | GPT Image 2.5 (1:1) | 384² | 31 KB | Delil türü kartları (fiziksel, dijital, belge, olmayan). Henüz ekranda kullanılmıyor |
| `diger/` | 12 | GPT Image 2.5 | çeşitli | 717 KB | `ana` (başlık), `ana-dikey`/`ana-kare`/`ana-pencere`/`ana-pano` (yedek/tanıtım), `ofis` (Analiz "Ofis · sonra"), `kanepe` (Pano takım notları), `forer` (açılış dersi), `watson`, `mantar` (pano dokusu), `suclama`, `ayna-not` (Ayna notu yanı) |

Toplam: 122 WebP, ~4.0 MB; derleme `dist/index.html` 5.98 MB (gzip 4.3 MB).

## Ortak stil (tüm promptlarda)
"muted paper-and-ink illustration, desaturated warm palette (cream, manila, cork brown, ink black, single red accent), soft grain, no text, no logo, no watermark, consistent series style". Portreler: "neutral resting expression, direct gaze, shoulders-up, plain warm-grey background, even soft light" (Barrett 2019: ifade ipucu değildir).

## Elenenler (üretildi, kullanılmadı)
- Soul Location: malikâne (yeniden, figür), çiftlik (figür), hastane (figür/karanlık), kütüphane (figür), eczane (figür), havuz başı (yazı), karavan alanı (yazı). Ders: Soul Location "no people" talimatına uymuyor; iç mekân için GPT Image 2.5 daha güvenilir (1 kredi).
- Ayna notu v1 (delil numaraları ve "R" imzası); v2 "A" imzalı kullanıldı.

## Maliyet tablosu (CLI/MCP `cost`)
| Model | Kredi/görsel |
|---|---|
| GPT Image 2.5 (medium) | 1 (high: 2) |
| Nano Banana 2 Lite | 1 |
| Z Image | 0.15 |
| Soul Location | 0.12 |

## Erişim notu
CLI (`higgsfield generate`) deneme hesabında `only_mcp_usage_on_trial_is_available` ile reddedildi; üretim claude.ai Higgsfield MCP bağlayıcısıyla (Claude Code'da "claude.ai Higgsfield — Connected") yapıldı. Eş zamanlı iş sınırı 8 (plus planı); toplu istekler 8'erli gönderildi.

## Yeni portre eklerken
1. Aynı stil ekiyle üret, 448² q68 WebP'ye çevir, `portreler/pNN.webp`.
2. `src/arayuz/gorseller.ts` `PORTRE_KAYITLARI`'na `{ id, cinsiyet, yas }` ekle (test: dosya var mı, cinsiyet dengesi).
