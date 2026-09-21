# DURUM

> **21.09.2026 — Ön yüz yenilendi (Ajan #5, K-020).** Açık/koyu sıcak kahve temaları, yeni dedektif masası, yan menü, vaka brifingi, gruplandırılmış sorgu araçları, kılavuz araması ve güvenli kayıt yönetimi tamam. Kullanıcı parlak beyaz ve yeşil yerine rahat Nescafe/kâğıt tonlarını istedi. 346 test / 50 dosya geçti; tip kontrolü ve build temiz. Chromium'da 320/768/1024/1440 px ve yedi ana ekran doğrulandı. Güncel görsel kararlar: brand.md §8. Öncelikli sıradaki iş: yeni arayüz için kullanıcı geri bildirimi. Eski işlerin ayrıntıları aşağıda korunmuştur.


> Her ajan üzerine yazar; kısa tutulur. Son güncelleme: 2026-09-21 13:00, Ajan #4 (oyun adı Cold Read, K-019).

## Aktif aşama
**Aşama 3 — Genişleme.** Zorluk, cila, Kılavuz genişletmesi, yedi tatbikat, adaptif üretim, takım NPC'leri, şablon havuzu, arketip havuzu, kanepe molası, ifade çizelgesi, kalibrasyon günlüğü, regresyon seed'leri, takım hikâyesi, aralıklı tekrar, **§7'nin tüm araçları** ve **Ayna arkı** tamam (Kılavuz 66 madde, 16 teknik). Yol haritasındaki Aşama 3 maddeleri ve Higgsfield görselleri bitti; kalan: kullanıcı kararları (zor seviye, bütçe) ve cila.

## Biten işler
- **Vercel yayını (21.09, K-021):** https://coldreadgame.vercel.app (proje `yavascan/coldread`, GitHub'a bağlı; **`main`'e push = canlı yayın**). `.vercelignore` `docs/`'u dışarıda tutar. Dev sunucusu `docs/kaynaklar/`'ı izlemez (EBUSY düzeltmesi).
- **Oyun adı Cold Read (21.09, K-019):** başlık, üst şerit, sayfa başlığı, paket adı, kayıt/tema anahtarları (`cold-read:*`); eski `the-mentalist:kayit` ilk yüklemede taşınır.
- **Kanepe molası sekmesi (48cf710, 0cc2d05):** `KanepeMolasi.tsx`, polaroid çerçeveli GIF, takımın son notu. MTPE ve karanlık mod `main`'de.
- **Türkçe MTPE turu (18.09, K-018):** tüm oyuncuya görünen metin doğal Türkçeye göre düzeltildi; ortak dil kararları `docs/USLUP.md`'de (ses, biçim, terim sözlüğü). Yeni metin eklerken önce oraya bak.
- **Karanlık mod (17.09, `dev`):** yalnızca görsel katman; `src/arayuz/tema.ts`, `stil.css` `:root[data-tema="karanlik"]`.
- Aşama 0–2 tamam; Aşama 3'te: zorluk seçici + zorlaştırıcılar, cila (ifade-gerçek tablosu, temel çizgi notu, gösterilen delil işareti).
- **Kılavuz:** 12 bölüm, 66 madde; her madde kaynaklı ve rozetli. Kaynak kütüğü 49 kayıt (son eklenen: Ickes 1990).
- **Tatbikatlar** (`src/icerik/mini_oyunlar.{json,ts}`, `Tatbikat.tsx`): kör seçim, soğuk okuma dedektörü, taban oranı, Linda tuzağı, kaybolan top / off-beat, ince dilim, çift kör test. Analiz'den hata etiketine göre öneri (`tatbikat_onerisi.ts`, 14 etiket → 6 tatbikat).
- **Adaptif üretim** (`src/motor/adaptif.ts`): kör noktadan en fazla 2 yapısal hedef; seed türevleriyle çözülebilir + hedefli vaka.
- **Takım NPC'leri** (`takim.ts`), **takım hikâyesi** (`takim_hikaye.ts`), **Watson'a anlat** (`Watson.tsx`), **kanepe molası**, **ifade çizelgesi**, **kalibrasyon özeti**.
- **Vaka arketip havuzu** (`arketipler.ts`): 14 arketip, mekâna bağlı ağırlık; brifing cümlesi ve "vakanın dersi".
- **Ayna** (`ayna.ts`, K-013 + K-015): her 3. vakada baskın kör nokta ≥2 ise Ayna vakası; tahmin görünür özelliklerden; imza notu; Analiz'de okundu/yanıldı. **Ark:** `ayar.ayna` ile sahne/manipülasyon arketipleri ×5 ve sahnelenmiş delil hedefi; not karşılaşma sayısına ve önceki sonuca göre değişir; geçmiş notu saklar; Analiz'de önceki notlar ve okunma oranı; kayıt bayrağı taşır. 8 + 6 test.
- **Diğer araçlar** (`src/motor/araclar.ts`, K-014, TASARIM §7 uygulama notu): oda okuma (eşya sınıflama + vaka sonu karnesi), dijital iz (profil; dışadönüklük okunur, kaygı okunmaz), "şu an ne düşünüyor?" (6 kategori, gerçek vaka sonunda; az konuşulan kişide 6 seçenek), kayıt inceleme (küçük etki; temel çizgiyle normali/sapma). Hata etiketi `oda-okuma-suc`; iç seste hep "suç kaygısı" → `yalan-yanliligi`. Sorgu odasında "Kişiyi oku" bloğu; Suçlama'da "Oda okuması / dijital profil" dayanağı. 20 test.
- **Regresyon seed'leri** (`tests/regresyon/seedler.test.ts`): 6 seed anlık görüntü; üretim bilerek değişince güncellenir ve günlüğe yazılır.
- **İpucu kataloğu:** 19 ipucu; Navarro saha ipuçları `zayif`. İçerik testi: her bölümde ≥3 madde, ≥12 bölüm, ≥60 madde.
- **Metin kalitesi 2 (21:25):** ipuçlarında `temelBetimlemeler` (temel çizgi sohbeti alışkanlık dilinde; `ipucuUret baglam`), yabancı adlarda ek okunuşa göre (`turkce.ts OKUNUS`), kişi kartında rolle uyumlu ilişki cümlesi (`iliski_notu.ts`, `Kisi.iliskiNotu`; ayrı RNG akışı, regresyon seed'leri korunur).
- **Oyuncu geri bildirimi 1 (23:45):** eş/sevgili rolleri karşı cins (`havuzlar.ts`), suçlama dayanak cümleleri tam, seçim kutuları taşmıyor (`stil.css max-width`). Kullanıcı: zorluk iyi.
- **Takım sahnesi rol tekilliği (23:15):** aynı üye art arda konuşmaz (`takim_hikaye.ts`, karşılık satırı yüzer). Kılavuz 66 madde ve Analiz metinleri gözle okundu; düzeltme gerekmedi.
- **K-017 zor seviye (22:45):** olay odasındaki masumlar da iz bırakır (şüpheli kümesi büyür), CIT'te tanımama payı; ayrı RNG akışı, regresyon korunur. Repo GitHub'da: https://github.com/mryavascann/Mentalist (özel).
- **Teknik çıktıları kalite turu (22:00):** SUE tanık ifadesine de uygulanır (koruma yalanı delille çelişir); oda eşyaları vaka içinde tekil (havuzlar 8–12, `temelEsyalar` + kaydırma); serbest anlatımda aynı odada kalınan ardışık dilimler kısa devam cümlesi (`dil.ts anlatimSatirlari`); uygulanamayan teknik zaman düşmez, şeytanın avukatı düğmesi kapalı.
- **Görseller (Higgsfield, 2026-09-16):** 122 WebP `assets/` altında (56 portre + 4 takım, 9 mekân, 18 oda, 12 Kılavuz bölümü, 7 tatbikat, 4 delil türü, 12 diğer); `src/arayuz/gorseller.ts` kütük + seed'li portre eşlemesi (cinsiyet/yaş uyumlu, faille ilişkisiz); ekranlara bağlı (başlık, vaka açılışı, sorgu, Kılavuz, tatbikat, Analiz, Pano, suçlama, Forer, Watson). `Portre.tsx` görsel yoksa siluete düşer. Kayıt: `assets/KAYIT.md`. 6 test.

## Sıradaki 3 iş
1. **Kullanıcı okuması:** MTPE turundaki terim kararlarını (USLUP §4) kullanıcı gözden geçirsin; beğenilmeyen terim yalnızca sözlükte ve `ad`/`baslik` alanında değişir.
2. **Oyuncu geri bildirimi:** kullanıcı zor seviyeyi oynayınca K-017 geri dönüş koşulu (çözülemez hissi, masum suçlama) ve genel his; ayrıca dist boyutu rahatsız ediyorsa portre 384² / oda q50.
3. **Küçük fikirler:** kanepe delil notu için "→ Pano" düğmesi; ilişki notunu sorguda sohbet sorusu olarak kullanmak; oda görsellerini ifade çizelgesinde de göstermek; Kılavuz 'kayit-inceleme' maddesinden "tekrar sor" ipucuna oyun içi bağ.
4. **Kaynak doğrulama:** CIT'te suçlu tanıma oranı (K-017b, şu an tasarım varsayımı 0.7) için kaynak; bulunursa `citTanimaOlasiligi` ve Kılavuz maddesi güncellenir.

## Açık kararlar
1. ~~Saat bütçesi~~ → 12 kalır (K-017): aşım ceza (saat başına −2 puan), başarısızlık değil.
2. ~~Zor seviye~~ → K-017 uygulandı (masum izi + CIT tanımama). Oyuncu zorda oynayınca geri dönüş koşulu kontrol edilecek.
3. ~~"The Mentalist" adının telif riski (K-007)~~ → ad Cold Read oldu (K-019). Yayın öncesi "Cold Read" için kısa marka kontrolü. Repo şu an özel.
4. ~~Higgsfield görselleri~~ → üretildi ve gömüldü (16.09.2026). dist 6 MB; küçültme gerekirse portre 384² / oda q50.

## Bilinen hatalar
- Yok.

## Test durumu
- **Son eklemeler (19:40):** "ikinci kez sor" (K-016, `TEKRAR_CARPANI`), konuşma kaydında oda küçük resmi, delil türü ikonları, Ayna 3. karşılaşma takım sahnesi (`AYNA_SAHNE_ESIGI`), oda eşyası → Pano düğmesi. 4 test.
- **20:20:** tarayıcı ekran kontrolü (Playwright Chromium kurulu) temiz; iç ses seçicisi taşması düzeltildi; rol tutarlılığı kuralları (`havuzlar.ts uygunRoller`: anne/baba, meslek yaşı, üvey çocuk/yeğen). 2 test.
- **21:00:** içerik kalitesi — Türkçe ekler (delil/takım metinleri, `turkce.ts` özel ad kuralı), gözlem tekilleştirme/sınır (`depo gozlemOzeti`), rol tekilliği + anne/baba/kardeş soyadı, cevap büyük harf. 4 test.
- **21:25 (Ajan #2):** temel çizgi betimlemeleri (3 test), yabancı ad ekleri okunuşa göre (+1), kişi kartı ilişki cümlesi (1 test).
- **22:00 (Ajan #2):** SUE tanık, oda eşyası tekilliği, anlatım devam cümlesi, uygulanamayan teknik zamanı (`kalite2.test.ts`, 4 test); iki eski test yeni kurala uyarlandı.
- **22:15:** SUE teknik/Kılavuz metinlerinde tanık kullanımı "oyunun genişletmesi" olarak etiketlendi (+1 test).
- **22:45:** K-017 zor seviye (`zorlukZor.test.ts`, 4 test).
- **23:15:** takım sahnesi rol tekilliği (`takimRol.test.ts`, 2 test).
- **23:45:** rol karşı-cins (+1), suçlama render testi (+1).
- **18.09 (Ajan #3):** MTPE turu; üç testte yalnızca görünen ad güncellendi (depo, cila3, araclarDepo).
- **21.09 (Ajan #4):** ad değişimi; eski kayıt taşıma testi (+1). Kanepe molası ekranı (+2, Ajan #3 sonrası).
- `npm test`: 49 dosya, 342 test geçti (2026-09-21 13:00). Süre ~8 sn (paralel).
- `npm run typecheck`: temiz. `npm run build`: tek `dist/index.html` (5.98 MB; 122 görsel gömülü, gzip 4.3 MB).

## Notlar
- **Doğrulanmadı:** CIT'te bilen kişinin tanıma oranı (kolay 0.9 / orta 0.85 / zor 0.7) tasarım varsayımı; kaynak kütüğünde suçlu isabet oranı yok (Vrij & Verschuere 2014 yalnızca kodlanma koşulunu vurgular).
- Git: `origin` = https://github.com/mryavascann/Mentalist (özel). Commit sonrası `git push`.
- Kullanıcı: sorun yoksa "devam edeyim mi" sorma, sürekli çalış (16.09.2026).
- Bash heredoc'ta uzun Python/Markdown kırılıyor (kaçış karakterleri de bozuluyor); yamaları Write aracıyla scratchpad `.py` olarak yaz, sonra çalıştır (`PYTHONIOENCODING=utf-8`). JSON yaması dosyayı indent=2 ile yeniden biçimler (mevcut biçimle aynı).
- Testlerde JS regex: `\b` Türkçe harfte (ş, ü) sınır değil; `/i` bayrağı İ↔i eşlemez. Sözcük bölme ve açık desen (`/İkiz|ikiz/`) kullan.
- Döküm betiğinde `depo.durum` referansını saklama: `bildir()` nesneyi yeniler; her okumada `depo.durum` üzerinden git.
- Oda eşyası havuzuna madde eklerken vaka içi tekillik kişi sırasına göre dağıtımla sağlanır; havuz ≥ kişi sayısı (8) olsun. Yeni anlatım kalıbı eklerken devam kalıpları (`dil.ts DEVAM_SABLONLARI`) yalan kategorisinde oda/eylem vermez.
- Yeni ipucu eklerken `betimlemeler` (sorgu, anlatım odaklı olabilir) ve `temelBetimlemeler` (tarafsız sohbet, alışkanlık dili; soru/cevap/hikâye sözcükleri yasak) birlikte yazılır. Yeni yabancı ad eklerken yazımı okunuşundan sapıyorsa `turkce.ts OKUNUS` tablosuna ekle.
- Higgsfield CLI global kurulu (`higgsfield --version`), giriş tarayıcıdan (`higgsfield auth login`); skill'ler proje içinde `.agents/skills/` (git dışı).
- Depo tekildir; testler `depo.sifirla()` ile izole edilir. Playwright Chromium kurulu; ekran görüntüsü için `dist/index.html`'i file:// ile aç (betik örneği günlükte 20:20 kaydı).
- Sahnelenmiş delil oyuncuya bayrakla gösterilmez; fizik tutarsızlığı ile bulunur. Sahnelenmiş oda eşyası da öyle (toz izi, kırılmamış kitap sırtı).
- İpucu sadakat testi zayıf ipuçlarında gürültüye duyarlı; yeni ipucu eklerken `betimlemeYonu` ve kişilik temel çizgisini (`ipucu.ts KISILIK_TEMELI`) birlikte ekle.
- Gizli bilgi (ifade türü, iç ses gerçeği, eşya türü) oyun sırasında metne yazılmaz; Analiz'de açılır. Yeni araç eklerken sızma testi yaz.

