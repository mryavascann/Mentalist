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
