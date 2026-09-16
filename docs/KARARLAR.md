# KARARLAR

> Numaralı, kısa kayıtlar. Şablon: tarih · karar · gerekçe · alternatifler · geri dönüş koşulu.
> `AJAN_PROMPTU.md` ile çelişen bir karar varsa daha yeni tarihli olan geçerlidir.

---

## K-001 · 2026-09-16 · Teknoloji yığını: TypeScript + Vite + React + Vitest
- **Karar:** Promptun önerisi aynen benimsendi. Motor (`src/motor`, `src/ortak`) saf TypeScript, DOM'a bağımlı değil. Arayüz React. Testler Vitest; arayüz testleri dosya başına `// @vitest-environment jsdom` ile jsdom'a geçer. Playwright Aşama 2'de eklenecek.
- **Gerekçe:** Motor UI'dan bağımsız kalınca binlerce vakalık örüntü/denge testleri saniyeler içinde koşar. Tarayıcı hedefi için Vite en az sürtünmeli yol.
- **Kurulu sürümler:** TypeScript 7.0, Vite 8.3, Vitest 5.0, React 19.3, jsdom 30. TypeScript 7 `baseUrl` seçeneğini kaldırdı; `paths` göreli (`./src/...`) yazılır; Node tipleri için `@types/node` kurulu.
- **Alternatifler:** Svelte/Solid (daha küçük paket ama ekip aşinalığı daha düşük), saf HTML+TS (ekranlar büyüyünce yönetilemez).
- **Geri dönüş:** Arayüz katmanı motorla sadece tip arayüzleri üzerinden konuşur; React değiştirilebilir.

## K-002 · 2026-09-16 · Kaynak PDF'ler depoya alınmaz
- **Karar:** `docs/kaynaklar/mentaldocs/**/*.pdf` `.gitignore`'da. Yerel diskte dururlar; içerik listesi `kaynaklar/KAYNAK_INDEKSI.md`'de. Zip dosyası açıldıktan sonra kullanıcı onayıyla silindi.
- **Gerekçe:** 120 MB ikili dosya git geçmişini şişirir; kitaplar telifli, halka açık depoda bulunması sorun yaratır.
- **Alternatifler:** Git LFS (ek kurulum, telif sorununu çözmez), ayrı özel depo.
- **Geri dönüş:** Kullanıcı isterse `.gitignore` satırları kaldırılır.

## K-003 · 2026-09-16 · Tasarım belgesi yaşayan belgedir, tohum arşivlenir
- **Karar:** `OYUN_TASARIM_TOHUMU.md` → `docs/TASARIM.md` olarak kopyalandı ve bundan sonra ajanlar tarafından geliştirilir. Orijinal hali `kaynaklar/OYUN_TASARIM_TOHUMU_v1_orijinal.md` olarak dokunulmadan saklanır.
- **Gerekçe:** Tohum "bağlayıcı değil" diyor; değişiklikleri takip edebilmek için orijinal referans lazım.

## K-004 · 2026-09-16 · Kaynak kısaltmaları NOTLAR.md başlıklarıyla eşleşir
- **Karar:** Kodda, içerik JSON'larında ve Kılavuz maddelerinde kaynak alanı `NOTLAR.md`'deki başlıkla aynı biçimde yazılır (ör. `"kaynak": "DePaulo 2003"`, `"kaynak": "Vrij 2010 PSPI"`). İçerik testleri bu eşleşmeyi denetler.
- **Gerekçe:** Tek bir kanonik ad; ileride Kılavuz'dan nota, nottan PDF'e tıklanabilir bağ kurulabilir.

## K-005 · 2026-09-16 · Klasör yapısı ve takma adlar
- **Karar:** Promptun 8. bölümündeki yapı aynen kuruldu. İthalatlarda `@motor/*`, `@icerik/*`, `@arayuz/*`, `@ortak/*` takma adları kullanılır (tsconfig + vite.config eş tutulur).
- **Kural:** `src/motor` ve `src/ortak` içinden `src/arayuz` asla ithal edilmez.

## K-006 · 2026-09-16 · Wiseman ve Rowland kitapları özet metin
- **Karar:** Zip'teki "Paranormality" ve "Full Facts Book of Cold Reading" dosyaları Bookey özetidir, tam kitap değildir. Bu iki kaynağa dayanan Kılavuz maddeleri "özetten alındı" notu taşır; çelişki durumunda birincil makaleler (Hyman 1977, Forer 1949, Wiseman 2012) üstündür.

