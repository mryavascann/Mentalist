# AJAN GÜNLÜĞÜ

> Sadece eklenir, silinmez. En yeni kayıt en altta. Şablon `AJAN_PROMPTU.md` §5'te.
> Günlük çok büyürse eski kayıtlar tarihli kısa özete dönüştürülür, son 10 kayıt olduğu gibi kalır.

---

## [2026-09-16 00:40] Ajan #1 — İlk kurulum (Durum A)
**Görev:** Boş depoda projeyi kurmak: klasör yapısı, kaynakların yerleştirilmesi, belge seti, test altyapısı, duman testi.

**Yapılanlar:**
- Depo boştu (sadece `.gitattributes`). Kullanıcının Downloads'taki üç belgesi (`NOTLAR (1).md`, `OYUN_TASARIM_TOHUMU.md`, `AJAN_PROMPTU.md`) `docs/` altına taşındı; kullanıcı `mentaldocs.zip`'i `docs/` içine koydu, `docs/kaynaklar/mentaldocs/{kitaplar,makaleler}` olarak açıldı (7 kitap + 59 makale).
- Adı belirsiz 22 PDF `pdftotext` ile ilk sayfadan tanımlandı; `docs/kaynaklar/KAYNAK_INDEKSI.md` yazıldı (5 çift kopya işaretlendi).
- Belge seti oluşturuldu: `00_BASLA_BURADAN.md`, `DURUM.md`, `AJAN_GUNLUGU.md`, `KARARLAR.md` (K-001…K-006), `YOL_HARITASI.md`, `brand.md` (v0.1), `TASARIM.md` (tohumun yaşayan kopyası), `assets/KAYIT.md`.
- npm projesi: TypeScript 7.0, Vite 8.3, React 19.3, Vitest 5.0, jsdom 30, @types/node. `tsconfig.json`, `vite.config.ts` (takma adlar), `index.html`, `src/arayuz/{main,App}.tsx` (yer tutucu), `src/ortak/surum.ts`.
- `tests/duman.test.ts` yazıldı; önce çalıştırıldı, yeşil görüldü.
- `.gitignore`: node_modules, dist, kaynak PDF'ler ve zip.

**Değişen dosyalar:** yukarıdakilerin tamamı (hepsi yeni).

**Testler:** 2 geçti / 0 kaldı (komut: `npm test`). `npm run typecheck` ve `npm run build` temiz.

**Alınan kararlar:** K-001 (teknoloji), K-002 (PDF'ler git dışı), K-003 (TASARIM.md yaşayan belge), K-004 (kaynak adları NOTLAR başlıklarıyla), K-005 (klasör/takma adlar), K-006 (Wiseman/Rowland özet).

**Sorunlar / riskler:**
- TypeScript 7 (yeni nesil derleyici) `baseUrl`'i kaldırdı; `paths` göreli yazıldı. Diğer araçlarla uyumsuzluk çıkarsa TS 5.x'e dönülebilir.
- Bash heredoc ile uzun Markdown yazarken kaçış hatası alındı; belgeler Write aracıyla yazıldı. Sonraki ajanlar için not: uzun belgeleri heredoc yerine doğrudan dosya yazma aracıyla yaz.
- Zip dışı kaynaklar (Kahneman TFS, ekibin sunumu) elde yok.

**Yarım kalanlar:**
- Aşama 0'ın son maddesi (içerik şemaları) başlanmadı.
- Commit atılmadı (kullanıcı onayı bekleniyor).

**Sıradaki ajan için:**
1) `DURUM.md`'deki 8 açık kararı kullanıcıya sor; yanıtları `KARARLAR.md`'ye işle.
2) İçerik şemalarını yaz (tipler + örnek JSON + içerik testi) — önce test.
3) `src/ortak/rastgele.ts` seedli RNG ile Aşama 1'e gir.

