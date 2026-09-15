# DURUM

> Her ajan üzerine yazar; kısa tutulur. Son güncelleme: 2026-09-16 01:45, Ajan #1.

## Aktif aşama
**Aşama 1 — Motor.** Gerçek → bilgi → sırlar → strateji zinciri çalışıyor. Sıradaki: ipucu üretimi.

## Biten işler
- Aşama 0 tamam (kurulum, belge seti, K-001…K-012, içerik şemaları).
- `src/ortak/rastgele.ts` (14 test), `src/icerik/` (16 test).
- `src/motor/gerceklik.ts`: doğruluk grafiği v0 (18 test).
- `src/motor/bilgi.ts`: bilgi dağılımı + algı modeli (kendisi/gördü/dedikodu/medya; dikkat boşluğu; medya sızıntısı; `citGecerliMi`, `kimBiliyor`) (13 test).
- `src/motor/sirlar.ts`: suçla ilgisiz sırlar (6 tür; gizli ilişki gerçekle tutarlı), korumalar (borç/aile/eş/sevgili/ortak sır) (11 test).
- `src/motor/strateji.ts`: `vakaDurumuKur`, `cevapla`, yalan defteri; ifade türleri: dogru, gomulu-yalan, kacamak, gizleme, alakasiz-sir, koruma-yalani, bellek-uyumu, dikkat-boslugu (18 test).

## Sıradaki 3 iş
1. **İpucu üretimi** (`src/motor/ipucu.ts`): her cevaba, ifade türü + kişilik (kaygı, öz-izleme, yalan becerisi) + koşullar (motivasyon, ihlal, plansız) üzerinden ipucu kataloğundan olasılıksal davranış betimlemeleri ekle. Masumlar da üretir (kaygı, alakasız sır, kişisel tetikleyici). Bilimsel sadakat testi: katalog d değerleriyle simülasyondaki yalan/doğru farkı tutarlı; "sadece ipucuya bakan bot" şansa yakın.
2. **Delil üretimi** (`src/motor/delil.ts`): fiziksel/dijital deliller, "beklenen ama olmayan" ipucu; SUE için delil-konu eşlemesi.
3. **Soru/teknik motoru**: teknikler.json'daki araçların (SUE, bilişsel yük, beklenmedik soru, CIT, SVT, yönlendirici soru + kontaminasyon kaydı) `cevapla` üstünde etkileri; ardından çözülebilirlik denetçisi ve denge botları.

## Açık kararlar (kullanıcıya sorulacak)
1. Vaka başına hedef oyun süresi (öneri 20–40 dk).
2. "Cam arkası" modu için ikinci oyuncu (sorgucu)? (Şimdilik tek oyuncu.)
3. "The Mentalist" adının telif riski (K-007); ticari plan olursa yeniden konuşulacak.

## Bilinen hatalar
- Yok.

## Test durumu
- `npm test`: 7 dosya, 92 test geçti (2026-09-16 01:44).
- `npm run typecheck`: temiz.
- `npm run build`: tek `dist/index.html`.

## Notlar
- Wiseman ve Rowland kitapları Bookey özeti (K-006).
- `pdftotext` kurulu; PDF'leri sayfa aralığıyla oku.
- Uzun Markdown/JSON dosyalarını Bash heredoc yerine doğrudan dosya yazma aracıyla yaz.
- `dist/index.html`'in `file://` altında açıldığı tarayıcıda elle doğrulanmadı; Aşama 2'de Playwright ile.
- Zaman çizelgesi 19:00–23:00, 8 dilim (`DILIM_SAYISI`).
- Strateji katmanı metin üretmez; yapısal cevap (`Cevap`) üretir. Metin giydirme dil katmanında (K-009).
