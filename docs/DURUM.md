# DURUM

> Her ajan üzerine yazar; kısa tutulur. Son güncelleme: 2026-09-16 01:20, Ajan #1.

## Aktif aşama
**Aşama 1 — Motor.** Doğruluk grafiği v0 tamam; sıradaki katman bilgi dağılımı + sırlar.

## Biten işler
- Aşama 0 tamam (kurulum, belge seti, kararlar K-001…K-012, içerik şemaları).
- `src/ortak/rastgele.ts`: seedli RNG + alt akışlar (14 test).
- `src/icerik/`: 6 JSON kütüğü + doğrulayıcı (16 test).
- `src/motor/tipler.ts`, `havuzlar.ts`, `gerceklik.ts`: mekân (8 şablon, TR/yurtdışı), 5–8 kişi (kişilik 4 boyut + yalan becerisi), kurban-merkezli ilişki grafiği + yan bağlar + borç grafiği, olay çekirdeği (cinayet/hırsızlık/sabotaj/kaza; fail DÜZGÜN dağılımla), 8 dilimlik gerçek zaman çizelgesi (olay kısıtları uygulanır). 18 test; 600 seed'lik ilk örüntü denetimi dahil.

## Sıradaki 3 iş
1. **Bilgi dağılımı** (`src/motor/bilgi.ts`): her kişi için "neyi, NASIL biliyor" (gördü / duydu / dedikodu / medya); algı modeli (aynı odadaki olayı görme olasılığı, dikkat boşluğu); bu, gizli bilgi testinin geçerliliğini belirler.
2. **Sırlar ve motivasyonlar** (`src/motor/sirlar.ts`): suçla ilgili ve ilgisiz sırlar (ilişki, borç, utanç); koruma ilişkileri borç grafiğinden; "gergin masum" tohumu.
3. **NPC konuşma stratejisi + yalan defteri** (`src/motor/strateji.ts`): soru başına doğru/yalan/gizleme/kaçamak kararı; tutarlılık testi.

## Açık kararlar (kullanıcıya sorulacak)
1. Vaka başına hedef oyun süresi (öneri 20–40 dk).
2. "Cam arkası" modu için ikinci oyuncu (sorgucu) düşünülsün mü? (Şimdilik tek oyuncu varsayımı.)
3. "The Mentalist" adının telif riski uyarısı verildi (K-007); ticari plan olursa yeniden konuşulacak.

## Bilinen hatalar
- Yok.

## Test durumu
- `npm test`: 4 dosya, 50 test geçti (2026-09-16 01:18).
- `npm run typecheck`: temiz.
- `npm run build`: tek `dist/index.html`.

## Notlar
- Wiseman ve Rowland kitapları Bookey özeti (K-006).
- `pdftotext` kurulu; PDF'leri sayfa aralığıyla oku.
- Uzun Markdown/JSON dosyalarını Bash heredoc yerine doğrudan dosya yazma aracıyla yaz.
- `dist/index.html`'in `file://` altında açıldığı tarayıcıda elle doğrulanmadı; Aşama 2'de Playwright ile.
- Zaman çizelgesi 19:00–23:00, 30 dk'lık 8 dilim (`DILIM_SAYISI`); vaka türüne göre esnetilebilir.