## K-007 · 2026-09-16 · Oyun adı: "The Mentalist" (kullanıcı kararı)
- **Karar:** Oyunun adı **The Mentalist**. Kahramanın adını oyuncu oyun başında kendisi girer (varsayılan boş; boş bırakılırsa "Okuyucu" kullanılır).
- **Not (ajan uyarısı):** "The Mentalist" tescilli bir dizi adıdır. Eğitim/eğlence amaçlı ücretsiz dağıtımda risk düşük ama sıfır değil; ticari yayın planı olursa ad yeniden değerlendirilmeli. Dizi karakter adları ve gülen yüz sembolü yine kullanılmaz. Kullanıcı uyarıyı bilerek bu adı seçti.
- **Uygulama:** `src/ortak/surum.ts` içindeki `PROJE.ad` = "The Mentalist"; `package.json` adı teknik olarak `the-mentalist`.

## K-008 · 2026-09-16 · Mekân vakadan vakaya değişir (kullanıcı kararı)
- **Karar:** Sabit bir şehir yok. Her vaka kendi mekânını üretir (kurgusal Türkiye şehirleri, yurtdışı, sahil kasabası, karnaval…). Vaka üreticisinde `mekan` bir katmandır; isim havuzları mekâna göre seçilir (Türk adları / yabancı adlar).
- **Gerekçe:** Çeşitlilik kalıp kırıcıdır; mekân havuzu Higgsfield arka planlarıyla (6–8 adet) eşlenir.

## K-009 · 2026-09-16 · Runtime'da LLM YOK; diyalog şablon-gramer motoruyla üretilir
- **Karar:** Oyun çalışırken hiçbir dil modeli çağrılmaz (ne API ne tarayıcı içi model). Diyaloglar, ifadeler ve davranış betimlemeleri **seedli şablon-gramer motoru** (Tracery benzeri, kendi yazdığımız, `src/motor/dil/`) ile üretilir. Her cümle gerçeklik grafiğinden türetilir; yalan/doğru etiketi cümleyle birlikte doğar.
- **Gerekçe (araştırma özeti):**
  - Tarayıcı içi yerel model (WebLLM/WebGPU) ücretsiz ama 0.5B–1.5B model bile 200–850 MB indirme ve 1–2 GB bellek ister; "dosyayı yolla, çift tıkla oyna" hedefiyle uyumsuz. Küçük modeller halüsinasyona daha yatkın; motorun gerçeği (kim ne zaman neredeydi) bozulabilir; her üretimi grafiğe karşı doğrulamak ayrı bir katman gerektirir.
  - Gramer/şablon yaklaşımı deterministik, test edilebilir, seed ile tekrar üretilebilir, sıfır maliyet, çevrimdışı çalışır. Bedeli: yazarlık emeği. Bu emek geliştirme sırasında ajan (Claude) tarafından **derleme zamanında** karşılanır: şablon havuzlarını, karakter üslup parametrelerini ve betimleme varyantlarını biz yazarız; oyuncu tarafında yalnızca birleşim çalışır.
  - Kaynaklar: WebLLM gereksinimleri (localaimaster.com, tinyweights.dev), Tracery/Expressionist üzerine araştırma (Compton; ResearchGate "author-friendly procedural dialogue generation").
- **Tasarım ilkeleri:** (1) her ifade = `{anlam, etiket, üslup}` üçlüsü; anlam gerçeklik grafiğinden, etiket NPC stratejisinden, üslup karakter parametrelerinden. (2) Karakter üslup parametreleri (dolgu sözcükleri, zamir kaçınma, cümle uzunluğu, resmîlik) temel çizgi mekaniğini besler. (3) Betimleme varyantları kataloğu: aynı davranış için 3–6 farklı cümle. (4) Tekrar hissini kırmak için seed bazlı varyant seçimi + "son kullanılanları tekrar etme" bellek.
- **Geri dönüş:** İleride istenirse ayrı bir "üslup zenginleştirici" katman (isteğe bağlı, çevrimiçi) eklenebilir; motor çıktısını doğrulama grafiğine karşı denetleme koşuluyla.

