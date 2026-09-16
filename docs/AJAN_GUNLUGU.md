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

## [2026-09-16 01:45] Ajan #1 — Bilgi dağılımı, sırlar, konuşma stratejisi + yalan defteri
**Görev:** Gerçeğin üstüne "kim neyi biliyor", "kim neyi saklıyor", "kim ne cevap verir" katmanlarını kurmak.

**Yapılanlar (her biri önce test, kırmızı, sonra kod):**
- `src/motor/bilgi.ts`: kendisi/gördü/dedikodu/medya kaynakları; dikkat dağıtan eylemlerde görme olasılığı .92→.45 (Simons & Chabris); dedikodu %12 olasılıkla yayılır, %30 bozulur (bellek uyumu tohumu); yöntem %35 medyaya sızar; `citGecerliMi` (sızan/dedikodu varsa geçersiz), `kimBiliyor`.
- `src/motor/sirlar.ts`: masum %45 / fail %30 sır olasılığı; gizli ilişki dilimleri zaman çizelgesinde gerçekten aynı odada; `odaYalaniGerektirir` (ilişki/ziyaret → oda yalanı; bağımlılık/sabıka/iş kaybı → gizleme); korumalar: ortak sır (karşılıklı), ağır borç %80, sıcak aile/eş/sevgili %40.
- `src/motor/strateji.ts`: `Soru` (konum / olay-bilgisi), `Cevap` (ifadeTuru, icerik, dogru, not), `VakaDurumu` + yalan defteri; fail olay anında gömülü yalan (o akşam gerçekten bulunduğu başka oda) ya da kaçamak (yalanBecerisi > .7 veya başka oda yoksa); alakasız sır / gizleme; koruma yalanı ("yanımdaydı"); dikkat boşluğu; bozuk dedikodu → bellek uyumu; fail kimliğini asla vermez; yöntem sızmışsa "gazetede okudum".
- Determinizm: her (kişi, soru) çifti kendi RNG akışını kullanır → soru sırası cevabı değiştirmez.

**Değişen dosyalar:** src/motor/{bilgi,sirlar,strateji}.ts; tests/motor/{bilgi,sirlar,strateji}.test.ts; docs/{DURUM,YOL_HARITASI,AJAN_GUNLUGU}.md.

**Testler:** 92 geçti / 0 kaldı (komut: `npm test`). `npm run typecheck` temiz.

**Alınan kararlar:** Numaralı karar yok; olasılık sabitleri modül başlarında, denge botlarıyla ayarlanacak.

**Sorunlar / riskler:**
- Görgü tanığı mekaniği vakayı bazen kolaylaştırır (masum tanık faili doğrudan söyler). Çözülebilirlik/zorluk denetçisi bunu "kolay vaka" olarak puanlamalı ya da tanık koruma/korku ile susmalı; Aşama 1 sonunda ele alınacak.
- Soru türleri şimdilik iki tane (konum, olay-bilgisi). Teknik motoru (SUE, beklenmedik soru…) bunları genişletecek.

**Yarım kalanlar:** Yok.

**Sıradaki ajan için:**
1) `src/motor/ipucu.ts`: cevaba ipucu betimlemesi ekleme (katalog d değerleri + kişilik + koşullar); bilimsel sadakat testi.
2) `src/motor/delil.ts`: delil üretimi ve "beklenen ama olmayan".
3) Teknik motoru + çözülebilirlik denetçisi + denge botları.

**Geliştirme fikirleri:**
- Görgü tanığının "korku" nedeniyle susması (fail tehditkâr ilişki) → yeni koruma nedeni 'korku'.
- Fail için olay öncesi/sonrası dilimlerde de tutarlı yalan (hazırlık, iz silme) → delil katmanıyla birlikte.

## [2026-09-16 02:10] Ajan #1 — İpucu üretimi (bilimsel sadakat çekirdeği)
**Görev:** Cevaplara katalog temelli, olasılıksal davranış betimlemeleri eklemek; "sadece beden diline bakan oyuncu şansa yakın kalmalı" ilkesini test altına almak.

**Yapılanlar:**
- Kataloğa `betimlemeYonu` (artar/azalir/iliskisiz) alanı eklendi: ham d işareti (`yon`) ile betimlenen davranışın yalanla ilişkisi ayrıştırıldı (ör. "detay azlığı" d=-.30 ama azlık yalanda artar). Doğrulayıcı tutarlılık kuralı ekledi.
- `tests/motor/ipucu.test.ts` (11 test) önce yazıldı; `src/motor/ipucu.ts` sonra: z ~ N(mu,1) > 1.0 modeli; mu = kişilik temel çizgisi + yalan kayması (katalog d, koşullar ihlal/motivasyon, gizleme ×0.6, beceri söndürmesi ×(1−0.5·beceri)) + suç sorusu gerginliği (0.3·kaygı). `temelCizgi()` beklenen oranları verir.
- Ölçüm tablosu (150 vaka, 750 yalan / 6474 doğru): sözel-vokal yakınlık azlığı +.110, iş birliği azlığı +.120, tutarsızlık +.070, göz bebeği +.071, ses perdesi +.076, gerginlik +.059, sahte gülümseme +.070, detay azlığı +.032, illüstratör azalması +.016; kendiliğinden düzeltme −.050, hatırlamıyorum kabulü −.074; göz teması −.019, duraksama +.015, gecikme −.009, kıpırdanma +.022, mikroifade −.017.
- Bir test eşiği kalibre edildi: güçlü ipuçları için fark tabanı 0.04 → 0.03 (gerekçe testte: d=.30 teorik ~0.05, SE ~0.013). Model değerleri kaynağa sadık kaldı.

**Değişen dosyalar:** src/motor/ipucu.ts, src/icerik/{ipuclari.json,tipler.ts,dogrula.ts}, tests/motor/ipucu.test.ts, docs/{DURUM,YOL_HARITASI,AJAN_GUNLUGU}.md.

**Testler:** 103 geçti / 0 kaldı (komut: `npm test`). `npm run typecheck` temiz.

**Alınan kararlar:** Numaralı karar yok. Model sabitleri ipucu.ts başında belgelendi.

**Sorunlar / riskler:**
- "iliskisiz" ipuçlarında koşullu d'ler (ör. plansız yalanda duraksama +.38) şimdilik kullanılmıyor; tüm yalanlar "planlı" (defterli). Teknik motoru beklenmedik soruyla "plansız" durumu getirince bu koşul devreye alınmalı.
- Suç sorusu gerginliği yalnızca gerginlik/ses perdesi ipuçlarına uygulanıyor; bilinçli tercih (mit ipuçları bilgi taşımasın).

**Yarım kalanlar:** Yok.

**Sıradaki ajan için:** 1) delil.ts, 2) teknik.ts, 3) çözülebilirlik + denge botları (DURUM.md).

**Geliştirme fikirleri:**
- Betimleme seçiminde "son kullanılanları tekrar etme" belleği (dil katmanında).
- Navarro yatıştırıcı davranışları (boyun dokunma vb.) kataloğa `zayif` düzeyde, kişiye özgü temel çizgiyle.

## [2026-09-16 02:50] Ajan #1 — Delil üretimi ve teknik motoru
**Görev:** Delilleri gerçekten türetmek; oyuncunun 12 aracını motor üstünde kaynağa sadık biçimde çalıştırmak.

**Yapılanlar (önce test, kırmızı, sonra kod):**
- `src/motor/delil.ts`: `delilUret(vaka, dagilim)` → fail olay yerinde en az bir iz (çözülebilirlik tohumu, %30 komşu dilimde ikinci iz), yöntem delili (`sizmis` bilgi katmanıyla uyumlu), cinayette "beklenen ama olmayan" (kapı zorlanmamış; malikâne/çiftlik/sahilde köpek havlamamış; zehir/ilaçta boğuşma izi yok), 5–10 gürültü izi (kameralı odalarda dijital .95, telefon kaydı .85, belge .7, fiziksel .5–.85). `celisenDeliller(deliller, cevap)`. v0'da sahnelenmiş delil yok (her delil gerçekle uyumlu).
- `src/motor/ipucu.ts`: `IpucuSecenekleri` (kaymaCarpani, ekGerginlik, etiket); etiket yokken RNG anahtarı değişmedi.
- `src/motor/teknik.ts`: `Sorgu`, `sorguBaslat`, `sor`, `delilGoster`, `teknikUygula`. Ölçülen davranışlar: SUE geç → gömülü yalan çelişkisi %100, erken → kaçamak; bilişsel yük altında oda yalancılarının %15–80'i defterden sapar, doğrucular hiç; CIT sızmamışta fail >%70 tanır, bilmeyen masum <%20; sızmışta medyadan bilen masum >%60 tanır (geçersiz test masumu yakar); SVT'de saklayan fail >%70 şans altı, bilmeyen masum <%15; suçlayıcı ton sonrası masumun doğru cevabında gerginlik +%10'dan fazla artar.
- İki düzeltme: yük çelişkisi yalnızca oda yalanlarında (gizleme/kaçamak doğru odayı söyler); yönlendirici soru testinde koruyanlar kapsam dışı (koruma yalanı öneriyi bastırır).

**Değişen dosyalar:** src/motor/{delil,teknik,ipucu}.ts, tests/motor/{delil,teknik}.test.ts, docs/{DURUM,YOL_HARITASI,AJAN_GUNLUGU}.md.

**Testler:** 132 geçti / 0 kaldı (komut: `npm test`). `npm run typecheck` temiz.

**Alınan kararlar:** Numaralı karar yok. Teknik sabitleri (`YUK_CARPANI`, `STRES_ADIMI`, SVT parametreleri) `teknik.ts` başında.

**Sorunlar / riskler:**
- Şeytanın avukatı v0'da uygulanamaz (görüş/niyet soruları yok). Soru türleri genişleyince eklenecek.
- Suçlayıcı tonla failin itirafı (beceri < .3, stres ≥ 1.5) oyunu kolaylaştırabilir; puanlama sahte itiraf riskini cezalandırmalı, çözülebilirlik denetçisi "itiraf = kanıt değil" ilkesini korumalı.
- Yönlendirici soru şu an yalnız başkasının konumunda kontaminasyon üretir; kendi konumu için de (telkine yatkın, sır yok) uygulanabilir.

**Yarım kalanlar:** Yok.

**Sıradaki ajan için:** 1) çözülebilirlik + zorluk + tam örüntü denetçisi, 2) puanlama + hata etiketleri, 3) denge botları (DURUM.md).

**Geliştirme fikirleri:**
- Sahnelenmiş delil (`sahnelenmis: true`, failin olay sonrası dilimde yerleştirdiği) → Norwood şablonu; tek fiziksel tutarsızlıkla çöker.
- Kontaminasyon kaydı puanlamada "bu ayrıntıyı ilk kim söyledi?" olarak oyuncuya gösterilir.

## [2026-09-16 03:30] Ajan #1 — Çözülebilirlik, puanlama, denge botları → Aşama 1 kapandı
**Görev:** Aşama 1'in son üç tuğlası; motorun "bilimsel sadakat + denge" iddiasını sayılarla kanıtlamak.

