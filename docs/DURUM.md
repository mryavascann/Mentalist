# DURUM

> Her ajan üzerine yazar; kısa tutulur. Son güncelleme: 2026-09-16 06:00, Ajan #1.

## Aktif aşama
**Aşama 2 — Dikey dilim TAMAMLANDI** (oynanabilir, tek dosya, Forer dersi, Kılavuz, kayıt). Sıradaki: Aşama 3 başlangıcı (denge/zorlaştırıcı, cila, içerik genişletme).

## Biten işler
- Aşama 0 + 1 (motor, 161 test), dil katmanı (19), depo (12), ekranlar + jsdom (4), Forer (4).
- Forer tutorial'ı (`src/icerik/forer.json`, `Forer.tsx`, depo `forerBasla/forerCevapla/forerPuanla/forerBitir`): ilk vakadan önce otomatik; Başlık'ta "Açılış dersi" düğmesi; kayıtla taşınır.
- Kılavuz'a "Soğuk ve Sıcak Okuma" bölümü: Forer/Barnum, soğuk okuma öğeleri, bloklama kuralları (32 madde, 6 bölüm). Kaynak kütüğüne Poškus 2014 eklendi (37 kaynak).
- İpucu kartı (`IpucuKarti.tsx`): sorgu odasında her davranış betimlemesi tıklanabilir → katalog kaydı (rozet, d, not, kaynak, "kanıt değil" uyarısı). Konuşma kayıtları `gozlemler` alanı taşır.
- `scripts/dosya-kontrol.mjs` Forer akışını da geçer.

## Sıradaki 3 iş
1. **Denge/zorlaştırıcı** (kullanıcı kararı bekliyor ama öneri hazır): (a) fail kaçamak oranını beceriye göre değil vaka zorluğuna göre ayarla, (b) görgü tanığı "korku" koruması (fail tehditkâr → tanık susar), (c) sahnelenmiş delil bayrağı (Norwood şablonu) + fizik kontrolü, (d) sızıntı oranı 0.35 → zorluk seviyesine bağlı. Zorluk seçici: `vakaUretCozulebilir(seed, { hedefZorluk })`.
2. **Cila:** analizde her kişi için "ilk ifade vs son ifade" özeti; kişi kartına temel çizgi notu; mobil sorgu düzeninde akış yüksekliği; klavye erişilebilirliği.
3. **İçerik genişletme:** Kılavuz "Bellek ve Tanıklık", "Dikkat ve Sihir", "İkna ve Manipülasyon" bölümleri (NOTLAR'da hazır); Navarro yatıştırıcı davranışları ipucu kataloğuna (`zayif`); şablon havuzunu büyüt.

## Açık kararlar (kullanıcıya sorulacak)
1. Vaka başına hedef süre → soruşturma saati bütçesi (varsayılan 12).
2. Zorlaştırıcılar (yukarıdaki a–d) ve zorluk seviyeleri (kolay/orta/zor) oyuncuya seçtirilsin mi?
3. "The Mentalist" adının telif riski (K-007).

## Bilinen hatalar
- Yok.

## Test durumu
- `npm test`: 19 dosya, 200 test geçti (2026-09-16 05:55).
- `npm run typecheck`: temiz. `npm run build`: tek `dist/index.html`.
- `node scripts/dosya-kontrol.mjs`: yerel Chrome ile file:// akışı (Forer dahil).

## Notlar
- Kullanıcı: sorun yoksa "devam edeyim mi" sorma, sürekli çalış (16.09.2026).
- Bash heredoc içinde uzun Python/Markdown yazmak bu ortamda kırılıyor (kesme işaretleri); yamaları scratchpad'e `.py` olarak yaz, `python dosya.py` ile çalıştır.
- Depo tekildir (`kullan.ts`); testler `depo.sifirla()` ile izole edilir.
- Playwright `text=` seçicisi alt dize eşleştirir; rol tabanlı seçici kullan.
