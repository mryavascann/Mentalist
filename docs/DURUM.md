# DURUM

> Her ajan üzerine yazar; kısa tutulur. Son güncelleme: 2026-09-16 05:10, Ajan #1.

## Aktif aşama
**Aşama 2 — Dikey dilim.** Oynanabilir ilk sürüm hazır: dil katmanı + React ekranları + kayıt. Sıradaki: Forer tutorial'ı, cilalama, Playwright.

## Biten işler
- Aşama 0 + Aşama 1 (motor, 161 test). Dil katmanı (19 test).
- `src/arayuz/oyun/depo.ts` (12 test): React'ten bağımsız oyun deposu — ekran akışı, kişi seçimi, soru/teknik/delil gösterme, konuşma kayıtları (soru metni + cevap metni + betimleme), pano (4 sütun, hipotez limiti 7), suçlama → `puanla`, gerçeğin anlatımı, kör nokta geçmişi, JSON dışa/içe aktarma (defter ve sorgu kayıtları dahil), `sifirla`.
- `src/arayuz/oyun/metinler.ts`: soru cümleleri, teknik sonuç özetleri (gizli bilgi sızdırmaz).
- `src/arayuz/oyun/kullan.ts`: tek depo + `useSyncExternalStore`; localStorage otomatik kayıt (try/catch).
- Ekranlar (`src/arayuz/ekranlar/`): Kabuk (sekmeler, zaman bütçesi), Baslik (kahraman adı, vaka kodu, kayıt dışa/içe, sıfırla), VakaAcilis (brifing, kişi kartları, deliller + sızıntı rozeti), SorguOdasi (kişiler | akış | sorular+teknikler+deliller), Pano (mantar pano), Suclama (kişi/suç yok, güven, dayanaklar, kontrol listesi), Analiz (puan, kalibrasyon, cezalar, hata etiketleri → Kılavuz, gerçeğin anlatımı, kör noktalar), Kilavuz (5 bölüm, rozetler, "karşılaştın").
- `src/arayuz/stil.css`: brand.md dili, yalnızca sistem fontları (çevrimdışı).
- `tests/arayuz/App.test.tsx` (jsdom, 2 test): bir vaka baştan sona + tarayıcı kaydı.
- `scripts/dosya-kontrol.mjs`: `dist/index.html`'i yerel Chrome/Edge ile `file://` altında açıp bir akışı doğrular (Playwright; tarayıcı indirmez).

## Sıradaki 3 iş
1. **Forer tutorial'ı** (TASARIM §13): ilk açılışta kısa "kişilik testi" → herkese aynı 13 madde → puanlat → ifşa; Kılavuz'a "Soğuk Okuma / Barnum" maddesi.
2. **Cila:** sorgu odasında ipucu betimlemelerinin katalog id'siyle Kılavuz'a bağlanması (tıkla → madde), delil gösterildi rozeti, hipotez sayacı, mobil düzen kontrolü, analizde "ilk ifade vs son ifade" özeti.
3. **Zorlaştırıcı ve denge** (kullanıcı kararı bekliyor): kaçamak oranı, korkuyla susan tanık, sahnelenmiş delil.

## Açık kararlar (kullanıcıya sorulacak)
1. Vaka başına hedef süre → soruşturma saati bütçesi (varsayılan 12; soru 0.5 saat, teknikler 0.5–2 saat).
2. Denge: metodik oyuncu için oyun kolay; zorlaştırıcılar.
3. "The Mentalist" adının telif riski (K-007).

## Bilinen hatalar
- Yok.

## Test durumu
- `npm test`: 17 dosya, 194 test geçti (2026-09-16 05:05).
- `npm run typecheck`: temiz. `npm run build`: tek `dist/index.html` (~356 KB).
- `node scripts/dosya-kontrol.mjs`: yerel tarayıcı varsa `file://` doğrulaması (sonucu günlükte).

## Notlar
- Kullanıcı: sorun yoksa "devam edeyim mi" sorma, sürekli çalış (16.09.2026).
- Wiseman ve Rowland kitapları Bookey özeti (K-006).
- Uzun dosyaları doğrudan dosya yazma aracıyla yaz; Python yamalarında regex kaçışlarına dikkat.
- Depo tekildir (`kullan.ts`); testler `depo.sifirla()` ile izole edilir.
- Şablon havuzu `dil.ts` içinde; büyüyünce JSON'a taşınabilir.