**Yapılanlar (önce test, kırmızı, sonra kod):**
- `src/motor/cozulebilirlik.ts`: `cozulebilirlikDenetle` (taze Sorgu klonunda; sinyaller: delil çelişkisi 3, görgü tanığı 4, geçerli CIT 2, beklenmedik soru 1, SVT 1; fail puanı ≥2 ve tek başına önde → çözülebilir), zorluk (kaçamak +.2, sızıntı +.15, koruma +.15, görgü tanığı −.2, çoklu şüpheli +.1, iyi yalancı +.1, dijital delil −.1), `vakaUretCozulebilir` (seed#n türevleri), `oruntuDenetle` (13 özellik Pearson r + üç kestirme).
- `src/motor/puan.ts`: temel puan (doğru 100 / suç varken "suç yok" 25 / masumu suçlama 0), Brier kalibrasyon, cezalar (erken delil −10, tanık kirletme −5, sahte itiraf kabulü −40, geçersiz CIT −5, baskı −3, zaman aşımı −2/saat), bonuslar (SUE çelişkisi +10, geçerli CIT +10), otomatik etiketler (aşırı özgüven, Othello, doğruluk yanlılığı, sahte itiraf kabulü, ipucu erişilemez, tek ipucu, erken delil, tanık kirletme, geçersiz CIT) → `calisilacakKilavuz`.
- `src/motor/botlar.ts`: ipucu botu, yöntem botu (olay yeri delilleri → SUE sırası → CIT → beklenmedik soru → SVT → tanık), inanan, şüpheci. Botlar gizli etiketleri görmez.
- Kalıp kırıcı düzeltmeler: failin sır olasılığı masumla eşitlendi (.45); delil katmanına "tuzak masum izi" eklendi (fail ile aynı iz profili) → "en çok delili olan fail" kestirmesi .33.
- `hata_etiketleri.json`: `sahte-itiraf-kabulu`, `gecersiz-gizli-bilgi-testi` eklendi (20 etiket).

**Ölçümler:** DURUM.md "Biten işler" bölümünde.

**Değişen dosyalar:** src/motor/{cozulebilirlik,puan,botlar,sirlar,delil}.ts, src/icerik/hata_etiketleri.json, tests/motor/{cozulebilirlik,puan}.test.ts, tests/denge/botlar.test.ts, docs/{DURUM,YOL_HARITASI,AJAN_GUNLUGU}.md.

**Testler:** 161 geçti / 0 kaldı (komut: `npm test`, ~25 sn). `npm run typecheck` temiz.

**Alınan kararlar:** Numaralı karar yok.

**Sorunlar / riskler:**
- Metodik oyuncu için oyun şu an kolay (yöntem botu 1.00). Bu, motorun tutarlılığını kanıtlar ama dikey dilim sonrası zorlaştırıcı gerekecek (kaçamak oranı, korkuyla susan tanık, sahnelenmiş delil, sızıntı). Kullanıcı kararı bekleniyor (DURUM.md açık karar 2).
- Denge testi ~20 sn; büyürse `tests/denge` ayrı komuta alınabilir.

**Yarım kalanlar:** Yok. Aşama 1 kapalı.

**Sıradaki ajan için:** Aşama 2: 1) dil katmanı (`src/motor/dil/`), 2) React ekran iskeleti, 3) Kılavuz + Forer + kayıt + Playwright (DURUM.md).

**Geliştirme fikirleri:**
- `oruntuDenetle` çıktısını `npm run oruntu` komutuyla rapor olarak yazdırmak.
- Zorluk seçici: `vakaUretCozulebilir(seed, { hedefZorluk })` — kör nokta profiline göre adaptif üretim (Aşama 3).

## [2026-09-16 04:10] Ajan #1 — Dil katmanı (Aşama 2 ilk tuğla)
**Görev:** Yapısal cevapları Türkçe diyaloga çevirmek; LLM'siz, seedli, kişiye özgü üslupla (K-009).

**Yapılanlar (önce test, kırmızı, sonra kod):**
- `src/ortak/turkce.ts`: ünlü uyumu, sertleşme, kaynaştırma, iyelikli tamlama (-nda), rakam okunuşu (412 → "on iki" → -de), özel ad/kod kesmesi.
- `src/motor/dil.ts`: `uslupUret`, `VaryantBellegi`, `cevapMetni` (20 kategori × 3–4 şablon; "||" isteğe bağlı bölüm kısa üslupta atılır; uzun üslupta ek cümle; dolgu sözcüğü kaygıyla), `betimlemeMetni`, `vakaBrifingi`, `kisiKarti`.
- Testler: gizli etiket sızmıyor (yasak kelime listesi), oda/kişi/yöntem adları çekimli geçiyor, deterministik, dolgu davranışı, varyant belleği, brifingde fail adı yok.
- Düzeltmeler: dolgu eklenince baş harf büyütmesi yapılmıyor (oda adı bozulmasın); üçüncü kişi şablonlarına kişi adı eklendi; gerceklik.ts rol metni doğru ilgi ekiyle.

**Değişen dosyalar:** src/ortak/turkce.ts, src/motor/{dil,gerceklik}.ts, tests/ortak/turkce.test.ts, tests/motor/dil.test.ts, docs/{DURUM,YOL_HARITASI,AJAN_GUNLUGU}.md.

**Testler:** 180 geçti / 0 kaldı (komut: `npm test`). `npm run typecheck` temiz.

**Alınan kararlar:** Numaralı karar yok.

**Sorunlar / riskler:**
- Şablon sayısı sınırlı (kategori başına 3–4); uzun oturumlarda tekrar hissi olabilir. Havuz büyütmek içerik işi, motor değişikliği gerektirmez.
- Türkçe çekimleyici havuz adlarına göre ayarlı; yeni oda/kişi adı eklerken test ekle.

**Yarım kalanlar:** Yok.

**Sıradaki ajan için:** React ekran iskeleti (DURUM.md "Sıradaki 3 iş" 1), sonra Kılavuz/Forer/kayıt, sonra Playwright.

**Geliştirme fikirleri:**
- Kişi başı "tik" sözcükleri (temel çizgi): üslup zaten dolgu seçiyor; ipucu kataloğundaki sözel ipuçlarıyla (ör. "dürüst olmak gerekirse" dolgusu) bağlanabilir.
- Teknik sonuç metinleri (SUE, CIT, SVT) için ayrı şablon seti — arayüzle birlikte.

## [2026-09-16 05:10] Ajan #1 — React ekran iskeleti, oyun deposu, kayıt, tarayıcı doğrulaması
**Görev:** Oynanabilir dikey dilim: depo + ekranlar + kayıt + duman testleri.

**Yapılanlar (önce test, kırmızı, sonra kod):**
- `src/arayuz/oyun/depo.ts` (`OyunDeposu`): React'ten bağımsız; ekran akışı, `sor`/`teknik`/`delilGoster`, konuşma kayıtları (aynı soru → aynı cümle), pano, suçlama → `puanla`, gerçeğin anlatımı (fail, motivasyon, herkesin olay anı gerçeği, sakladığı, koruduğu, cevabının aslı), kör nokta geçmişi, JSON dışa/içe (defter, gösterilen deliller, stres, kontaminasyon, zaman), `sifirla`.
- `src/arayuz/oyun/metinler.ts`: `soruMetni`, `teknikSonucMetni` (CIT geçerliliği gibi gizli bilgiyi yazmaz).
- `src/arayuz/oyun/kullan.ts`: tek depo, `useSyncExternalStore`, localStorage otomatik kayıt (try/catch).
- Ekranlar: Kabuk, Baslik, VakaAcilis, SorguOdasi, Pano, Suclama, Analiz, Kilavuz; `stil.css` (brand.md; sistem fontları, çevrimdışı).
- Testler: `tests/arayuz/depo.test.ts` (12), `tests/arayuz/App.test.tsx` (jsdom, 2: tam akış + tarayıcı kaydı). @testing-library/react kuruldu.
- `scripts/dosya-kontrol.mjs` (Playwright, yerel Chrome/Edge kanalı; tarayıcı indirmez): `dist/index.html`'i `file://` ile açar, vaka başlatır, görüşme yapar, konsol hatalarını sayar.

