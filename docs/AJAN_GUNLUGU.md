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
