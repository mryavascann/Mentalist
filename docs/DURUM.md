# DURUM

> Her ajan üzerine yazar; kısa tutulur. Son güncelleme: 2026-09-16 01:05, Ajan #1.

## Aktif aşama
**Aşama 1 — Motor** başladı. Aşama 0 tamamlandı (kurulum + içerik şemaları).

## Biten işler
- Kurulum: klasörler, kaynaklar (7 kitap + 59 makale, git dışı), belge seti, TS 7 + Vite 8 + React 19 + Vitest 5, tek dosya derleme (K-010).
- Kullanıcı kararları işlendi: K-007…K-012 (ad, mekân, LLM yok, tek HTML, kayıt, Kılavuz açık).
- `src/ortak/rastgele.ts`: seedli RNG (mulberry32 + FNV-1a), tamsayi/sec/karistir/agirlikliSec/sans/normal/altUret. 14 test.
- `src/icerik/`: tipler, doğrulayıcı, yükleyici + 6 JSON kütüğü: 36 kaynak, 16 ipucu (DePaulo 2003 d değerleriyle), 15 ifade türü, 12 teknik, 29 Kılavuz maddesi (5 bölüm: yalan-tespitinin-bilimi, sorgulama-teknikleri, bilissel-yanliliklar, kisilik-okuma, mitler-muzesi), 18 hata etiketi. 16 içerik testi (K-004 NOTLAR eşleşmesi dahil).

## Sıradaki 3 iş
1. **Çekirdek tipler + doğruluk grafiği v0** (`src/motor/tipler.ts`, `src/motor/gerceklik.ts`): mekân, isim havuzu, 5–8 kişi, ilişki/borç grafiği, olay çekirdeği, gerçek zaman çizelgesi, fail seçimi. Testler: aynı seed aynı vaka; zaman çizelgesi tutarlı (kimse aynı anda iki yerde değil); fail dağılımı düzgün (ilk örüntü denetimi).
2. **Bilgi dağılımı + sırlar**: kim neyi nasıl biliyor (gördü/duydu/dedikodu); suçla ilgili ve ilgisiz sırlar; koruma ilişkileri (borç grafiğinden).
3. **NPC konuşma stratejisi + yalan defteri**: her soru için doğru/yalan/gizleme/kaçamak kararı; tutarlılık testi (yalanı kendi defteriyle çelişmez; doğru dediği gerçekle eşleşir).

## Açık kararlar (kullanıcıya sorulacak)
1. Vaka başına hedef oyun süresi (öneri 20–40 dk).
2. "Cam arkası" modu için ikinci oyuncu (sorgucu) düşünülsün mü? (Şimdilik tek oyuncu varsayımı.)
3. "The Mentalist" adının telif riski uyarısı verildi (K-007); ticari plan olursa yeniden konuşulacak.

## Bilinen hatalar
- Yok.

## Test durumu
- `npm test`: 3 dosya, 32 test geçti (2026-09-16 01:03).
- `npm run typecheck`: temiz.
- `npm run build`: tek `dist/index.html`, harici script yok.

## Notlar
- Wiseman ve Rowland kitapları Bookey özeti (K-006).
- Bu makinede `pdftotext` var; PDF'leri sayfa aralığıyla oku.
- Uzun Markdown/JSON dosyalarını Bash heredoc yerine doğrudan dosya yazma aracıyla yaz (kaçış hatası yaşandı).
- `dist/index.html`'in `file://` altında gerçekten açıldığı henüz tarayıcıda elle doğrulanmadı; Aşama 2'de Playwright ile otomatikleştirilecek.