**Geliştirme fikirleri:**
- İçerik testinde `kaynak` alanını `NOTLAR.md` başlıklarına karşı otomatik doğrula (K-004'ü test altına al).
- Örüntü denetçisini baştan tasarla: vaka üreticisi yazılırken her özellik için "fail ile korelasyon ≈ 0" testi eş zamanlı gelsin.

## [2026-09-16 01:05] Ajan #1 — Kullanıcı kararları, LLM araştırması, RNG ve içerik şemaları
**Görev:** Kullanıcının kararlarını işlemek (ad, mekân, LLM, platform), zip'i silmek, commit atmak ve Aşama 0'ın son maddesi + Aşama 1'in ilk tuğlasıyla devam etmek.

**Yapılanlar:**
- Kararlar K-007…K-012'ye yazıldı; TASARIM §19 güncellendi; proje adı "The Mentalist" (surum.ts, package.json, index.html).
- LLM sorusu araştırıldı (WebLLM gereksinimleri, Tracery/gramer yaklaşımı) → runtime'da LLM yok, seedli şablon-gramer motoru (K-009).
- `vite-plugin-singlefile` eklendi; `npm run build` tek `dist/index.html` üretiyor (K-010). `docs/mentaldocs.zip` silindi.
- Aşama 0 commit'i atıldı (2136a51).
- TDD ile: `tests/ortak/rastgele.test.ts` (14 test) → `src/ortak/rastgele.ts`; `tests/icerik/semalar.test.ts` (16 test) → `src/icerik/{tipler,dogrula,index}.ts` + 6 JSON kütüğü. Önce kırmızı görüldü, sonra yeşil.
- İçerik: 36 kaynak kaydı (NOTLAR başlık anahtarlarıyla), 16 ipucu (DePaulo 2003 d değerleri, koşullar, 3+ betimleme varyantı), 15 ifade türü, 12 teknik (etkiler = tasarım parametresi), 29 Kılavuz maddesi, 18 hata etiketi (Funder RAM katmanlı).

**Değişen dosyalar:** docs/{KARARLAR,TASARIM,DURUM,YOL_HARITASI,brand,00_BASLA_BURADAN}.md, vite.config.ts, package.json, index.html, src/ortak/{surum,rastgele}.ts, src/icerik/*, tests/ortak/rastgele.test.ts, tests/icerik/semalar.test.ts.

**Testler:** 32 geçti / 0 kaldı (komut: `npm test`). `npm run typecheck` temiz. `npm run build` tek dosya.

**Alınan kararlar:** K-007…K-012.

**Sorunlar / riskler:**
- "The Mentalist" adı tescilli; kullanıcı uyarıyı bilerek seçti (K-007).
- `etkiler` sayıları (teknikler.json) kaynaktan gelen ölçüm değil, tasarım parametresi; denge botları ile ayarlanacak. Bu ayrım tipler.ts yorumunda belirtildi.
- Doğrulayıcı `iliskisiz` eşiği |d| ≤ 0.1 (DePaulo'daki .01–.09 aralığına göre); ileride tartışılabilir.

**Yarım kalanlar:** Aşama 1 ilk tuğlası (çekirdek tipler + doğruluk grafiği) bu kayıttan sonra başlıyor; tamamlanmazsa DURUM.md "Sıradaki 3 iş" geçerli.

**Sıradaki ajan için:**
1) `src/motor/tipler.ts` + `src/motor/gerceklik.ts` (mekân, kişiler, ilişki/borç grafiği, olay, zaman çizelgesi, fail) — önce test.
2) İlk örüntü denetimi testini hemen yaz: 500 seed'de failin indeks/özellik dağılımı düzgün mü.
3) Bilgi dağılımı ve sırlar katmanı.

**Geliştirme fikirleri:**
- İpucu kataloğunu Navarro'nun "yatıştırıcı davranış" kümesiyle (kanitDuzeyi: zayif, kaynak: Navarro) genişlet; hepsi "hangi konu" sinyali olarak modellenir.
- Kılavuz'a "Bellek ve Tanıklık" ile "Soğuk Okuma" bölümleri (içerik NOTLAR'da hazır).

## [2026-09-16 01:20] Ajan #1 — Doğruluk grafiği v0 (Aşama 1 ilk tuğla)
**Görev:** Çekirdek motor tipleri ve "önce gerçek" üreticisi; ilk örüntü denetimi.

**Yapılanlar:**
- `tests/motor/gerceklik.test.ts` önce yazıldı (18 test; tekrar üretilebilirlik, yapısal tutarlılık, 600 seed örüntü denetimi), kırmızı görüldü.
- `src/motor/tipler.ts` (Mekan, Kisi, Kisilik, Iliski, Borc, OlayCekirdegi, Konum, Vaka), `src/motor/havuzlar.ts` (isim havuzları TR/yurtdışı, 8 mekân şablonu, eylemler, ilişki/olay/motivasyon şablonları), `src/motor/gerceklik.ts` (`vakaUret`, `DILIM_SAYISI`).
- Tasarım tercihleri: fail kurban dışı adaylardan düzgün dağılımla; kişilik failden bağımsız; olay türü ağırlıkları cinayet 55 / hırsızlık 20 / sabotaj 15 / kaza 10 (kaza = suçsuz vaka); tek "eş" kuralı; herkesin kurbanla bir ilişkisi var; her katman ayrı alt akış.

**Değişen dosyalar:** src/motor/{tipler,havuzlar,gerceklik}.ts, tests/motor/gerceklik.test.ts, docs/{DURUM,YOL_HARITASI,AJAN_GUNLUGU}.md.

**Testler:** 50 geçti / 0 kaldı (komut: `npm test`). `npm run typecheck` temiz.

**Alınan kararlar:** Yeni numaralı karar yok; tasarım tercihleri modül başı yorumlarında.

**Sorunlar / riskler:**
- Örüntü denetimi şimdilik kaba (kova payı 0.15–0.35, kaygı farkı < .05). Tam denetçi (korelasyon matrisi, çok özellik) Aşama 1 sonunda yazılacak.
- Zaman çizelgesinde failin olay sonrası davranışı (uzaklaşma, iz silme) henüz modellenmedi; delil katmanıyla gelecek.

**Yarım kalanlar:** Yok; katman kapalı.

**Sıradaki ajan için:**
1) Bilgi dağılımı + algı modeli (`src/motor/bilgi.ts`): zaman çizelgesinden "kim neyi gördü/duydu" türet; dikkat boşluğu (Simons & Chabris) olasılığı; medya sızıntısı bayrağı (CIT geçerliliği için).
2) Sırlar (`src/motor/sirlar.ts`): suçla ilgisiz sırlar + koruma ilişkileri (borç grafiğinden).
3) Sonra strateji + yalan defteri.

**Geliştirme fikirleri:**
- Mekân şablonuna "mekâna özgü delil türleri" eklemek (hastane: ilaç kayıt defteri; motel: resepsiyon defteri).
- Vaka arketip havuzunu (TASARIM §15) olay şablonlarına bağlamak; şimdilik dört genel tür var.
