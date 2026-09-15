# DURUM

> Her ajan üzerine yazar; kısa tutulur. Son güncelleme: 2026-09-16, Ajan #1.

## Aktif aşama
**Aşama 0 — Kurulum** (büyük ölçüde tamam; iki madde açık, bkz. YOL_HARITASI.md)

## Biten işler
- Klasör yapısı, kaynaklar (`docs/kaynaklar/mentaldocs/`: 7 kitap + 59 makale) ve kaynak indeksi.
- Belge seti: 00_BASLA_BURADAN, DURUM, AJAN_GUNLUGU, KARARLAR (K-001…K-006), YOL_HARITASI, brand.md, TASARIM.md (tohumdan), AJAN_PROMPTU.md.
- TypeScript 7 + Vite 8 + React 19 + Vitest 5 kurulu; `npm test`, `npm run typecheck`, `npm run build` yeşil.
- `src/ortak/surum.ts` + `tests/duman.test.ts` (2 test).

## Sıradaki 3 iş
1. **İçerik şemaları** (Aşama 0 son maddesi): `src/ortak/tipler.ts` içinde İpucuKaydı, İfadeTürü, SoruTürü, KılavuzMaddesi tipleri; `src/icerik/` altına her biri için 2–3 örnek JSON; içerik testi (her kaydın `kaynak` alanı NOTLAR.md başlıklarından biriyle eşleşiyor mu, kanıt düzeyi geçerli mi).
2. **Seedli rastgelelik** (Aşama 1 ilk tuğla): `src/ortak/rastgele.ts` — aynı seed aynı dizi; `sec`, `karistir`, `agirlikliSec`, `normal` yardımcıları; testleri.
3. **Çekirdek tipler ve doğruluk grafiği** (Aşama 1): Kişi, İlişki/Borç grafiği, Zaman çizelgesi, Olay, Delil, İfade; "önce gerçek" üreticisinin ilk sürümü + tutarlılık testi.

## Açık kararlar (kullanıcıya sorulacak)
1. Oyun adı ve kahramanın adı (çalışma adı: Soğuk Okuma; alternatifler: Temel Çizgi, Sızıntı, Kanepe).
2. Mekân: Türkiye'de kurgusal şehir mi, yurtdışı mı?
3. Runtime'da LLM kullanılacak mı (yalnızca diyalog üslubu için)? Hangi sınırlarla?
4. Platform: tarayıcı (öneri) / masaüstü paketi.
5. Kılavuz maddeleri baştan mı açık, karşılaşıldıkça mı?
6. Kayıt: tarayıcı depolaması mı, dosya dışa aktarma mı?
7. Kaynak PDF'ler git'e alınmasın kararı (K-002) uygun mu?
8. `docs/mentaldocs.zip` (120 MB) açıldı; artık silinebilir — kullanıcı onayı bekleniyor.

## Bilinen hatalar
- Yok.

## Test durumu
- `npm test`: 1 dosya, 2 test geçti (2026-09-16 00:36).
- `npm run typecheck`: temiz.
- `npm run build`: temiz (219 KB JS, 69 KB gzip).

## Notlar
- Wiseman ve Rowland kitapları Bookey özeti (K-006).
- Bu makinede `pdftotext` var; PDF'leri sayfa aralığıyla oku.
- Henüz commit atılmadı; ilk commit kullanıcı onayıyla.