## K-010 · 2026-09-16 · Dağıtım: tek HTML dosyası, çevrimdışı, kurulumsuz
- **Karar:** `npm run build` tek bir `dist/index.html` üretir (`vite-plugin-singlefile`, `base: './'`). Dosya e-posta/Drive ile gönderilir, çift tıkla tarayıcıda açılır; sunucu, internet, kurulum gerekmez.
- **Gerekçe:** Kullanıcı: "dosyaları yollayacağız, direkt oynasınlar; eğitim ve eğlence amaçlı". `file://` altında harici modül scriptleri engellenir; satır içi tek dosya bu sorunu çözer.
- **Kısıt:** Tüm görseller (portreler, arka planlar) ya SVG ya da base64 gömülü olacak; toplam dosya boyutu hedefi < 10 MB. Higgsfield görselleri sıkıştırılıp (WebP, ≤ 60 KB/portre) gömülür.
- **Test:** Her sürümde `dist/index.html` içinde harici `<script src>` / `<link href>` bulunmadığı otomatik denetlenir (Aşama 2'de arayüz duman testine eklenecek).

## K-011 · 2026-09-16 · Kayıt: tarayıcı depolaması + JSON dışa/içe aktarma
- **Karar:** İlerleme, kör nokta profili ve karar günlüğü `localStorage`'a yazılır (her okuma/yazma try/catch içinde; yoksa oyun yine çalışır). Ek olarak "kaydı dışa aktar / içe aktar" (JSON dosyası) düğmesi: dosya başka bilgisayara taşınabilsin, öğretmen/ekip toplu değerlendirme yapabilsin.
- **Gerekçe:** Tek dosya dağıtımında sunucu yok; `file://` altında localStorage tarayıcıya göre çalışır ama garanti değil, o yüzden dosya yedeği şart.

## K-012 · 2026-09-16 · Kılavuz baştan tamamen açık
- **Karar:** Tüm Kılavuz maddeleri ilk andan okunabilir. Vakada kullanılan/karşılaşılan maddeler "vakada karşılaştın" rozeti alır; "Senin kör noktan" bölümü verilerle dolar.
- **Gerekçe:** Eğitim amacı öncelikli; kilitli içerik öğrenmeyi geciktirir. Merak ve ilerleme hissi rozet ve kör nokta bölümüyle korunur (Ericsson 1993: geri bildirimli bilinçli pratik).

## K-013 · 2026-09-16 · Ayna: oyuncuyu okur, vakayı değil
- **Karar:** Ayna'nın tahmini yalnızca oyuncuya görünür özelliklerden (kişilik temel çizgisi, kurbanla ilişki sıcaklığı, görüşme sırası) ve kör nokta profilinden üretilir; failin kimliğine erişmez. İmza notu tahmin edilen kişinin adını yazmaz. Kadans: her 3 bitmiş vakada bir, baskın kör nokta ≥2 tekrar.
- **Gerekçe:** Tahmin faille ilişkili olsa Ayna bir "ipucu"ya dönüşür ve örüntü oluşur (AJAN_PROMPTU §4). Adı yazılmayan not oyuncuyu itmez; vaka sonunda "okundun" dersi gelir. Kadans sürprizi korur, tek seferlik hatayı "kör nokta" saymaz.
- **Alternatifler:** Her vakada Ayna (yoruculuk); tahmini açılışta açıkça yazmak (oyuncuyu yönlendirir); Ayna için özel arketip (sonraya bırakıldı).
- **Geri dönüş koşulu:** Örüntü testi (`tests/motor/ayna.test.ts`) şans düzeyini aşarsa ölçütler değiştirilir; oyuncu testlerinde not "spoiler" gibi algılanırsa notun gösterim yeri değişir.

## K-014 · 2026-09-16 · Kişi okuma araçları: gerçek vaka sonunda açılır; kişilik okuması suç dayanağı olamaz
- **Karar:** "Şu an ne düşünüyor?" tahmininin gerçeği ve oda eşyalarının gizli türü oyun sırasında gösterilmez, yalnızca vaka sonu karnelerinde açılır. Suçlamada "Oda okuması / dijital profil" dayanağı seçilip yanılınca `oda-okuma-suc` etiketi basılır.
- **Gerekçe:** Ickes paradigmasında gerçek düşünce hemen açılır; oyunda bu, cevabın gizli etiketini (yalan/koruma/sır) sızdırır ve vakayı çözer. Gosling'in bulgusu kişilik/sır okumadır; suç okuması değil — oyuncu bunu kanıt sayarsa öğrenmesi gereken ders tam olarak budur.
- **Alternatifler:** Gerçeği anında açmak (sızıntı); iç sesi hiç puanlamamak (öğrenme kaybı); kişilik okumasını gerekçe listesinden çıkarmak (tuzağı kaldırır, dersi de kaldırır).
- **Geri dönüş koşulu:** Oyuncu testlerinde karneler "geç geldi, unuttum" hissi verirse, tahmin anında yalnızca "kaydedildi" yerine kısa bir güven sorusu eklenebilir.

## K-015 · 2026-09-16 · Ayna vakası üretim ayarıyla ayrışır; kayıt bayrağı taşır
- **Karar:** Ayna vakası `VakaAyari.ayna = true` ile üretilir: sahne/manipülasyon arketiplerinin ağırlığı ×5, hedeflere sahnelenmiş delil eklenir; mekân, kişiler ve kurban aynı seed'de değişmez. Kayıt dosyası bu bayrağı taşır ve içe aktarımda aynı ayarla yeniden üretir. Not, ark özetinden (karşılaşma sayısı, son sonuç) beslenir.
- **Gerekçe:** Ayna'nın "sahne kuran manipülatör" kimliği vakanın rengine yansımalı; ama fail seçimine dokunmamalı (örüntü testi). Bayrak kayıtta taşınmazsa aynı seed farklı arketip üretir ve kayıt bozulur.
- **Alternatifler:** Ayna için ayrı mekân/arketip listesi (kalıp riski, çeşitlilik kaybı); ağırlık yerine zorunlu arketip (her Ayna vakası aynı hikâye).
- **Geri dönüş koşulu:** Ayna vakalarının %95'inden fazlası aynı arketipe düşerse çarpan düşürülür; oyuncu testlerinde "Ayna vakası hep sahte medyum" hissi oluşursa havuz genişletilir.

## K-016 · 2026-09-16 · "İkinci kez sor": cevap sabit, gözlem kayması küçük çarpanla büyür
- **Karar:** Aynı soru aynı kişiye tekrar sorulunca yalan defteri cevabı değiştirmez; davranış gözlemleri yeni akışla çekilir ve yalan kayması ×1.2 olur. Doğru cevapta kayma yoktur. Kayıtta "(tekrar)" görünür; ayrı teknik değildir, maliyeti normal soru maliyetidir.
- **Gerekçe:** Swerts 2013: ikinci yalan denemesi daha çok ipucu verdi (%53→%62); DePaulo: kasıtlı çaba ele verir. Ama planlı yalan tutarlıdır (Vrij 2010): içerik değişmez, yalnızca sızıntı artar. Büyük çarpan "tekrar sor = yalan dedektörü" kalıbı yaratırdı.
- **Alternatifler:** Tekrarı yasaklamak (öğrenme kaybı); tekrarda cevabı değiştirmek (bilişsel yük tekniğiyle karışır, gerçekçi değil).
- **Geri dönüş koşulu:** Denge botu tekrar sorarak >%45'e çıkarsa çarpan düşürülür.

## K-017 · 2026-09-16 · Zor seviye "gerçek hayat gibi" zorlaşır; saat bütçesi 12'de kalır (kullanıcı kararı)
- **Karar:** (a) Olay anında olay odasında bulunan masumlar da iz bırakır (`ZORLUK_PARAMETRELERI.olayOdasiMasumIzi`: kolay 0 / orta 0.35 / zor 0.9; zorda ikinci masum 0.6) → şüpheli kümesi büyür. (b) Gizli bilgi testinde ayrıntıyı bilen kişi her zaman tanımaz (`citTanimaOlasiligi`: 0.9 / 0.85 / 0.7) → CIT tek başına karar verdirmez. Her iki karar ayrı RNG akışından (`seed/delil-zor`, mevcut `cit` akışı) beslenir; ana akış ve regresyon seed'leri değişmedi. Saat bütçesi 12 kalır: aşım başarısızlık değil, saat başına −2 puan cezasıdır.
- **Gerekçe:** Kullanıcı (16.09.2026): "oyunun kolay olmasını istemiyorum; gerçek hayatta nasılsa öyle olsun, zorlasın ki öğretsin." Gerçek hayatta olay yerinde iz bırakan tek kişi fail değildir; CIT ayrıntının kodlanmış olmasına bağlıdır (Vrij & Verschuere 2014). Bütçe: kullanıcı "başarısızlık değilse 12 uygun" dedi.
- **Ölçüm (200 vaka/zorluk):** olay odasında birden çok izli kişi: kolay %21, orta %32→%43, zor %54→%67. Yöntem botu doğruluğu her seviyede ~%97 kalır: üretici her vakayı çözülebilirlik eleğinden geçirir, bot eleğin prosedürünü uygular; insan için zorluk şüpheli sayısı, tuzak ve gereken teknik çeşitliliği olarak artar (bot prosedürü ortalama 7–8 saat, bütçe 12).
- **Alternatifler:** (c) hiç dokunmamak (kullanıcı reddetti); bot doğruluğunu düşürmek için çözülebilirlik eleğini gevşetmek (tek çözüm garantisi bozulur; reddedildi).
- **Geri dönüş koşulu:** Oyuncu zorda "çözülemez" hissi bildirirse `olayOdasiMasumIzi`/`citTanimaOlasiligi` düşürülür; masum suçlama oranı botta >%12'ye çıkarsa (a) geri alınır. CIT tanıma oranı kaynak kütüğünde doğrulanmadı; makale bulununca sayı güncellenir.
