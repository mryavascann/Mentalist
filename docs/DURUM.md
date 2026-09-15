# DURUM

> Her ajan üzerine yazar; kısa tutulur. Son güncelleme: 2026-09-16 08:30, Ajan #1.

## Aktif aşama
**Aşama 3 — Genişleme.** Zorluk, cila, Kılavuz genişletmesi, üç tatbikat ve adaptif üretim tamam. Sıradaki: şablon/mekân genişletme, kalan Kılavuz bölümleri, Higgsfield prompt listesi.

## Biten işler
- Aşama 0–2 tamam; Aşama 3'te: zorluk seçici + zorlaştırıcılar (11 test), cila (ifade-gerçek tablosu, temel çizgi notu, gösterilen delil işareti).
- **Kılavuz genişletmesi:** yeni bölümler Bellek ve Tanıklık (5), Dikkat ve Sihir (4), İkna ve Manipülasyon (6), Kişilik Okuma (+2); toplam 9 bölüm, 50 madde. Kaynak kütüğü 48 kayıt (Simons & Levin, Johansson, Hall, Rensink & Kuhn, Macknik, Lamont, Freedman & Fraser, Teunisse, Irwin, Naumann, Gosling 2011 eklendi; hepsi NOTLAR.md başlıklarıyla eşleşiyor).
- **Tatbikatlar** (`src/icerik/mini_oyunlar.{json,ts}`, `Tatbikat.tsx`, depo `tatbikatAc/korSecimBitir/sogukOkumaBitir/tabanOraniBitir/tatbikatKapat`): kör seçim (4 anonim profil, ifşa), soğuk okuma dedektörü (8 öğe × 8 cümle, çoklu etiket puanı: doğru +1 / yanlış −1), taban oranı (%99 test, 1/10.000). Başlık'ta düğmeler, sonuçlar kayıtla taşınır.
- **Adaptif üretim** (`src/motor/adaptif.ts`): `hedeflerdenAyar(korNoktalar)` → en fazla 2 yapısal hedef; `vakaUretHedefli(seed, hedefler, ayar)` seed türevlerini deneyip çözülebilir + hedefleri sağlayan vakayı döndürür (hedef ≥%85 sağlanır, 30 denemede). Depo `yeniVaka` bunu kullanır; `durum.hedefler` analizde açıklanır; Kılavuz'da dinamik "Senin kör noktan" bölümü. 10 + 1 test.
- **İpucu kataloğu:** Navarro saha ipuçları `zayif` düzeyde: yatıştırıcı dokunma (d=.12, suç sorusunda kaygıyla artar → "hangi konu" sinyali), ayakların çıkışa dönmesi (ilişkisiz), vurgu kaybı (d=.14). 19 ipucu. İçerik testi: her bölümde ≥3 madde, ≥9 bölüm, ≥45 madde.

## Sıradaki 3 iş
1. **Şablon havuzu ve mekân genişletme:** dil şablonlarını JSON'a taşı ve büyüt; mekân şablonlarına mekâna özgü delil türleri (hastane ilaç defteri, motel resepsiyon defteri).
2. **Kalan Kılavuz bölümleri:** Duygular (Ekman + Barrett + Othello), İnanç/Paranormal/Tarikat (French, Festinger, Irwin), Holmes Gibi Düşünmek (Konnikova).
3. **Higgsfield prompt listesi** (brand.md §6) + portre yer tutucuları (SVG siluet) — kullanıcı üretir, `assets/KAYIT.md` tutulur.

## Açık kararlar (kullanıcıya sorulacak)
1. Vaka başına hedef süre → soruşturma saati bütçesi (varsayılan 12).
2. Zor seviyeyi daha da sertleştirmek istenirse `ZORLUK_PARAMETRELERI` tek ayar noktası.
3. "The Mentalist" adının telif riski (K-007).
4. Higgsfield görselleri: portre havuzu için prompt listesi hazırlanabilir (brand.md §6); görsel olmadan da oyun oynanabilir.

## Bilinen hatalar
- Yok.

## Test durumu
- `npm test`: 22 dosya, 227 test geçti (2026-09-16 08:30). Süre ~75 sn.
- `npm run typecheck`: temiz. `npm run build`: tek `dist/index.html`. file:// kontrolü hata 0.

## Notlar
- Kullanıcı: sorun yoksa "devam edeyim mi" sorma, sürekli çalış (16.09.2026).
- Bash heredoc'ta uzun Python/Markdown kırılıyor; yamaları scratchpad `.py` olarak yaz ve çalıştır.
- Depo tekildir; testler `depo.sifirla()` ile izole edilir. Playwright'ta rol tabanlı seçici.
- Sahnelenmiş delil oyuncuya bayrakla gösterilmez; fizik tutarsızlığı ile bulunur.
- İpucu sadakat testi zayıf ipuçlarında gürültüye duyarlı; yeni ipucu eklerken `betimlemeYonu` ve kişilik temel çizgisini (`ipucu.ts KISILIK_TEMELI`) birlikte ekle.
