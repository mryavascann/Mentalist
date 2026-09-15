# DURUM

> Her ajan üzerine yazar; kısa tutulur. Son güncelleme: 2026-09-16 02:10, Ajan #1.

## Aktif aşama
**Aşama 1 — Motor.** Gerçek → bilgi → sırlar → strateji → ipuçları zinciri çalışıyor. Sıradaki: delil üretimi ve teknik motoru.

## Biten işler
- Aşama 0 tamam (kurulum, belge seti, K-001…K-012, içerik şemaları).
- `src/ortak/rastgele.ts` (14 test), `src/icerik/` (16 test; ipucu kataloğuna `betimlemeYonu` alanı eklendi).
- `src/motor/gerceklik.ts` doğruluk grafiği (18), `bilgi.ts` bilgi dağılımı/algı (13), `sirlar.ts` sırlar/korumalar (11), `strateji.ts` konuşma stratejisi + yalan defteri (18).
- `src/motor/ipucu.ts`: cevaba olasılıksal davranış betimlemeleri; z ~ N(mu,1) modeli; katalog d değerleri + koşullar (ihlal/motivasyon) + beceri söndürmesi + kişilik temel çizgisi + suç sorusu gerginliği; `temelCizgi`. 11 test. Ölçülen kaymalar: güçlü ipuçları +0.05…+0.12, mit ipuçları ±0.02; "sadece ipucu botu" dengeli doğruluk şansa yakın.

## Sıradaki 3 iş
1. **Delil üretimi** (`src/motor/delil.ts`): fiziksel/dijital deliller (zaman çizelgesinden türeyen: kim hangi odada iz bıraktı), "beklenen ama olmayan" ipucu, delilin hangi kişi/dilim/odayı doğruladığı; SUE için delil ↔ soru eşlemesi. Test: her delil gerçekle tutarlı; her vakada en az bir "çürütücü" delil (failin yalanıyla çelişen).
2. **Teknik motoru** (`src/motor/teknik.ts`): teknikler.json araçlarının `cevapla` üstünde etkileri — SUE sırası (erken delil → fail hikâyesini uydurur), bilişsel yük (yalanda ipucu kaymasını büyütür), beklenmedik soru (prova dışı → gömülü yalanda çelişki), CIT (`citGecerliMi`), SVT, yönlendirici soru + kontaminasyon kaydı, suçlayıcı ton (herkeste gerginlik + sahte itiraf riski).
3. **Çözülebilirlik denetçisi + denge botları**: vaka eldeki delil/ifadelerle tek çözüme iniyor mu; yöntem botu vs ipucu botu vs herkese-inanan bot.

## Açık kararlar (kullanıcıya sorulacak)
1. Vaka başına hedef oyun süresi (öneri 20–40 dk).
2. "Cam arkası" modu için ikinci oyuncu? (Şimdilik tek oyuncu.)
3. "The Mentalist" adının telif riski (K-007).

## Bilinen hatalar
- Yok.

## Test durumu
- `npm test`: 8 dosya, 103 test geçti (2026-09-16 02:08). Süre ~3 sn (ipucu testi 150 vaka üretir).
- `npm run typecheck`: temiz.
- `npm run build`: tek `dist/index.html`.

## Notlar
- Wiseman ve Rowland kitapları Bookey özeti (K-006).
- `pdftotext` kurulu; PDF'leri sayfa aralığıyla oku.
- Uzun Markdown/JSON dosyalarını Bash heredoc yerine doğrudan dosya yazma aracıyla yaz.
- `dist/index.html`'in `file://` altında açıldığı tarayıcıda elle doğrulanmadı; Aşama 2'de Playwright ile.
- Strateji ve ipucu katmanları metin üretmez; yapısal cevap + katalog betimlemesi üretir. Cümle giydirme dil katmanında (K-009).
- İpucu modelinin sabitleri (ESIK, BECERI_SONDURME, GIZLEME_CARPANI, SUC_SORUSU_GERGINLIK) `ipucu.ts` başında; denge botlarıyla yeniden ayarlanabilir, ama katalog d değerleri kaynaktan gelir ve değişmez.
