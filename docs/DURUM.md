# DURUM

> Her ajan üzerine yazar; kısa tutulur. Son güncelleme: 2026-09-16 07:40, Ajan #1.

## Aktif aşama
**Aşama 3 — Genişleme.** Zorluk, cila ve Kılavuz genişletmesi tamam. Sıradaki: mini oyunlar (kör seçim, soğuk okuma dedektörü, taban oranı), sonra kör nokta → adaptif vaka üretimi.

## Biten işler
- Aşama 0–2 tamam; Aşama 3'te: zorluk seçici + zorlaştırıcılar (11 test), cila (ifade-gerçek tablosu, temel çizgi notu, gösterilen delil işareti).
- **Kılavuz genişletmesi:** yeni bölümler Bellek ve Tanıklık (5), Dikkat ve Sihir (4), İkna ve Manipülasyon (6), Kişilik Okuma (+2); toplam 9 bölüm, 50 madde. Kaynak kütüğü 48 kayıt (Simons & Levin, Johansson, Hall, Rensink & Kuhn, Macknik, Lamont, Freedman & Fraser, Teunisse, Irwin, Naumann, Gosling 2011 eklendi; hepsi NOTLAR.md başlıklarıyla eşleşiyor).
- **İpucu kataloğu:** Navarro saha ipuçları `zayif` düzeyde: yatıştırıcı dokunma (d=.12, suç sorusunda kaygıyla artar → "hangi konu" sinyali), ayakların çıkışa dönmesi (ilişkisiz), vurgu kaybı (d=.14). 19 ipucu. İçerik testi: her bölümde ≥3 madde, ≥9 bölüm, ≥45 madde.

## Sıradaki 3 iş
1. **Mini oyunlar** (TASARIM §13; 2–5 dk, anında geri bildirim): kör seçim (Beyerstein: anonim profillerden kendini bul — Forer'in devamı), soğuk okuma dedektörü (medyum kaydında cümleleri Rowland öğeleriyle etiketle; çoklu etiket puanı), taban oranı bulmacası (%99 doğru test, 1/10.000 hastalık). Depo'da `miniOyun` durumu, Başlık'ta "Tatbikatlar" düğmesi, sonuçlar kayıtla taşınır.
2. **Kör nokta → adaptif üretim:** `korNoktalar()` çıktısını `vakaUretCozulebilir`'e hedef parametre olarak besle (ör. Othello etiketi sıkça → gergin masum garantili; erken delil → SUE'nin belirleyici olduğu vaka).
3. **Şablon havuzu ve mekân genişletme:** dil şablonlarını JSON'a taşı ve büyüt; mekân şablonlarına mekâna özgü delil türleri (hastane ilaç defteri, motel resepsiyon defteri).

## Açık kararlar (kullanıcıya sorulacak)
1. Vaka başına hedef süre → soruşturma saati bütçesi (varsayılan 12).
2. Zor seviyeyi daha da sertleştirmek istenirse `ZORLUK_PARAMETRELERI` tek ayar noktası.
3. "The Mentalist" adının telif riski (K-007).
4. Higgsfield görselleri: portre havuzu için prompt listesi hazırlanabilir (brand.md §6); görsel olmadan da oyun oynanabilir.

## Bilinen hatalar
- Yok.

## Test durumu
- `npm test`: 20 dosya, 213 test geçti (2026-09-16 07:35). Süre ~60 sn.
- `npm run typecheck`: temiz. `npm run build`: tek `dist/index.html`. file:// kontrolü hata 0.

## Notlar
- Kullanıcı: sorun yoksa "devam edeyim mi" sorma, sürekli çalış (16.09.2026).
- Bash heredoc'ta uzun Python/Markdown kırılıyor; yamaları scratchpad `.py` olarak yaz ve çalıştır.
- Depo tekildir; testler `depo.sifirla()` ile izole edilir. Playwright'ta rol tabanlı seçici.
- Sahnelenmiş delil oyuncuya bayrakla gösterilmez; fizik tutarsızlığı ile bulunur.
- İpucu sadakat testi zayıf ipuçlarında gürültüye duyarlı; yeni ipucu eklerken `betimlemeYonu` ve kişilik temel çizgisini (`ipucu.ts KISILIK_TEMELI`) birlikte ekle.