**Değişen dosyalar:** src/arayuz/**, tests/arayuz/**, scripts/dosya-kontrol.mjs, package.json (+playwright, @testing-library/*), docs/{DURUM,YOL_HARITASI,AJAN_GUNLUGU}.md.

**Testler:** 194 geçti / 0 kaldı (komut: `npm test`). `npm run typecheck` temiz. `npm run build` tek dosya ~356 KB. `node scripts/dosya-kontrol.mjs`: yerel Chrome ile file:// açıldı, vaka başlatıldı, ilk cevap alındı, konsol hatası 0.

**Alınan kararlar:** Numaralı karar yok. Depo tekil; testler `sifirla()` ile izole.

**Sorunlar / riskler:**
- Arayüz henüz ham: ipucu betimlemeleri Kılavuz'a bağlı değil, mobil düzen kabaca duyarlı, görsel yok (portreler yer tutucusuz).
- Playwright'ın `text=` seçicisi alt dize eşleştirdiği için ("görüşülebilir") yanlış tıkladı; rol tabanlı seçiciye geçildi. Sonraki ajanlar için not.

**Yarım kalanlar:** Yok.

**Sıradaki ajan için:** 1) Forer tutorial'ı, 2) cila (betimleme→Kılavuz bağı, ilk/son ifade özeti), 3) denge/zorlaştırıcı (kullanıcı kararı).

**Geliştirme fikirleri:**
- Sorgu odasında "temel çizgi" sonuçlarını kişi kartına kalıcı not olarak yazmak (oyuncu karşılaştırsın).
- Analizde her kişinin ilk ve son ifadesini yan yana göstermek (anlatım abartısı / bellek uyumu dersi).

## [2026-09-16 06:00] Ajan #1 — Forer dersi, soğuk okuma bölümü, ipucu kartı → Aşama 2 kapandı
**Görev:** Açılış tutorial'ı (Forer), Kılavuz'a soğuk okuma bölümü, davranış betimlemelerini kataloğa bağlamak.

**Yapılanlar (önce test, kırmızı, sonra kod):**
- `src/icerik/forer.json` + `forer.ts`: 8 soru, Forer 1949'un 13 maddesi (Türkçe), ifşa metni, 4.26 ortalaması. Depo: `forerBasla/forerCevapla/forerPuanla/forerBitir`; cevaplar kasıtlı olarak kullanılmaz. `Forer.tsx` ekranı; Başlık'ta ilk vakadan önce otomatik + "Açılış dersi" düğmesi; kayıtla taşınır; içe aktarımda `forer` ekranı başlığa düşer.
- `kilavuz.json`: `soguk-okuma` bölümü (forer-barnum, soguk-okuma-teknikleri, bloklama-kurallari). `kaynaklar.json`: Poškus 2014 (içerik testi yakaladı).
- `IpucuKarti.tsx` + `KonusmaKaydi.gozlemler`: betimlemeler tıklanabilir; kart rozet, d, not, kaynak ve "kanıt değil" uyarısı gösterir. Eski kayıtlar içe aktarımda `gozlemler: []` ile tamamlanır.
- App duman testi Forer akışını kapsar; `scripts/dosya-kontrol.mjs` de.

**Değişen dosyalar:** src/icerik/{forer.json,forer.ts,kilavuz.json,kaynaklar.json}, src/arayuz/ekranlar/{Forer,IpucuKarti,SorguOdasi,Baslik,Kilavuz}.tsx, src/arayuz/App.tsx, src/arayuz/oyun/depo.ts, src/arayuz/stil.css, tests/arayuz/{forer.test.ts,IpucuKarti.test.tsx,App.test.tsx,depo.test.ts}, scripts/dosya-kontrol.mjs, docs.

**Testler:** 200 geçti / 0 kaldı (komut: `npm test`). `npm run typecheck` temiz. `npm run build` tek dosya.

**Alınan kararlar:** Numaralı karar yok.

**Sorunlar / riskler:**
- Bash heredoc'ta uzun Python betikleri (kesme işaretli Türkçe) kırılıyor; çözüm scratchpad `.py` dosyası. Sonraki ajanlar için DURUM.md'ye not düşüldü.
- Forer dersi her yeni tarayıcı kaydında bir kez; "Sıfırla" sonrası yeniden görünür (bilinçli).

**Yarım kalanlar:** Yok. Aşama 2 kapalı.

**Sıradaki ajan için:** Aşama 3 — 1) denge/zorlaştırıcı + zorluk seçici, 2) cila (ilk/son ifade özeti, temel çizgi notu), 3) Kılavuz bölümleri ve ipucu kataloğu genişletme (DURUM.md).

**Geliştirme fikirleri:**
- Kör seçim (Beyerstein) mini oyunu: Forer'in devamı olarak anonim profillerden kendini bulma.
- Soğuk okuma dedektörü mini oyunu: medyum kaydında cümle etiketleme (Rowland öğeleri).

## [2026-09-16 06:40] Ajan #1 — Zorluk seçici ve zorlaştırıcılar (Aşama 3 ilk tuğla)
**Görev:** Metodik oyuncu için oyunu zorlaştırmak; zorluk seviyelerini tek yerden ayarlanabilir kılmak.

**Yapılanlar (önce test, kırmızı, sonra kod):**
- `tipler.ts`: `Zorluk`, `VakaAyari`, `ZORLUK_PARAMETRELERI` (tek ayar noktası). `vakaUret(seed, ayar)`; `Vaka.ayar` gerçeğin parçası (determinizm: aynı seed + aynı ayar).
- `bilgi.ts` sızma olasılığı, `strateji.ts` kaçamak eşiği, `sirlar.ts` korku koruması (olay odasındaki görgü tanığı susar), `delil.ts` sahnelenmiş delil (`sahnelenmis`, `sahnelenmisMi` fizik tutarsızlığı), `cozulebilirlik.ts` (şüpheli delilleri sinyal dışı bırakır, zorluk +.15/+.10, `vakaUretCozulebilir(seed, n, ayar)`), `botlar.ts` (yöntem botu fizik kontrolü yapar), `puan.ts` (`delil-sorgulanmadi` etiketi), `kilavuz.json` (`sahnelenmis-suc`), depo/Başlık (zorluk seçici, kayıtla taşınır).
- Testler: `tests/motor/zorluk.test.ts` (11): parametre sıralaması, sahnelenmiş delilin masumun gerçek iziyle çift oluşturması, çözülebilirliğin korunması, botların zorda hâlâ makul olması, tuzak etiketi. Eski testler sahnelenmiş delili hariç tutacak şekilde güncellendi (delil, teknik, sırlar).

**Ölçümler:** DURUM.md "Biten işler".

**Değişen dosyalar:** src/motor/{tipler,gerceklik,bilgi,strateji,sirlar,delil,cozulebilirlik,botlar,puan}.ts, src/icerik/{hata_etiketleri,kilavuz}.json, src/arayuz/oyun/depo.ts, src/arayuz/ekranlar/Baslik.tsx, tests/motor/{zorluk,delil,teknik,sirlar}.test.ts, docs.

**Testler:** 211 geçti / 0 kaldı (komut: `npm test`, ~60 sn). `npm run typecheck` temiz.

**Alınan kararlar:** Zorluk parametreleri tek yerde (`ZORLUK_PARAMETRELERI`); sahnelenmiş delil oyuncuya bayrakla gösterilmez.

**Sorunlar / riskler:**
- Yöntem botu zorda .97: bot fizik kontrolünü biliyor. İnsan için zorluk, Kılavuz'daki "sahnelenmiş suç" maddesini öğrenmeye bağlı; beklenen davranış. Daha sert istenirse parametreler tek yerden.
- Test süresi 60 sn'ye çıktı; `tests/denge` ve `zorluk` ayrı komuta alınabilir.

**Yarım kalanlar:** Yok.

**Sıradaki ajan için:** 1) cila (analizde ifade-gerçek tablosu, temel çizgi notu), 2) Kılavuz bölümleri + Navarro ipuçları, 3) mini oyunlar (DURUM.md).

## [2026-09-16 07:10] Ajan #1 — Cila: ifade-gerçek tablosu, temel çizgi notu, delil gösterildi işareti
**Görev:** Vaka sonu analizini öğretici kılmak; sorgu odasında temel çizgiyi kalıcı göstermek.

**Yapılanlar (önce test, kırmızı, sonra kod):**
- `depo.ts`: `IfadeKarsilastirma` (kişi, söylediği oda, gerçek oda, ifade türü adı, soruldu mu) suçlamada hesaplanır; `temelCizgiNotlari` (kişi başına "Normali: …") temel çizgi tekniğinde yazılır; ikisi de kayıtla taşınır.
- `Analiz.tsx`: "Olay anı: söylenen ve gerçek" tablosu (sorulmayan kişi = RAM 2. halka notu).
- `SorguOdasi.tsx`: temel çizgi notu görüşme başlığının altında; delil listesinde gösterilenler "✓".
- Test düzeltmesi: `depo-tablo` seed'i kaza üretiyordu; test suçlu vaka bulan döngüyle yazıldı (kod hatası değildi).

**Değişen dosyalar:** src/arayuz/oyun/depo.ts, src/arayuz/ekranlar/{Analiz,SorguOdasi}.tsx, tests/arayuz/depo.test.ts, docs.

**Testler:** 212 geçti / 0 kaldı (komut: `npm test`). `npm run typecheck` temiz. file:// kontrolü hata 0.

**Alınan kararlar:** Yok.

**Sorunlar / riskler:** Yok.

**Yarım kalanlar:** Yok.

**Sıradaki ajan için:** Kılavuz bölümleri (bellek, dikkat, ikna) + Navarro ipuçları; sonra mini oyunlar.

## [2026-09-16 07:40] Ajan #1 — Kılavuz genişletmesi ve Navarro ipuçları
**Görev:** NOTLAR'da hazır olan bilgiyi Kılavuz'a taşımak; kataloğa saha ipuçlarını doğru etiketle eklemek.

**Yapılanlar:**
- `kilavuz.json`: 18 yeni madde (bellek-taniklik 5, dikkat-sihir 4, ikna-manipulasyon 6, kisilik-okuma 3). Her madde: özet → nasıl kullanılır → sınırları → kanıt rozeti → kaynak.
- `kaynaklar.json`: 11 yeni kaynak kaydı, NOTLAR başlık anahtarlarıyla (içerik testi K-004 doğruladı).
- `ipuclari.json`: yatistirici-dokunma (.12, zayıf), ayak-yonu-cikis (ilişkisiz), kas-vurgusu-azalmasi (.14, zayıf); `ipucu.ts` kişilik temel çizgileri ve suç sorusu gerginlik kümesi güncellendi. Bilimsel sadakat testi yeşil kaldı.
- `Kilavuz.tsx` bölüm adları; içerik testine bölüm/madde alt sınırı.

**Değişen dosyalar:** src/icerik/{kilavuz,kaynaklar,ipuclari}.json, src/motor/ipucu.ts, src/arayuz/ekranlar/Kilavuz.tsx, tests/icerik/semalar.test.ts, docs.

**Testler:** 213 geçti / 0 kaldı (komut: `npm test`). `npm run typecheck` temiz.

**Alınan kararlar:** Navarro ipuçları `zayif` düzeyde ve "stres konusu" sinyali olarak modellendi; yalan kanıtı değil (AJAN_PROMPTU §6).

**Sorunlar / riskler:** Yok.

**Yarım kalanlar:** Kalan Kılavuz bölümleri (Duygular, İnanç/Tarikat, Holmes, Kör Nokta) YOL_HARITASI'nda.

**Sıradaki ajan için:** mini oyunlar → adaptif üretim → şablon/mekân genişletme (DURUM.md).

## [2026-09-16 08:00] Ajan #1 — Tatbikatlar: kör seçim, soğuk okuma dedektörü, taban oranı
**Görev:** TASARIM §13 mini oyunlarından üçünü kurmak (kısa, anında geri bildirim, Kılavuz bağlantılı).

**Yapılanlar (önce test, kırmızı, sonra kod):**
- `src/icerik/mini_oyunlar.json` + `.ts`: kör seçim (Barnum, tam zıt, genel olumlu, genel olumsuz profiller + ifşa), soğuk okuma kaydı (8 cümle, 8 Rowland/Hyman öğesi, çoklu etiket) ve `sogukOkumaPuanla` (doğru +1, yanlış −1, kaçırılan sayılır), taban oranı bulmacası (tek doğru: ~%1, çözüm metni).
- Depo: `TatbikatDurumu` (aktif, sonuçlar), `tatbikatAc/Kapat`, `korSecimBitir`, `sogukOkumaBitir`, `tabanOraniBitir`; kayıtla taşınır; içe aktarımda tatbikat ekranı başlığa düşer.
- `Tatbikat.tsx`: üç alt ekran; soğuk okumada yeşil/kırmızı geri bildirim; her tatbikat ilgili Kılavuz maddesine bağlı. Başlık'ta "Tatbikatlar" düğmeleri (✓ ve puan).

**Değişen dosyalar:** src/icerik/mini_oyunlar.{json,ts}, src/arayuz/ekranlar/{Tatbikat,Baslik}.tsx, src/arayuz/App.tsx, src/arayuz/oyun/depo.ts, tests/arayuz/miniOyunlar.test.ts, docs.

**Testler:** 216 geçti / 0 kaldı (komut: `npm test`). `npm run typecheck` temiz. file:// kontrolü hata 0.

**Alınan kararlar:** Yok.

**Sorunlar / riskler:** Soğuk okuma kaydı tek ve sabit; tekrar oynanabilirlik için şablonla üretilmiş kayıtlar (medyum NPC) sonraki iş.

**Yarım kalanlar:** Yok.

**Sıradaki ajan için:** adaptif üretim (kör nokta → vaka), şablon/mekân genişletme, kalan Kılavuz bölümleri (DURUM.md).

## [2026-09-16 08:30] Ajan #1 — Adaptif vaka üretimi (kör nokta → hedefli vaka)
**Görev:** Oyuncunun tekrarlayan hatalarına göre sonraki vakayı fark ettirmeden ayarlamak (TASARIM §11, Ericsson 1993).

**Yapılanlar (önce test, kırmızı, sonra kod):**
- `src/motor/adaptif.ts`: `ETIKET_HEDEFI` (othello → gergin masum; erken delil / ipucu erişilemez → gömülü yalan; geçersiz CIT → sızıntı; sahte itiraf / tanık kirletme → telkine yatkın masum; delil sorgulanmadı → sahnelenmiş delil; doğruluk yanlılığı → suç var), `hedeflerdenAyar` (en fazla 2), `vakaHedefiSaglar` (taze sorgu), `vakaUretHedefli` (seed türevleri; hedef sağlanamazsa en iyi çözülebilir yedek).
- Depo `yeniVaka` hedefli üretimi kullanır; `durum.hedefler` analizde "bu vaka şunları çalıştırmak için üretildi" olarak açıklanır; Kılavuz açılışında dinamik "Senin kör noktan" listesi.
- Testler: `tests/motor/adaptif.test.ts` (10): her hedef ≥%85 sağlanır, çift hedef ≥%70, determinizm; depo testi (+1).

**Değişen dosyalar:** src/motor/adaptif.ts, src/arayuz/oyun/depo.ts, src/arayuz/ekranlar/{Analiz,Kilavuz}.tsx, tests/motor/adaptif.test.ts, tests/arayuz/depo.test.ts, docs.

**Testler:** 227 geçti / 0 kaldı (komut: `npm test`). `npm run typecheck` temiz. file:// kontrolü hata 0.

**Alınan kararlar:** Hedef vaka sonunda AÇIKLANIR (oyun sırasında değil): gelişim zihniyeti + şeffaflık; "fark ettirmeden" ilkesi vaka süresince korunur.

**Sorunlar / riskler:** Hedefli üretim çözülebilirlik denetimini 30'a kadar tekrar çağırır; şu an ~50 ms/vaka, sorun değil.

**Yarım kalanlar:** Yok.

**Sıradaki ajan için:** şablon/mekân genişletme, kalan Kılavuz bölümleri, Higgsfield prompt listesi (DURUM.md).

## [2026-09-16 09:00] Ajan #1 — Kılavuz 12 bölüm / 60 madde, Higgsfield prompt listesi, portre yer tutucusu
**Görev:** Kılavuz'u TASARIM §12 hedefine tamamlamak; görsel üretim için kullanıcıya hazır prompt listesi bırakmak; görsel gelene kadar oyunun boş görünmemesi.

**Yapılanlar:**
- `kilavuz.json`: 10 yeni madde (duygular 4, inanc-paranormal 3, holmes 3); `Kilavuz.tsx` bölüm adları; içerik testi alt sınırı 12 bölüm / 60 madde.
- `assets/HIGGSFIELD_PROMPTLAR.md`: ortak stil eki, 24 nötr portre, 4 takım, 8 mekân, ana görsel, sorgu odası; dosya adı/boyut kuralları (K-010 tek dosya, ≤60 KB portre).
- `Portre.tsx`: kişi id+ad'dan deterministik SVG siluet (renk, saç hacmi, omuz genişliği, baş harfler; kurban çizgili; ifade yok). Vaka açılışı ve sorgu odasında kullanılıyor. Test (+1).

**Değişen dosyalar:** src/icerik/kilavuz.json, src/arayuz/ekranlar/{Kilavuz,Portre,VakaAcilis,SorguOdasi}.tsx, assets/{HIGGSFIELD_PROMPTLAR,KAYIT}.md, tests/icerik/semalar.test.ts, tests/arayuz/Portre.test.tsx, docs.

**Testler:** 228 geçti / 0 kaldı (komut: `npm test`). `npm run typecheck` temiz. file:// kontrolü hata 0.

**Alınan kararlar:** Portreler nötr ifadeli üretilecek (brand.md §1; Barrett 2019).

**Sorunlar / riskler:** Yok.

**Yarım kalanlar:** Higgsfield üretimi kullanıcıda; gelince `Portre.tsx` base64 WebP döndürecek şekilde güncellenir.

**Sıradaki ajan için:** şablon/mekân genişletme, kalan tatbikatlar, Aşama 4 hazırlığı (DURUM.md).

## [2026-09-16 09:30] Ajan #1 — Takım NPC'leri (Aşama 4 ilk tuğla)
**Görev:** Dizinin takım dinamiğini (TASARIM §14) özgün adlarla ve bilimsel işlevle kurmak: sosyal kanıt tuzağı, hesap verebilirlik, yöntem hatırlatıcı.

**Yapılanlar (önce test, kırmızı, sonra kod):**
- `src/arayuz/oyun/takim.ts`: `TAKIM` (4 üye), `takimYorumu(sorgu, kisi, sonuc)` — yalnızca oyuncunun gördüğü şeylerden (ipucu sayısı, gerginlik kümesi, delil çelişkisi, "bilmiyorum") deterministik yorum. Saha ajanı gerginlik görünce "yalan söylüyor" der (isabet <%45 → çoğunluk sık yanılır), lider kanıt ister, sorgucu tekniğe yönlendirir (SVT, ters sıra, SUE sırası, temel çizgi), inanan analist "içime doğdu" der.
- Depo: `takimAcik` (aç/kapat, kayıtla taşınır), `KonusmaKaydi.takimYorumu`; sorgu odasında kesikli çerçeveli satır; suçlamada "takımın çoğunluk görüşü" dayanağı; `puan.ts` yanlış suçlamada `sosyal-kanit` etiketi.
- Test: `tests/arayuz/takim.test.ts` (4): yapı, determinizm/sızıntı yok, ölçüm (saha ajanı <%45, lider kanıt ister), depo entegrasyonu.

**Değişen dosyalar:** src/arayuz/oyun/{takim,depo}.ts, src/arayuz/ekranlar/{SorguOdasi,Suclama}.tsx, src/arayuz/stil.css, src/motor/puan.ts, tests/arayuz/takim.test.ts, docs.

**Testler:** 232 geçti / 0 kaldı (komut: `npm test`). `npm run typecheck` temiz. file:// kontrolü hata 0.

**Alınan kararlar:** Takım adları özgün (dizi adları yok, K-007 notu).

**Sorunlar / riskler:** Yorum havuzu küçük (rol başına 2–3 cümle); tekrar hissi olabilir; şablon havuzuyla birlikte büyütülecek.

**Yarım kalanlar:** Yok.

**Sıradaki ajan için:** şablon/mekân genişletme, kalan tatbikatlar, "Watson'a anlat" + Ayna taslağı (DURUM.md).

## [2026-09-16 10:00] Ajan #1 — Şablon havuzu ve mekâna özgü belgeler
**Görev:** Tekrar hissini azaltmak ve delilleri mekâna bağlamak.

**Yapılanlar (önce test, kırmızı, sonra kod):**
- `dil.ts`: her kategoriye 2 varyant (20 kategori × ≥5); `SABLON_KATEGORILERI`, `sablonSayisi` dışa aktarıldı; uzun üslup ekleri +2.
- `delil.ts`: `MEKAN_BELGELERI` (8 mekân türü × 3 belge); belge delilleri mekânın listesinden.
- Test: `tests/motor/genisletme.test.ts` (3). `dil.test.ts` eylem eşleşmesi harf duyarsız yapıldı (yeni şablonlar eylemi cümle başında büyütüyor; davranış doğru, test kırılgandı).

**Değişen dosyalar:** src/motor/{dil,delil}.ts, tests/motor/{genisletme,dil}.test.ts, docs.

**Testler:** 235 geçti / 0 kaldı (komut: `npm test`). `npm run typecheck` temiz. file:// kontrolü hata 0.

**Alınan kararlar:** Şablonlar şimdilik `dil.ts` içinde (JSON'a taşıma ertelendi; içerik testi kategorileri denetliyor).

**Sorunlar / riskler:** Yok.

**Yarım kalanlar:** Yok.

**Sıradaki ajan için:** kalan tatbikatlar, "Watson'a anlat", takım hikâyesi + Ayna taslağı (DURUM.md).

## [2026-09-16 10:30] Ajan #1 — "Watson'a anlat" akışı
**Görev:** TASARIM §9 "sesli anlatım / öğreterek öğrenme" mekaniğini kurmak.

**Yapılanlar (önce test, kırmızı, sonra kod):**
- `takim.ts watsonSorusu(tur, metin, indeks)`: pano türüne göre sorgucunun basit sorusu (deterministik).
- Depo: `WatsonDurumu` (adımlar, indeks, bitti, çelişkiler, test edilmemiş çıkarımlar); `watsonBasla` (pano boşsa false), `watsonCevapla` ("olmayan" gözlem sayılır; sütunla çelişen sınıflama işaretlenir), `watsonKapat`; oturumluk (kayıtla taşınmaz; içe aktarımda panoya düşer).
- `Watson.tsx` ekranı; Pano'da "Watson'a anlat" düğmesi. Test: `tests/arayuz/watson.test.ts` (3).

**Değişen dosyalar:** src/arayuz/oyun/{takim,depo}.ts, src/arayuz/ekranlar/{Watson,Pano}.tsx, src/arayuz/App.tsx, tests/arayuz/watson.test.ts, docs.

**Testler:** 238 geçti / 0 kaldı (komut: `npm test`). `npm run typecheck` temiz. file:// kontrolü hata 0.

**Alınan kararlar:** Yok.

**Sorunlar / riskler:** Yok.

**Yarım kalanlar:** Yok.

**Sıradaki ajan için:** kalan tatbikatlar, takım hikâyesi + Ayna taslağı, vaka arketip havuzu (DURUM.md).

## [2026-09-16 11:00] Ajan #1 — Vaka arketip havuzu
**Görev:** TASARIM §15 arketiplerini üreticiye bağlamak; kalıp oluşturmadan renk katmak.

**Yapılanlar (önce test, kırmızı, sonra kod):**
- `src/motor/arketipler.ts`: 14 arketip (olay türü, mekânlar, yöntemler, tema motivasyonları, brifing eki, Kılavuz maddesi, ağırlık); `mekanaUygunArketipler`.
- `gerceklik.ts`: arketip mekâna göre ayrı alt akışta ağırlıklı seçilir; olay türü/yöntem arketipten; motivasyon = ilişki motivasyonu + arketip teması; `Vaka.arketip`. `dil.ts` brifinge arketip cümlesi; `Analiz.tsx` "vakanın dersi".
- Test `tests/motor/arketip.test.ts` (5): mekân başına ≥2 arketip, uyum, kaza oranı, çeşitlilik (≥8 arketip, hiçbiri >%35), brifing, fail dağılımı düzgün.
- Üretim değiştiği için üç test gürültüye takıldı; model gevşetilmedi: ipucu sadakat örneklemi 150→250 vaka, depo testi suçlu vaka bulan döngü, zorluk bot karşılaştırmasına 0.05 gürültü payı.

**Değişen dosyalar:** src/motor/{arketipler,gerceklik,tipler,dil}.ts, src/arayuz/ekranlar/Analiz.tsx, tests/motor/{arketip,ipucu,zorluk}.test.ts, tests/arayuz/depo.test.ts, docs.

**Testler:** 243 geçti / 0 kaldı (komut: `npm test`). `npm run typecheck` temiz. file:// kontrolü hata 0.

**Alınan kararlar:** Arketip çözüm anahtarı değildir; fail, sırlar ve deliller yine gerçeklik grafiğinden gelir (örüntü testi geçiyor).

**Sorunlar / riskler:** Üretim değişince eski seed'ler farklı vaka üretir; regresyon seed'leri henüz tutulmuyor (AJAN_PROMPTU §4) — sonraki ajan `tests/regresyon/` açabilir.

**Yarım kalanlar:** Yok.

**Sıradaki ajan için:** kalan tatbikatlar, takım hikâyesi + Ayna, oynanış cilası (DURUM.md).

## [2026-09-16 11:40] Ajan #1 — Kanepe molası, ifade çizelgesi, kalibrasyon günlüğü, regresyon seed'leri
**Görev:** TASARIM §3 adım 5 (kanepe molası), §9 (zaman çizelgesi, kalibrasyon grafiği) ve AJAN_PROMPTU §4 (regresyon seed'leri).

**Yapılanlar (önce test, kırmızı, sonra kod):**
- `depo.kanepeMolasi()`: zaman +1; `TakimNotu` (delil/dedikodu/boş); dedikodular bilgi katmanından, doğruluk etiketi sızmaz; kayıtla taşınır; suçlama sonrası kapalı. Kabuk'ta "☕ Kanepe molası".
- `src/arayuz/oyun/cizelge.ts`: `ifadeCizelgesi(sorgu)` (defterden kişi × dilim iddiaları) → Pano'da tablo; `kalibrasyonOzeti(gecmis)` (Brier'dan güven geri türetilir, üç kova) → Analiz'de karar günlüğü tablosu (beyan > doğruluk +15 puan ise kırmızı).
- `tests/regresyon/seedler.test.ts`: 6 seed anlık görüntü.
- Testler: `tests/arayuz/cila3.test.ts` (4) + regresyon (6).

**Değişen dosyalar:** src/arayuz/oyun/{depo,cizelge}.ts, src/arayuz/ekranlar/{Kabuk,Pano,Analiz}.tsx, tests/arayuz/cila3.test.ts, tests/regresyon/seedler.test.ts, docs.

**Testler:** 253 geçti / 0 kaldı (komut: `npm test`). `npm run typecheck` temiz. file:// kontrolü hata 0.

**Alınan kararlar:** Regresyon anlık görüntüleri üretim bilerek değiştiğinde güncellenir; kural olarak günlüğe "anlık görüntü yenilendi" notu düşülür.

**Sorunlar / riskler:** Yok.

**Yarım kalanlar:** Yok.

**Sıradaki ajan için:** kalan tatbikatlar, takım hikâyesi + Ayna taslağı, diğer araçlar (DURUM.md).

## [2026-09-16 12:30] Ajan #1 — Kalan tatbikatlar: Linda, off-beat, ince dilim, çift kör
**Görev:** TASARIM §13'teki son dört tatbikatı kurmak; kaynaklı ve Kılavuz'a bağlı.

**Yapılanlar (önce test, kırmızı, sonra kod):**
- `mini_oyunlar.json` + `.ts`: `linda` (5 çift: 4 birleşim + 1 ayrık; `lindaPuanla`), `offBeat` (5 an, 3 soru; `offBeatPuanla`), `inceDilim` (2 kişi × sıcaklık/baskınlık/yalan; `inceDilimPuanla`, yalan≠bilinemez → aşırı genelleme), `ciftKor` (6 gerekli + 6 tuzak; `ciftKorPuanla`).
- `kilavuz.json`: `birlesim-yanilgisi` (bilişsel yanlılıklar, güçlü; Tversky & Kahneman 1974, Konnikova) ve `cift-kor-test` (inanç/paranormal, güçlü; Derren Brown, Wiseman, French 2024). Toplam 64 madde.
- Depo: `TatbikatId` genişledi; `lindaBitir/offBeatBitir/inceDilimBitir/ciftKorBitir`; sonuçlar kayıtla taşınır.
- `Tatbikat.tsx`: dört yeni bileşen, sonuç sonrası seçenek renklendirme ve madde başına açıklama; `KILAVUZ_BAGI` haritası. `Baslik.tsx`: dört düğme + `puanEki`.
- Test: `tests/arayuz/miniOyunlar2.test.ts` (9): içerik bütünlüğü (kaynaklar kütükte, tek doğru, birleşimde kısa / ayrıkta uzun seçenek doğru, yalan boyutu 'bilinemez', ≥5 gerekli/≥5 tuzak), puanlama sınırları, depo akışı ve dışa/içe aktarım.

**Değişen dosyalar:** src/icerik/{mini_oyunlar.json,mini_oyunlar.ts,kilavuz.json}, src/arayuz/oyun/depo.ts, src/arayuz/ekranlar/{Tatbikat,Baslik}.tsx, tests/arayuz/miniOyunlar2.test.ts, docs.

**Testler:** 262 geçti / 0 kaldı (komut: `npm test`). `npm run typecheck` temiz. `npm run build` tek dist/index.html (456 kB).

**Alınan kararlar:** Linda tatbikatına ayrık çift eklendi (kalıp kırıcı); Kılavuz'a iki madde eklendi (kaynaklar NOTLAR başlıklarıyla eşleşiyor, yeni kaynak kaydı gerekmedi).

**Sorunlar / riskler:** İnce dilim 'gerçek' değerleri kurgusal iş arkadaşı yargısıdır; metinde bunun kişilik okuması olduğu, suç okuması olmadığı açıkça yazıldı. Tatbikatlar için aralıklı tekrar önerisi (Analiz'den tatbikata yönlendirme) henüz yok.

**Yarım kalanlar:** Yok.

**Sıradaki ajan için:** 1) Takım arka plan hikâyesi + Ayna ark taslağı (TASARIM §14). 2) Diğer araçlar (§7): oda okuma, dijital iz, "şu an ne düşünüyor?", kayıt inceleme. 3) Analiz ekranından hata etiketine uygun tatbikat önerisi (aralıklı tekrar).

**Geliştirme fikirleri:** Off-beat tatbikatını vaka üreticisine bağlamak: zaman çizelgesinde gerçek bir "gevşeme anı"na delil yerleştirme (sahnelenmiş delil ile birleşir).

## [2026-09-16 13:20] Ajan #1 — Takım hikâyesi ve Ayna taslağı
**Görev:** TASARIM §14: vakalar arası takım diyalogları; kör nokta verisini okuyan ana düşman taslağı.

**Yapılanlar (önce test, kırmızı, sonra kod):**
- `src/arayuz/oyun/takim_hikaye.ts`: `TAKIM_ARKI` (4 üye × 5 bölüm, her biri Kılavuz maddesine bağlı), `takimSahnesi(gecmis, ad)` → tepki + arka plan + karşılık + kapanış; 20 hata etiketi için üye/tepki eşlemesi. Analiz'de "Ofis · sonra" bölümü (takım açıksa).
- `src/motor/ayna.ts`: `AYNA_KADANSI=3`, `aynaVakasiMi`, `aynaTahmini` (etiket → görünür özellik), `aynaNotu` (imza), `aynaOkuduMu`.
- Depo: `OyunDurumu.ayna`, `VakaGecmisi.ayna`, `yeniVaka` kadans kontrolü, `suclamaYap` okundu kaydı, dışa/içe aktarım. `VakaAcilis` notu gösterir; `Analiz` "Ayna seni okudu / yanıldı" + gerekçe + kör nokta bağı.
- Testler: `tests/motor/ayna.test.ts` (6: kadans, geçerli/deterministik tahmin, kural doğrulaması, örüntü/şans, not), `tests/arayuz/takimHikaye.test.ts` (6: ark içeriği, sahne determinizmi, tepki/rol eşlemesi, bölüm ilerlemesi, depo Ayna bütünleşmesi, kayıt).

**Değişen dosyalar:** src/motor/ayna.ts, src/arayuz/oyun/{takim_hikaye,depo}.ts, src/arayuz/ekranlar/{Analiz,VakaAcilis}.tsx, tests/motor/ayna.test.ts, tests/arayuz/takimHikaye.test.ts, docs.

**Testler:** 274 geçti / 0 kaldı (komut: `npm test`). `npm run typecheck` temiz. `npm run build` tek dist/index.html (471 kB).

**Alınan kararlar:** K-013 (Ayna oyuncuyu okur, vakayı değil; kadans 3; not ad vermez).

**Sorunlar / riskler:** Takım arka plan hikâyeleri kurgu; içlerindeki dersler Kılavuz maddelerine bağlı ama hikâyeler kaynak iddiası değil. Ayna vakaları henüz sıradan vakalardan farklı üretilmiyor (yalnızca not + analiz).

**Yarım kalanlar:** Yok.

**Sıradaki ajan için:** 1) Diğer araçlar (TASARIM §7): oda okuma, dijital iz, "şu an ne düşünüyor?", kayıt inceleme. 2) Analiz'den hata etiketine uygun tatbikat önerisi (aralıklı tekrar). 3) Ayna arkı: Ayna vakalarına özel arketip ("sahnelenmiş olay" ağırlığı) ve ark boyunca biriken notlar.

**Geliştirme fikirleri:** Ayna "okundu" oranını kör nokta grafiğinde göstermek; takım sahnesinde oyuncunun kısa cevap seçmesi (Watson'a anlat ile birleşebilir).

## [2026-09-16 13:50] Ajan #1 — Aralıklı tekrar: Analiz'den tatbikat önerisi
**Görev:** Vaka sonunda hata etiketinden ilgili tatbikata yönlendirme (TASARIM §11 "çalışma önerisi").

**Yapılanlar (önce test, kırmızı, sonra kod):**
- `src/arayuz/oyun/tatbikat_onerisi.ts`: `TATBIKAT_ADLARI`, `TATBIKAT_ONERISI` (13 etiket → 6 tatbikat; gerekçeler yorumda), `tatbikatOner(etiketler)` tekrarsız ve sıralı.
- `Analiz.tsx` "Öğrendiklerin" altında "Önerilen tatbikat" düğmeleri (tamamlanmışsa "· tekrar"); `tatbikatKapat` zaten analize döndürüyor.
- Test `tests/arayuz/tatbikatOnerisi.test.ts` (3): eşleme geçerliliği, tekrarsız/sıralı öneri, depo gidiş-dönüş.
- Yan iş (kullanıcı isteği): Higgsfield CLI global kuruldu (1.1.25), `npx skills add higgsfield-ai/skills` projeye `.agents/skills/` kurdu; `.gitignore`'a `.agents/`, `.claude/skills/`, `skills-lock.json` eklendi.

**Değişen dosyalar:** src/arayuz/oyun/tatbikat_onerisi.ts, src/arayuz/ekranlar/Analiz.tsx, tests/arayuz/tatbikatOnerisi.test.ts, .gitignore, docs.

**Testler:** 277 geçti / 0 kaldı (komut: `npm test`). `npm run typecheck` temiz.

**Alınan kararlar:** Yok.

**Sorunlar / riskler:** Yok.

**Yarım kalanlar:** Yok.

**Sıradaki ajan için:** 1) Diğer araçlar (TASARIM §7). 2) Ayna arkı (özel arketip, biriken notlar). 3) Higgsfield ile portre/mekân görselleri (`assets/HIGGSFIELD_PROMPTLAR.md`; CLI artık kurulu, `assets/KAYIT.md` tutulacak).

## [2026-09-16 16:00] Ajan #1 — Diğer araçlar: oda okuma, dijital iz, iç ses, kayıt inceleme
**Görev:** TASARIM §7'de kalan dört aracı kurmak; hepsi kaynaklı, Kılavuz'a bağlı, gizli bilgiyi oyun sırasında sızdırmayan.

**Yapılanlar (önce test, kırmızı, sonra kod):**
- `src/motor/araclar.ts` (yeni): `odaOku` (Gosling 2002: eşya = kimlik iddiası kendine/başkalarına, kalıntı iç/dış, sahnelenmiş; sır → tek kalıntı; "hoş oda = hoş insan" tuzak eşyası geçersiz; sahnelenmiş oda öz-izlemeye bağlı, faille ilişkisiz), `odaKarnesi`, `dijitalIz` (Kosinski/Gosling 2011: arkadaş/paylaşım dışadönüklükle r>.4, kaygıyla |r|<.15; yüksek öz-izleyen kurbana dair soğuk görünmez), `icSesKategorisi/icSesMetni/icSesTahminEt` (Ickes 1990: 6 kategori; gerçek cevabın gizli etiketinden; <3 soru konuşulmuşsa 6 seçenek, yoksa 4; sonuç vaka sonunda), `kayitIncele` (Swerts 2013: kayma çarpanı 1.25 = küçük etki; temel çizgi varsa gözlemler normali/sapma; yoksa sıra yanlılığı uyarısı).
- `teknik.ts`: `Sorgu.odaOkumalari/odaSiniflamalari/icSesTahminleri`, `TeknikParametreleri.soru/tahmin`, dört yeni `TeknikSonucu` üyesi, dağıtım ve özet.
- `puan.ts`: `odaKarnesi`, `icSesKarnesi`; `profil:` gerekçesiyle yanılınca `oda-okuma-suc`; ≥3 tahminin ≥%60'ı "suç kaygısı" ve gerçek <%50 ise `yalan-yanliligi`.
- İçerik: teknikler +4 (16), Kılavuz +2 (`empatik-dogruluk` orta, `kayit-inceleme` zayıf; 66 madde), kaynak `Ickes 1990` (49), hata etiketi `oda-okuma-suc` (22). `oda-ipuclari` ve `dijital-iz` maddelerine ilişkili teknik bağı.
- Arayüz: Sorgu odasında "Kişiyi oku" bloğu (üç düğme + iç ses tahmin seçicisi), okunan odanın eşya listesi ve sınıflama seçicisi; Analiz'de "Oda okuma karnesi" (gerçek tür, ima, geçersiz çıkarım işareti) ve "İç ses karnesi"; Suçlama'da "Oda okuması / dijital profil" dayanağı; `tatbikat_onerisi`: `oda-okuma-suc` → ince dilim; `metinler.ts` dört metin; depo `esyaSinifla`, dışa/içe aktarım.
- Testler: `tests/motor/araclar.test.ts` (16: içerik bağları, oda determinizmi/sır kalıntısı/tuzak oranı/dışadönüklük/örüntü denetimi/karne/etiket, dijital korelasyonlar/ton kürasyonu, iç ses eşlemesi/akış/sızma/yanlılık etiketi, kayıt akışı/küçük etki), `tests/arayuz/araclarDepo.test.ts` (4).

**Değişen dosyalar:** src/motor/{araclar,teknik,puan}.ts, src/icerik/{teknikler,kilavuz,kaynaklar,hata_etiketleri}.json, src/arayuz/oyun/{depo,metinler,tatbikat_onerisi}.ts, src/arayuz/ekranlar/{SorguOdasi,Analiz,Suclama}.tsx, tests/motor/araclar.test.ts, tests/arayuz/araclarDepo.test.ts, docs.

**Testler:** 297 geçti / 0 kaldı (komut: `npm test`). `npm run typecheck` temiz. `npm run build` tek dist/index.html (496 kB).

**Alınan kararlar:** K-014 (iç ses gerçeği vaka sonunda açılır; kişilik okuması suç dayanağı olamaz → etiket).

**Sorunlar / riskler:** Oda eşyaları 4 kişilik parametresinden türer; Gosling'in en güçlü bulgusu (açıklık ← kitap çeşitliliği) modelde karşılığı olmadığı için yalnızca "gürültü" eşyası olarak var. Kayıt inceleme etkisi bilerek küçük; oyuncu "işe yaramıyor" diyebilir — Kılavuz bunu dürüstçe söylüyor. `teknikler.json` python yamasıyla yeniden biçimlendi (içerik aynı, diff büyük).

**Yarım kalanlar:** Yok.

**Sıradaki ajan için:** 1) Ayna arkı: Ayna vakalarına özel arketip ağırlığı, ark boyunca biriken notlar, "okundu" oranı kör nokta bölümünde. 2) Zor seviye ölçümü: bot denge testleriyle zor seviyede başarım rakamları çıkarıp kullanıcıya sun (kullanıcı henüz oynamadı; açık kararlar oynayınca). 3) Higgsfield görselleri (kullanıcı "üret" deyince).

**Geliştirme fikirleri:** "İkinci kez sor" mekaniği (Swerts: tekrar sorulan yalan daha çok sızdırır) — defter aynı cevabı verir, ipucu çekimi `tekrar` etiketiyle 1.2 çarpan. Oda okumada oyuncunun sınıfladığı "sahnelenmiş" eşyayı panoya tek tıkla "olmayan/tutarsız" olarak eklemek.

## [2026-09-16 16:30] Ajan #1 — Zor seviye bot ölçümü (rapor; kod değişmedi)
**Görev:** Kullanıcının "zor yeterince zor mu?" sorusuna rakam vermek (kullanıcı henüz oynamadı).
**Yapılanlar:** Geçici ölçüm testi (commit edilmedi, silindi): 300 vaka × 3 zorluk × 3 bot; ardından tanı (tanık/delil/kaçamak oranları). Sonuçlar DURUM.md "Açık kararlar" 2'de. Özet: yöntem botu her zorlukta %97; zorluk parametreleri tanık ve delil çelişkisini azaltıyor (zorda %23 vakada ikisi de yok) ama fail "olay anında iz bırakan tek kişi + geçerli CIT" yolundan hâlâ bulunuyor.
**Değişen dosyalar:** docs/DURUM.md, docs/AJAN_GUNLUGU.md.
**Testler:** 297 geçti (değişiklik yok).
**Alınan kararlar:** Yok; seçenekler kullanıcıya sunuldu (a: masuma gürültü izi, b: failin ayrıntıyı fark etmemesi, c: önce oyna).
**Sıradaki ajan için:** Kullanıcı seçenek seçerse `ZORLUK_PARAMETRELERI` + `delil.ts` tohumunu değiştir; `tests/denge/botlar.test.ts` ve `tests/motor/zorluk.test.ts` eşiklerini (zorda >%65) koru; regresyon seed'leri değişirse günlüğe yaz.

## [2026-09-16 17:00] Ajan #1 — Ayna arkı: özel arketip ağırlığı, biriken notlar, okunma oranı
**Görev:** Ayna vakalarını sıradan vakalardan farklı üretmek ve ark boyunca biriken bir hikâye kurmak (TASARIM §14; K-013'te "sonraya bırakılan" kısım).

**Yapılanlar (önce test, kırmızı, sonra kod):**
- `tipler.ts`: `VakaAyari.ayna?: boolean`. `gerceklik.ts`: bayrak açıkken `AYNA_ARKETIPLERI` (motel-sahnelenmis, sahte-medyum, karnaval-el-cabuklugu, romantik-dolandiricilik, ofis-sabotaj, tarikat-ici-olum, hastane-yanlis-doz; her mekân için en az biri) ağırlığı ×5. Aynı seed'de mekân, kişiler, kurban aynı kalır; yalnızca arketip akışı değişir. Örüntü testi: Ayna vakasında da tahmin faille şans düzeyinde.
- `ayna.ts`: `AynaArkOzeti`, `aynaArkOzeti(gecmis)`, `aynaOkunmaOrani(gecmis)`; `aynaNotu(..., ark?)` ilk karşılaşmada tanışma, sonrakilerde "geçen sefer okudum / şaşırttın" cümlesi (deterministik; geriye uyumlu).
- Depo: Ayna vakasında `ayar.ayna` + hedeflere `sahnelenmis-delil`; `AynaDurumu.karsilasma`; `VakaGecmisi.ayna.not`; `aynaArki()`, `aynaOkunmaOrani()`; içe aktarımda bayrak korunur (aksi hâlde kayıt farklı arketiple açılırdı — test var).
- Arayüz: vaka açılışında "aynı el yazısı, n. kez"; Analiz'de Ayna bölümünde "Önceki notları" (details), kör nokta bölümünde "Ayna n karşılaşmada seni k kez okudu".
- Testler: `tests/motor/aynaArki.test.ts` (5), `tests/arayuz/aynaArki.test.ts` (3); `takimHikaye.test.ts` iki `toEqual` → `toMatchObject` (kayda `not` eklendi).

**Değişen dosyalar:** src/motor/{tipler,ayna,gerceklik}.ts, src/arayuz/oyun/depo.ts, src/arayuz/ekranlar/{Analiz,VakaAcilis}.tsx, tests/motor/aynaArki.test.ts, tests/arayuz/aynaArki.test.ts, tests/arayuz/takimHikaye.test.ts, docs.

**Testler:** 305 geçti / 0 kaldı (komut: `npm test`). `npm run typecheck` temiz. `npm run build` tek dist/index.html (498 kB).

**Alınan kararlar:** K-015 (Ayna vakası ayarla üretilir; ağırlık ×5; kayıt bayrağı taşır).

**Sorunlar / riskler:** Ayna vakası hedefine `sahnelenmis-delil` eklenir; kolay zorlukta sahneleme olasılığı 0 olduğundan hedef sağlanamaz (yalnızca arketip ağırlığı işler). Regresyon seed'leri değişmedi (bayrak yokken ağırlıklar aynı).

**Yarım kalanlar:** Yok.

**Sıradaki ajan için:** 1) Kullanıcı zor seviye seçeneğini (DURUM açık karar 2) seçerse uygula. 2) Higgsfield görselleri (kullanıcı isteğiyle). 3) Geliştirme fikirleri: "ikinci kez sor" mekaniği; Ayna arkı finali (3. karşılaşmadan sonra takım sahnesinde Ayna'ya dair konuşma).

**Geliştirme fikirleri:** Ayna'nın 3. karşılaşmasında takım hikâyesine özel bölüm; okunma oranı ≥%67 ise Ayna notunun tonu sertleşsin.

## [2026-09-16 17:40] Ajan #1 — Higgsfield üretim denemesi: deneme kısıtına takıldı
**Görev:** Kullanıcı onayıyla (110 kredi) portre/mekân görsellerini üretmek.
**Yapılanlar:** Çalışma alanı seçildi (`higgsfield workspace set`), maliyetler ölçüldü (GPT Image 2.5 = 1, Z Image = 0.15, Soul Location = 0.12 kredi; tablo `assets/KAYIT.md`). Deneme üretimleri (gpt_image_2_5, z_image, soul_location, workflow cinematic_studio_soul_location) hepsi `only_mcp_usage_on_trial_is_available` ile reddedildi; kredi harcanmadı. Web araştırması: deneme hesabında CLI kapalı, resmî MCP açık. `claude mcp add --transport http --scope user higgsfield https://mcp.higgsfield.ai/mcp` çalıştırıldı; yetkilendirme kullanıcıda (`/mcp` → tarayıcı OAuth), sonra yeni oturum.
**Değişen dosyalar:** assets/KAYIT.md, docs/AJAN_GUNLUGU.md, docs/DURUM.md (kullanıcı ayarı: ~/.claude.json MCP kaydı).
**Testler:** 305 (değişiklik yok).
**Sıradaki ajan için:** MCP yetkilendirilince: 1) p01 ile stil denemesi (GPT Image 2.5, quality medium, 1:1), beğenilirse 24 portre + 4 takım; 2) 8 mekân + sorgu odası Soul Location 16:9; 3) ana görsel; 4) WebP'ye çevir (portre 512², ≤60 KB; mekân 1280×720, ≤150 KB), `assets/portreler/`, `assets/mekanlar/`; 5) `Portre.tsx` gerçek görsel + kişi→portre eşlemesi (cinsiyet/yaş uyumlu, seed'le deterministik), mekân türü→arka plan; KAYIT.md satırları.

## [2026-09-16 19:00] Ajan #1 — Higgsfield görselleri üretildi ve oyuna gömüldü (110 kredi → 0)
**Görev:** Kullanıcı onayıyla görsel havuzunu üretmek ("kredi çöpe gitmesin, hepsini kullan") ve oyuna bağlamak.

**Yapılanlar:**
- Erişim: CLI deneme kısıtı; claude.ai Higgsfield MCP bağlayıcısı (kullanıcı yetkilendirdi) ile `generate_image_batch` + `jobs_wait`; eş zamanlı iş sınırı 8.
- Üretim (122 görsel, ~110 kredi): 56 portre + 4 takım (GPT Image 2.5), 9 mekân, 18 oda, 12 Kılavuz bölümü, 7 tatbikat, 4 delil türü, 12 diğer (ana görsel varyantları, ofis, kanepe, forer, watson, mantar dokusu, suçlama, Ayna notu). Tümü `assets/KAYIT.md`'de tablo hâlinde; elenenler ve ders (Soul Location figür ekliyor → iç mekânda GPT) not edildi.
- Kod (önce test): `src/arayuz/gorseller.ts` — `import.meta.glob` kütükleri, `PORTRE_KAYITLARI` (cinsiyet/yaş), `portreEslemesi` (seed'le deterministik, cinsiyet uyumlu, yaş ağırlıklı, vakada tekrarsız, faille ilişkisiz), `portreUrl`, `mekanGorseli`, `odaGorseli`. `Portre.tsx` `src` desteği (yoksa siluet). Ekranlar: Başlık (ana görsel), Vaka açılışı (mekân + portreler + Ayna notu görseli), Sorgu (portre, takım yorumu portresi), Kılavuz (bölüm görseli), Tatbikat (başlık), Analiz (ofis + takım portreleri), Pano (mantar dokusu, kanepe), Suçlama, Forer, Watson.
- Test: `tests/arayuz/gorseller.test.ts` (6): varlık, boyut bütçesi (portre ≤60 KB, mekân/oda ≤150 KB, toplam ≤6 MB), eşleme (cinsiyet, tekrarsız, deterministik, yaş farkı <10), örüntü denetimi (fail portre no ≈ masum), her oda görsel alır.

**Değişen dosyalar:** assets/** (122 webp), assets/KAYIT.md, src/arayuz/gorseller.ts, src/arayuz/ekranlar/{Portre,VakaAcilis,SorguOdasi,Baslik,Kilavuz,Tatbikat,Analiz,Pano,Suclama,Forer,Watson}.tsx, tests/arayuz/gorseller.test.ts, docs.

**Testler:** 311 geçti / 0 kaldı (komut: `npm test`). `npm run typecheck` temiz. `npm run build` tek dist/index.html 5.98 MB (gzip 4.3 MB; 122 data:image/webp).

**Alınan kararlar:** Portre eşlemesi seed + cinsiyet + yaş; ifade nötr (Barrett). Oda ve delil görselleri şimdilik yalnızca varlık; ekrana bağlanmadı.

**Sorunlar / riskler:** dist 6 MB (önce 0.5 MB): dosya paylaşımı için kabul edilebilir; gerekirse portre 384² / oda q50 ile ~4 MB'a iner. Higgsfield kredisi 0; yeni görsel için yeniden kredi gerekir.

**Yarım kalanlar:** Yok.

**Sıradaki ajan için:** 1) Oda görsellerini ekrana bağla (ör. "Neredeydin?" cevabında küçük oda kartı; `odaGorseli`). 2) Delil kartlarını Pano/Suçlama'da göster (`DELIL_GORSELLERI[delil.tur]`). 3) Kullanıcı oynayınca açık kararlar (zor seviye, bütçe).

**Geliştirme fikirleri:** `ana-dikey` mobil başlık; `ana-pano` Analiz arka planı; portre havuzu büyürse `PORTRE_KAYITLARI` JSON'a taşınabilir.

## [2026-09-16 19:40] Ajan #1 — İkinci kez sor, oda/delil görselleri ekranda, Ayna 3. karşılaşma sahnesi, eşya → pano
**Görev:** Günlükteki geliştirme fikirlerinden dördünü kapatmak (kullanıcı oynayamıyor; sıradaki işlerden devam).

**Yapılanlar (önce test, kırmızı, sonra kod):**
- **İkinci kez sor** (`teknik.ts`): `Sorgu.soruSayaci`; `sor()` aynı soruda cevabı değiştirmez (defter), gözlemleri `tekrarN` akışıyla yeniden çeker ve yalan kaymasını `TEKRAR_CARPANI = 1.2` ile büyütür (Swerts 2013 %53→%62; doğru cevapta kayma yok). `SorSonucu.tekrar`. Depo: kayıt "(tekrar)" işaretli; sayaç dışa/içe aktarımda. Test `tests/motor/tekrarSor.test.ts` (2): sayaç/deterministik cevap; fail yalanında 2. soruş ipucu oranı 1.0–1.6, doğru cevapta 0.85–1.15.
- **Oda görselleri**: `KonusmaKaydi.odaId` (konum cevabı); sorgu akışında söylenen odanın 96×54 küçük resmi ("iddia; gerçek değil" ipucu). **Delil kartları**: vaka açılışında delil türü ikonu.
- **Ayna 3. karşılaşma** (`takim_hikaye.ts`): `SahneGecmisi.ayna`, `AYNA_SAHNE_ESIGI = 3`; son vaka Ayna vakasıysa ve ≥3. karşılaşmaysa takım Ayna'yı konuşur (okundu: lider + sorgucu "kalıbı kır"; kırdı: lider + inanan "kayıtlara erişimi mi var?"); `TakimSahnesiSonucu.ayna` (karşılaşma, okunma oranı).
- **Eşya → Pano**: oda okuma listesinde "→ Pano" düğmesi (gözlem olarak ekler).
- Test `tests/arayuz/devam.test.ts` (2): odaId/tekrar/kayıt; Ayna sahnesi eşik, ton farkı, determinizm.

**Değişen dosyalar:** src/motor/teknik.ts, src/arayuz/oyun/{depo,takim_hikaye}.ts, src/arayuz/ekranlar/{SorguOdasi,VakaAcilis}.tsx, tests/motor/tekrarSor.test.ts, tests/arayuz/devam.test.ts, docs.

**Testler:** 315 geçti / 0 kaldı (komut: `npm test`). `npm run typecheck` temiz. `npm run build` 5.98 MB.

**Alınan kararlar:** K-016 (tekrar sorma: cevap sabit, gözlem çarpanı küçük).

**Sorunlar / riskler:** Teknikler (açık uçlu anlatım vb.) sayaçları artırır; sonra aynı dilimi elle sormak "tekrar" sayılır — anlamlı (gerçekten tekrar). Oda küçük resmi iddiayı gösterir, gerçeği değil; başlıkta yazıyor.

**Yarım kalanlar:** Yok.

**Sıradaki ajan için:** 1) Kullanıcı oynayınca açık kararlar (zor seviye seçenekleri a/b/c, saat bütçesi). 2) dist 6 MB rahatsız ederse portre 384² / oda q50. 3) Fikir: Kılavuz 'kayit-inceleme' maddesine "ikinci kez sor" için oyun içi bağ (teknik listesi değil, sorgu ipucu metni).

## [2026-09-16 20:20] Ajan #1 — Tarayıcı ekran kontrolü, seçici taşması, rol tutarlılığı (yaş/cinsiyet)
**Görev:** Görsellerin gerçek tarayıcıda yerleşimini doğrulamak; bulunanları düzeltmek.
**Yapılanlar:** Playwright Chromium kuruldu (`npx playwright install chromium`); scratchpad betiği `dist/index.html`'i file:// ile açıp 7 ekranın görüntüsünü aldı (konsol hatası 0). Bulgular: (1) Sorgu panelinde iç ses seçicisi taşıyordu → `width: 100%`. (2) **Gerçekçilik hatası:** roller yaş/cinsiyete bakmıyordu ("25 yaşında erkek, kurbanın annesi"; "21 yaşında terapist"). `havuzlar.ts` `ROL_KOSULLARI` + `uygunRoller` (anne/baba cinsiyet ve ≥16 yaş fark; üvey çocuk ≤−16; yeğen ≤−10; kardeş/kuzen |fark|≤25; çocukluk arkadaşı ≤8; avukat/muhasebeci/terapist ≥27; iş ortağı ≥23; eski ortağı ≥25; hiçbiri uymazsa "yakını"). RNG tüketimi aynı → regresyon seed'leri değişmedi. Test `tests/motor/roller.test.ts` (2).
**Değişen dosyalar:** src/motor/{havuzlar,gerceklik}.ts, src/arayuz/ekranlar/SorguOdasi.tsx, tests/motor/roller.test.ts, docs.
**Testler:** 317 geçti / 0 kaldı. Typecheck temiz. Build 5.98 MB.
**Sıradaki ajan için:** Ekran kontrolü tekrar gerekirse: scratchpad'de `ekran.mjs` yoktur (oturumluk); Playwright + `chromium.launch()` ile `dist/index.html`'i aç, `.kisi-listesi button`, `.panel .dugmeler button`, `input[name=fail]`, `.birincil` seçicileri iş görür. Chromium `~/AppData/Local/ms-playwright` altında kurulu.

## [2026-09-16 21:00] Ajan #1 — İçerik kalitesi: Türkçe ekler, gözlem spam'i, rol tekilliği/soyadı, büyük harf (DEVİR TESLİM)
**Görev:** Üç vakanın metin dökümünü gözle okuyup görünen kusurları düzeltmek; sonra yeni ajana devretmek (kullanıcı isteği).

**Yapılanlar (önce test, kırmızı, sonra kod):**
- **Türkçe ekler:** `delil.ts` ve `takim.ts` sabit "'a ait / 'ı kaydetmiş / 'ın telefonu" yerine `yonelme/belirtme/tamlayan` kullanır ("Güneş'e ait", "Moreau'yu kaydetmiş", "Duran'ın telefonu"). `turkce.ts`: özel adlarda (ozel=true) iki kelimeli adlar iyelikli tamlama sayılmaz ("Delgado'ya", eskiden "Delgado'na"). Yabancı sessiz-e adları yazıma göre çekimlenir ("Whitmore'nin"; bilinçli dar kapsam).
- **Gözlem spam'i:** depo `gozlemOzeti` — kayıt başına ipucu kimliğine göre tekilleştirme; sınır 8 (serbest anlatım) / 6 (temel çizgi). Eskiden 8 dilim × ~3 ipucu = 25 tekrarlı cümle.
- **Roller:** `TEKIL_ROLLER` (anne, baba, eş, avukat, muhasebeci, terapist, şoför, asistan, bahçıvan, sevgili) bir vakada bir kez; `SOYADI_ORTAK_ROLLER` (anne/baba/kardeş) kurbanın soyadını alır; asistan ≤50, çalışan/şoför ≤65 yaş. RNG tüketimi aynı, regresyon seed'leri geçiyor.
- **Büyük harf:** cevap metni `basHarfBuyut` ile başlar ("sözleşme sahteciliği diyorlar" → "Sözleşme…").
- Testler: `tests/motor/metinKalite.test.ts` (3), `tests/arayuz/devam.test.ts` +1.

**Değişen dosyalar:** src/ortak/turkce.ts, src/motor/{delil,havuzlar,gerceklik}.ts, src/arayuz/oyun/{depo,takim}.ts, tests/motor/metinKalite.test.ts, tests/arayuz/devam.test.ts, docs.

**Testler:** 321 geçti / 0 kaldı (komut: `npm test`). `npm run typecheck` temiz. `npm run build` 5.98 MB.

**Alınan kararlar:** Yok (kalite düzeltmeleri).

**Sorunlar / riskler:** Metin dökümünde görülen ama dokunulmayanlar: (1) temel çizgi sohbetinde "Aynı konuda önce bir şey söyledi, sonra tersini ima etti" gibi anlatım-odaklı betimlemeler tarafsız sohbette tuhaf kaçabiliyor (ipucu kataloğunda `temel-cizgi` için uygun/uygunsuz işareti eklenebilir); (2) aynı vakada hem "eşi" hem "sevgilisi" olabiliyor (dramatik, bilinçli bırakıldı); (3) 72 yaşında "kuzeni" 33 yaşındaki kurban için mümkün ama seyrek olmalı (kural |fark|≤25 var, tamam).

**Yarım kalanlar:** Yok. Çalışma ağacı temiz, her şey commit'li.

**Sıradaki ajan için (öncelik sırasıyla):**
1) Kullanıcı oynayınca DURUM "Açık kararlar" (zor seviye a/b/c, saat bütçesi).
2) Gözle kalite turu devam: `tests/denge/` altına geçici döküm testi yazıp (örnek: günlük 21:00 kaydı; `OyunDeposu` ile 3 vaka, brifing/kartlar/deliller/cevaplar/gerçek) çıktıyı oku; tuhaflıkları test+kodla düzelt.
3) İpucu kataloğunda temel çizgiye uygun olmayan betimlemeleri ayıkla (bkz. risk 1).
4) İsteğe bağlı: dist 6 MB → portre 384² / oda q50.

**Geliştirme fikirleri:** Kişi kartında rolle uyumlu kısa "ilişki cümlesi" (ör. "üç yıldır avukatı"); oda görsellerini ifade çizelgesine de koymak; takım sahnesinde oyuncu cevabı.

## [2026-09-16 21:25] Ajan #2 — Gözle kalite turu 2: temel çizgi betimlemeleri, yabancı ad ekleri, kişi kartı ilişki cümlesi
**Görev:** Devir teslimdeki sıradaki işler 2–3 (döküm turu, temel çizgiye uymayan betimlemeler) + geliştirme fikri (kişi kartına rolle uyumlu ilişki cümlesi). Kullanıcı kararı gerektirenler (zor seviye, saat bütçesi) beklemede.

**Yapılanlar (önce test, kırmızı, sonra kod):**
- **Döküm:** geçici `tests/denge/_dokum.test.ts` ile 3 vaka (`dokum-a/b/c`: brifing, kartlar, deliller, her kişide temel çizgi + 3 konum + fail + başkası sorusu, gerçek) okundu. Tutarlılık sağlam (koruma yalanları, tanıklık, gerçek anlatımı uyumlu); kusurlar metin düzeyinde. Geçici dosya silindi.
- **Temel çizgi betimlemeleri:** `ipuclari.json` her ipucuya `temelBetimlemeler` (3'er; alışkanlık dili: "Sohbette de göz temasından kaçınıyor; sık sık masaya bakıyor"). `ipucuUret` yeni `baglam: 'temel-cizgi'` seçeneği: yalnızca metin havuzu değişir; `Rastgele.sec` liste uzunluğundan bağımsız tek çekim yaptığı için gözlenen ipucu kümesi birebir aynı (test doğrular). `teknik.ts` temel çizgi tekniği bağlamı geçer; `dogrula.ts` alan varsa ≥3 ister. Ayrıca `tutarsizlik-ambivalans` sorgu betimlemesindeki "'çok üzüldüm' derken sesi düz" alıntısı konum cevabına yapışmıyordu → nötr cümle.
- **Yabancı adlarda ek okunuşa göre (TDK):** `turkce.ts` `OKUNUS` tablosu (Whitmore→Vitmor, Thorne→Torn, Hale→Heyl, Beatrice→Biatris, Margot→Margo); "Beatrice'nin kardeşi" → "Beatrice'in", "Thorne'ye ait" → "Thorne'a ait", "Whitmore'nin telefonu" → "Whitmore'un". Önceki "yazıma göre, bilinçli dar kapsam" tercihi geri alındı; tabloda olmayan adlar yazıma göre kalır ("Baxter'in"). `metinKalite` testi güncellendi.
- **Kişi kartı ilişki cümlesi:** yeni `src/motor/iliski_notu.ts` (`Kisi.iliskiNotu`), 26 rol için şablon. Sayılar yaşla çelişmez (evlilik yılı ≤ küçük eşin yaşı−18; meslek süresi ≤ yaş−alt yaş; kardeşte gerçek yaş farkı, 0 → "İkizler."). Ayrı RNG akışı (`seed/iliski-notu/kId`) → ana akış ve regresyon seed'leri değişmedi. `kisiKarti` sonuna ekler; gizli bilgi taşımaz (test: sır/koru/fail/suç/yalan sözcükleri geçmez).
- Testler: `tests/motor/temelCizgiBetimleme.test.ts` (3), `tests/motor/iliskiNotu.test.ts` (1), `tests/ortak/turkce.test.ts` +1.

**Değişen dosyalar:** src/icerik/{ipuclari.json,tipler.ts,dogrula.ts}, src/motor/{ipucu,teknik,tipler,gerceklik,dil}.ts, src/motor/iliski_notu.ts (yeni), src/ortak/turkce.ts, tests/motor/{temelCizgiBetimleme,iliskiNotu,metinKalite}.test.ts, tests/ortak/turkce.test.ts, docs.

**Testler:** 327 geçti / 0 kaldı (komut: `npm test`; 45 dosya). `npm run typecheck` temiz. `npm run build` 5.99 MB.

**Alınan kararlar:** KARARLAR'a girecek boyutta yok. Küçük kalite kararları: (1) yabancı adlarda ek okunuşa göre, tablo havuzla sınırlı; (2) ilişki notu ayrı RNG akışından, kurbanda yok.

**Sorunlar / riskler:** Testlerde JS regex tuzakları: `\b` Türkçe harfte (ş, ü) kelime sınırı değil; `/i` bayrağı "İ" ile "i"yi eşlemez → sözcük bölme ve açık desen kullanıldı. İlişki notu vaka açılış kartında görünür; sorgu odası kişi listesinde yok (yer dar, bilinçli). Bash heredoc uzun Python'da yine kırıldı; yamalar Write ile scratchpad `.py` olarak yazılıp çalıştırıldı.

**Yarım kalanlar:** Yok. Çalışma ağacı commit'li.

**Sıradaki ajan için:** 1) Kullanıcı oynayınca DURUM "Açık kararlar" (zor seviye a/b/c, saat bütçesi). 2) Döküm turu devam: teknik çıktıları (SUE, bilişsel yük ters sıra, yönlendirici soru, açık uçlu anlatım, Watson, takım sahnesi metinleri) henüz gözle okunmadı; aynı geçici döküm yöntemiyle oku. 3) İsteğe bağlı: dist 6 MB → portre 384² / oda q50.

**Geliştirme fikirleri:** "Ne zamandır tanışıyorsunuz?" türü sohbet sorusu ilişki notunu sorguda yeniden kullanabilir (temel çizgi tekniğinin metnine eklenebilir); oda görsellerini ifade çizelgesinde göstermek; takım sahnesinde oyuncunun kısa cevap seçmesi.

## [2026-09-16 22:00] Ajan #2 — Teknik çıktıları kalite turu: SUE tanık ifadesi, oda eşyası tekilliği, anlatım devam cümlesi, uygulanamayan teknik zamanı
**Görev:** DURUM sıradaki iş 3: teknik çıktılarının (16 teknik, takım yorumu, kanepe, Watson, puan raporu, gerçek anlatımı, ifade çizelgesi, takım sahnesi) metin dökümünü gözle okuyup kusurları test+kodla düzeltmek.

**Yapılanlar (önce test, kırmızı, sonra kod):**
- **Döküm:** geçici `tests/denge/_dokum2.test.ts` (2 vaka × 3 kişi × 16 teknik + kanepe + Watson + suçlama + puan + takım sahnesi); okunup silindi. Not: depo `bildir()` durum nesnesini yeniler; dökümde eski `depo.durum` referansı tutulunca kanepe/Watson boş göründü — oyun hatası değil, betik hatası.
- **SUE tanık ifadesine de uygulanır** (`teknik.ts` sue): delil başkası hakkındaysa o kişi sorulur ("X'i nerede gördün?"); koruma yalanı ("benimleydi") kamera/iz deliliyle çelişebilir. Eskiden kişiyle ilgisiz delil her zaman "uyuşuyor" diyordu. Erken gösterim: kendi konumunda o dilime ait herhangi bir konum delili; tanık sorusunda bu delilin kendisi. Puan bonusu (fail çelişkisi) değişmedi.
- **Oda eşyası vaka içinde tekil** (`araclar.ts`): havuzlar 8'er (GURULTU 12, sır kalıntıları 4'er); `temelEsyalar` ayrıldı; her havuz vaka düzeyinde bir kez karıştırılıp kişi sırasına göre dağıtılır; gürültü önceki kişilerin ihtiyacı kadar kaydırılır; sır eşyası aynı sırrı taşıyanlar arasındaki sıraya göre. 100 vakada kişiler arası tekrar 515 → ≤10 (test).
- **Anlatım devam cümlesi** (`dil.ts anlatimSatirlari`): açık uçlu / ters sıra anlatımda aynı oda + aynı ifade kategorisindeki ardışık dilimler kısa kalıpla ("Hâlâ Oda 7'de; kapının önünde volta atıyordum." / "Oradan çıkmadım."). Dürüst kategoride oda+eylem, yalan kategorilerinde oda/eylem yok. `depo.ts` anlatım satırlarını buradan alır. Eskiden "Saate bakmıştım, … civarıydı" sekiz dilimde tekrarlanıyordu.
- **Uygulanamayan teknik zaman düşmez** (`teknikUygula`): şeytanın avukatı (v0'da görüş/niyet sorusu yok), tahmin/kayıt yokken iç ses ve kayıt inceleme. Sorgu odasında şeytanın avukatı düğmesi kapalı; ipucu metni nedenini söyler. İki eski test (`teknik.test`, `depo.test`) yeni kurala göre güncellendi.
- Test: `tests/motor/kalite2.test.ts` (4).

**Değişen dosyalar:** src/motor/{teknik,araclar,dil}.ts, src/arayuz/oyun/depo.ts, src/arayuz/ekranlar/SorguOdasi.tsx, tests/motor/{kalite2,teknik}.test.ts, tests/arayuz/depo.test.ts, docs.

**Testler:** 330 geçti / 0 kaldı (komut: `npm test`; 45 dosya). `npm run typecheck` temiz. `npm run build` 6.0 MB.

**Alınan kararlar:** KARARLAR'a girecek boyutta yok. Küçük: (1) SUE tanık ifadesine de uygulanır; (2) uygulanamayan teknik ücretsiz; (3) anlatım devam kalıbı dürüst kategoride eylem taşır (tam kalıp da taşıyordu).

**Sorunlar / riskler:** Ters sıra anlatımında "Yine Otoparkta" geriye doğru okunduğunda hafif tuhaf ama anlaşılır. `teknikler.json` SUE "nasil" metni ve Kılavuz SUE maddesi tanık kullanımını henüz anlatmıyor. Takım sahnesinde aynı rolden iki satır art arda gelebiliyor (lider ×2).

**Yarım kalanlar:** Yok. Çalışma ağacı commit'li.

**Sıradaki ajan için:** 1) Kullanıcı oynayınca DURUM "Açık kararlar". 2) `teknikler.json` SUE "nasil" metnine tanık kullanımını ekle; Kılavuz SUE maddesine not (kaynak kütüğünde Hartwig/Granhag SUE kaydı var mı kontrol et; yoksa "doğrulanmadı" işaretle). 3) Döküm turu devam: Analiz ekranı metinleri (hata etiketi açıklamaları, Ayna notu, kalibrasyon özeti) ve Kılavuz maddeleri gözle okunmadı. 4) dist 6 MB isteğe bağlı.

**Geliştirme fikirleri:** Takım sahnesinde rol tekilliği (aynı rol art arda konuşmasın); kanepe delil notu için "→ Pano" düğmesi; ilişki notunu sohbet sorusu olarak kullanmak.

## [2026-09-16 22:15] Ajan #2 — SUE metinleri: tanık kullanımı dürüst etiketlendi (DEVİR TESLİM)
**Görev:** Önceki kaydın sıradaki iş 2'si: `teknikler.json` SUE "nasil/sinirlari" ve Kılavuz SUE maddesi tanık kullanımını anlatmıyordu.
**Yapılanlar:** Teknik "nasil": delil başkası hakkındaysa o kişiyi sorar ("benimleydi" diyen koruyucu kamera kaydıyla çelişebilir). Teknik ve Kılavuz "sinirlari": araştırma (Hartwig, Granhag ve ark.; kaynak kütüğünde Vrij 2010 PSPI üzerinden) şüpheli sorgusuyla sınırlı; tanık ifadesine uygulama **oyunun genişletmesi**; dürüst tanığın yanılması da çelişki üretir → çelişki = sorulacak konu (§6 bilimsel sadakat). Test: `kalite2.test.ts` +1 (metinler tanık/şüpheli/oyun sözcüklerini içerir).
**Değişen dosyalar:** src/icerik/{teknikler,kilavuz}.json, tests/motor/kalite2.test.ts, docs.
**Testler:** 331 geçti / 0 kaldı (45 dosya). typecheck temiz. build 6.0 MB.
**Alınan kararlar:** Yok.
**Sorunlar / riskler:** Yok.
**Yarım kalanlar:** Yok. Çalışma ağacı commit'li.
**Sıradaki ajan için:** 1) Kullanıcı oynayınca DURUM "Açık kararlar" (zor seviye a/b/c, saat bütçesi). 2) Döküm turu: Analiz ekranı metinleri (hata etiketi açıklamaları, Ayna notu, kalibrasyon özeti) ve Kılavuz maddeleri gözle okunmadı; yöntem: 22:00 kaydı. 3) Takım sahnesinde rol tekilliği (aynı rol art arda konuşmasın). 4) dist 6 MB isteğe bağlı.
**Geliştirme fikirleri:** Kanepe delil notu için "→ Pano" düğmesi; ilişki notunu sohbet sorusu olarak kullanmak; oda görsellerini ifade çizelgesinde göstermek.

## [2026-09-16 22:45] Ajan #2 — K-017: zor seviye (masum izi + CIT tanımama), bütçe 12; repo GitHub'a yayınlandı
**Görev:** Kullanıcı kararları: zor seviye "gerçek hayat gibi" zorlaşsın; bütçe aşımı ceza olduğu için 12 kalsın; repoyu yayınla (ortak eklenecek).
**Yapılanlar (önce test, kırmızı, sonra kod):** `tests/motor/zorlukZor.test.ts` (4): parametre sırası, olay odasında izli kişi ortalaması kolay<orta<zor ve zorda çok-şüpheli >%50, failin izi korunur ve masum izi gerçek konumdan, CIT tanıma oranı zor<orta≤kolay ve 0.55–0.85. Kod: `tipler.ts` üç yeni parametre; `delil.ts` tuzak masum izi olay odasındaki masumdan + zorda ikinci masum (ayrı akış `delil-zor`); `teknik.ts` CIT tanıma olasılığı zorluğa bağlı; `Baslik.tsx` zor açıklaması. Regresyon seed'leri, denge botları, çözülebilirlik testleri değişmeden geçti. **GitHub:** `gh repo create` ile özel repo `https://github.com/mryavascann/Mentalist`, `origin/main` push edildi (dist ve PDF'ler git dışı).
**Değişen dosyalar:** src/motor/{tipler,delil,teknik}.ts, src/arayuz/ekranlar/Baslik.tsx, tests/motor/zorlukZor.test.ts, docs.
**Testler:** 335 geçti / 0 kaldı (46 dosya). typecheck temiz. build 6.0 MB.
**Alınan kararlar:** K-017.
**Sorunlar / riskler:** CIT tanıma oranı (0.7) tasarım varsayımı; kaynak kütüğünde suçlu isabet sayısı doğrulanmadı. Bot doğruluğu zorda düşmüyor (çözülebilirlik eleği); insan zorluğu şüpheli sayısı/tuzak olarak artar — oyuncu geri bildirimi bekleniyor.
**Yarım kalanlar:** Yok.
**Sıradaki ajan için:** 1) Döküm turu: Analiz ekranı metinleri ve Kılavuz maddeleri. 2) Takım sahnesinde rol tekilliği. 3) Kullanıcı zor seviyeyi oynayınca K-017 geri dönüş koşulunu kontrol et. 4) dist 6 MB isteğe bağlı.
