# DURUM

> Her ajan üzerine yazar; kısa tutulur. Son güncelleme: 2026-09-16 02:50, Ajan #1.

## Aktif aşama
**Aşama 1 — Motor.** Gerçek → bilgi → sırlar → strateji → ipuçları → deliller → teknikler zinciri çalışıyor. Sıradaki: çözülebilirlik denetçisi, puanlama, denge botları.

## Biten işler
- Aşama 0 tamam (kurulum, belge seti, K-001…K-012, içerik şemaları).
- `src/ortak/rastgele.ts` (14), `src/icerik/` (16).
- `src/motor/`: `gerceklik.ts` (18), `bilgi.ts` (13), `sirlar.ts` (11), `strateji.ts` (18), `ipucu.ts` (11; artık `kaymaCarpani`/`ekGerginlik`/`etiket` seçenekleri var).
- `src/motor/delil.ts` (12): failin olay yerindeki izi (çözülebilirlik tohumu), yöntem delili (sızma bayrağı), "beklenen ama olmayan" (kapı/köpek/boğuşma), gürültü izleri (masumlar da; gergin masum delille yakalanabilir), `celisenDeliller`.
- `src/motor/teknik.ts` (19): `Sorgu` (gösterilen deliller, kontaminasyon kaydı, stres, zaman, geçmiş), `sor` (erken gösterilen delil → fail hikâyesini delile uydurur), `delilGoster`, `teknikUygula` — 12 teknik: temel çizgi, açık uçlu, yönlendirici (telkine yatkın+bilgisiz → sahte anı + kontaminasyon), SUE (geç → çelişki; erken → kaçamak), bilişsel yük (ipucu ×1.6, oda yalanında defterden sapma), beklenmedik soru (yalancı odadaki kişileri bilmez), CIT (`citGecerliMi`; sızmışsa masum da tanır), SVT (bilip saklayan şans altı), şaşkınlık, sahte bilgi yemi, şeytanın avukatı (v0 uygulanamaz), suçlayıcı ton (stres → herkes gerilir; telkine yatkın masum sahte itiraf; düşük becerili fail itiraf).

## Sıradaki 3 iş
1. **Çözülebilirlik denetçisi + zorluk puanı** (`src/motor/cozulebilirlik.ts`): eldeki deliller + dürüst ifadeler + teknik sonuçlarıyla fail tek adaya iniyor mu? Kaza vakasında "suç yok" sonucuna ulaşılabiliyor mu? Zorluk: görgü tanığı var mı, fail kaçamak mı, delil dijital mi, koruma var mı, sızıntı var mı. Örüntü denetçisini tam sürüme çıkar (çok özellikli korelasyon).
2. **Puanlama + kalibrasyon** (`src/motor/puan.ts`): suçlama, güven beyanı, yanlış suçlama cezası, sahte itiraf cezası, kirletilen tanık, delil kalitesi, zaman; hata etiketleri (hata_etiketleri.json) otomatik atanır (Othello, erken delil, tanık kirletme, sosyal kanıt…).
3. **Denge botları** (`tests/denge/`): ipucu botu, yöntem botu (SUE + beklenmedik soru + CIT), herkese-inanan bot, herkese-yalancı bot → yöntem botu belirgin şekilde üstün.

## Açık kararlar (kullanıcıya sorulacak)
1. Vaka başına hedef oyun süresi (öneri 20–40 dk) → soruşturma saati bütçesi (teknik maliyetleri toplamı).
2. "Cam arkası" modu için ikinci oyuncu? (Şimdilik tek oyuncu.)
3. "The Mentalist" adının telif riski (K-007).

## Bilinen hatalar
- Yok.

## Test durumu
- `npm test`: 10 dosya, 132 test geçti (2026-09-16 02:48). Süre ~8 sn.
- `npm run typecheck`: temiz.
- `npm run build`: tek `dist/index.html`.

## Notlar
- Wiseman ve Rowland kitapları Bookey özeti (K-006).
- `pdftotext` kurulu; PDF'leri sayfa aralığıyla oku.
- Uzun Markdown/JSON dosyalarını Bash heredoc yerine doğrudan dosya yazma aracıyla yaz.
- `dist/index.html`'in `file://` altında açıldığı tarayıcıda elle doğrulanmadı; Aşama 2'de Playwright ile.
- Motor katmanları metin üretmez; yapısal sonuç üretir. Cümle giydirme dil katmanında (K-009).
- İpucu testi zayıf ipuçlarında (|d|<.3) gürültüye duyarlı: RNG anahtarı değişirse yön testi kırılabilir; o zaman örneklem büyütülür, model gevşetilmez.
