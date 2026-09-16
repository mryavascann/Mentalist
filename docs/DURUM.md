# DURUM

> Her ajan üzerine yazar; kısa tutulur. Son güncelleme: 2026-09-16 12:30, Ajan #1.

## Aktif aşama
**Aşama 3 — Genişleme.** Zorluk, cila, Kılavuz genişletmesi, üç tatbikat ve adaptif üretim tamam. Kılavuz 12 bölüm / 60 madde tamam; Higgsfield prompt listesi ve portre yer tutucusu hazır. Takım NPC'leri, şablon havuzu (kategori başına ≥5) ve mekâna özgü belgeler tamam. Arketip havuzu, kanepe molası, ifade çizelgesi, kalibrasyon günlüğü ve regresyon seed'leri tamam. Yedi tatbikatın hepsi tamam (Kılavuz 64 madde). Sıradaki: takım hikâyesi ve Ayna taslağı, diğer araçlar.

## Biten işler
- Aşama 0–2 tamam; Aşama 3'te: zorluk seçici + zorlaştırıcılar (11 test), cila (ifade-gerçek tablosu, temel çizgi notu, gösterilen delil işareti).
- **Kılavuz genişletmesi:** yeni bölümler Bellek ve Tanıklık (5), Dikkat ve Sihir (4), İkna ve Manipülasyon (6), Kişilik Okuma (+2); toplam 9 bölüm, 50 madde. Kaynak kütüğü 48 kayıt (Simons & Levin, Johansson, Hall, Rensink & Kuhn, Macknik, Lamont, Freedman & Fraser, Teunisse, Irwin, Naumann, Gosling 2011 eklendi; hepsi NOTLAR.md başlıklarıyla eşleşiyor).
- **Tatbikatlar** (`src/icerik/mini_oyunlar.{json,ts}`, `Tatbikat.tsx`, depo `tatbikatAc/korSecimBitir/sogukOkumaBitir/tabanOraniBitir/tatbikatKapat`): kör seçim (4 anonim profil, ifşa), soğuk okuma dedektörü (8 öğe × 8 cümle, çoklu etiket puanı: doğru +1 / yanlış −1), taban oranı (%99 test, 1/10.000). Başlık'ta düğmeler, sonuçlar kayıtla taşınır.
- **Adaptif üretim** (`src/motor/adaptif.ts`): `hedeflerdenAyar(korNoktalar)` → en fazla 2 yapısal hedef; `vakaUretHedefli(seed, hedefler, ayar)` seed türevlerini deneyip çözülebilir + hedefleri sağlayan vakayı döndürür (hedef ≥%85 sağlanır, 30 denemede). Depo `yeniVaka` bunu kullanır; `durum.hedefler` analizde açıklanır; Kılavuz'da dinamik "Senin kör noktan" bölümü. 10 + 1 test.
- **Kılavuz tamam (TASARIM §12):** 12 bölüm, 60 madde; Duygular (yüz-bağlam, refrakter/Othello, gösterim kuralları, ifade süresi), İnanç/Paranormal (anomalistik, tarikat/dogmatizm, ideomotor), Holmes (gözlem≠çıkarım, olmayan ipucu, üç pipoluk mola), Senin Kör Noktan dinamik.
- **Görsel:** `assets/HIGGSFIELD_PROMPTLAR.md` (24 portre, 4 takım, 8 mekân, ana görsel, sorgu odası; ortak stil eki, boyut/format kuralı) ve `Portre.tsx` deterministik SVG siluet (vaka açılışı ve sorgu odasında).
- **Takım NPC'leri** (`src/arayuz/oyun/takim.ts`, TASARIM §14): Komiser Sevda Oral (lider: kanıt ister), Cemal Ilgaz (sorgucu: tekniğe yönlendirir), Analist Defne Yurt (inanan: ipucunu abartır), Ajan Ozan Kaya (saha: hızlı hüküm, çoğunluk). Satır başına ~%55 olasılıkla yorum; deterministik; gizli etiket ve fail adı sızmaz. Ölçüm: saha ajanının 'şüpheli' hükmü <%45 isabetli (sosyal kanıt tuzağı). Oyuncu yorumları kapatabilir; suçlamada 'takımın çoğunluk görüşü' dayanağı seçilip yanılırsa `sosyal-kanit` etiketi.
- **Şablon ve mekân genişletme:** `dil.ts` 20 kategori × ≥5 varyant (`SABLON_KATEGORILERI`, `sablonSayisi`); `delil.ts` `MEKAN_BELGELERI` (8 mekân × 3 belge: ilaç kayıt defteri, resepsiyon defteri, kart geçiş kaydı…). 3 test.
- **"Watson'a anlat"** (`Watson.tsx`, depo `watsonBasla/watsonCevapla/watsonKapat`, `takim.ts watsonSorusu`): pano maddeleri sorgucuya adım adım anlatılır; oyuncu gözlem/çıkarım/hipotez sınıflar ve test edip etmediğini söyler; panoyla çelişen sınıflamalar ve test edilmemiş çıkarımlar raporlanır (Priory Okulu). Oturumluk; kayıtla taşınmaz. 3 test.
- **Vaka arketip havuzu** (`src/motor/arketipler.ts`, TASARIM §15): 14 arketip (miras kavgası, sahte medyum, tarikat içi ölüm, hastane dozu/kaza, zimmet, ofis sabotajı, romantik dolandırıcılık, motelde sahnelenmiş olay, karnaval el çabukluğu/kaza, kıskançlık üçgeni, sahilde kaza, çiftlikte sabotaj); mekâna uygun ağırlıklı seçim; olay türü ve yöntem arketipten, motivasyon = ilişki + tema; brifinge arketip cümlesi; analizde "bu vakanın dersi" Kılavuz bağı. `Vaka.arketip`. 5 test.
- **Oynanış cilası:** kanepe molası (`depo.kanepeMolasi`: +1 saat; takım bir yokluk/belge/dijital delil notu ya da bir dedikodu getirir; dedikodunun doğruluğu söylenmez), ifade çizelgesi (`cizelge.ts ifadeCizelgesi`: kişi × dilim, söylenenler), karar günlüğü kalibrasyon özeti (`kalibrasyonOzeti`: güven kovası vs gerçek doğruluk; Analiz'de ≥2 vakadan sonra). 4 test.
- **Kalan tatbikatlar** (`mini_oyunlar.{json,ts}`, `Tatbikat.tsx`): Linda tuzağı (5 çift, 1'i ayrık; `lindaBitir`), kaybolan top / off-beat (5 an, 3 soru; `offBeatBitir`), ince dilim (2 kişi × 3 boyut, yalan=bilinemez; `inceDilimBitir`), çift kör test tasarla (6 gerekli + 6 tuzak; `ciftKorBitir`). Kılavuz'a `birlesim-yanilgisi` ve `cift-kor-test` eklendi. 9 test.
- **Regresyon seed'leri** (`tests/regresyon/seedler.test.ts`): 6 seed anlık görüntü (mekân, arketip, fail, dilim, yöntem, delil/sır sayısı, çözülebilirlik, zorluk). Üretim bilerek değişince güncellenir ve günlüğe yazılır.
- **İpucu kataloğu:** Navarro saha ipuçları `zayif` düzeyde: yatıştırıcı dokunma (d=.12, suç sorusunda kaygıyla artar → "hangi konu" sinyali), ayakların çıkışa dönmesi (ilişkisiz), vurgu kaybı (d=.14). 19 ipucu. İçerik testi: her bölümde ≥3 madde, ≥9 bölüm, ≥45 madde.

## Sıradaki 3 iş
1. **Aşama 4 devamı:** takım arka plan hikâyesi (vakalar arası kısa diyaloglar); Ayna ark taslağı (kör nokta verisinden oyuncunun şüphesini tahmin eden düşman; imza notu).
2. **Diğer araçlar (TASARIM §7):** oda okuma (Gosling: eşya = kimlik iddiası / kalıntı / sahnelenmiş), dijital iz profili, "şu an ne düşünüyor?" (Ickes), kayıt inceleme (yavaşlat/yüz kapat; etkisi küçük).
3. **Aralıklı tekrar:** Analiz ekranındaki hata etiketinden ilgili tatbikata yönlendirme (temsil-edicilik → Linda, fark-etmedin → off-beat, tek-ipucu → ince dilim).

## Açık kararlar (kullanıcıya sorulacak)
1. Vaka başına hedef süre → soruşturma saati bütçesi (varsayılan 12).
2. Zor seviyeyi daha da sertleştirmek istenirse `ZORLUK_PARAMETRELERI` tek ayar noktası.
3. "The Mentalist" adının telif riski (K-007).
4. Higgsfield görselleri: portre havuzu için prompt listesi hazırlanabilir (brand.md §6); görsel olmadan da oyun oynanabilir.

## Bilinen hatalar
- Yok.

## Test durumu
- `npm test`: 30 dosya, 262 test geçti (2026-09-16 12:30). Süre ~90 sn.
- `npm run typecheck`: temiz. `npm run build`: tek `dist/index.html`. file:// kontrolü hata 0.

## Notlar
- Kullanıcı: sorun yoksa "devam edeyim mi" sorma, sürekli çalış (16.09.2026).
- Bash heredoc'ta uzun Python/Markdown kırılıyor; yamaları scratchpad `.py` olarak yaz ve çalıştır.
- Depo tekildir; testler `depo.sifirla()` ile izole edilir. Playwright'ta rol tabanlı seçici.
- Sahnelenmiş delil oyuncuya bayrakla gösterilmez; fizik tutarsızlığı ile bulunur.
- İpucu sadakat testi zayıf ipuçlarında gürültüye duyarlı; yeni ipucu eklerken `betimlemeYonu` ve kişilik temel çizgisini (`ipucu.ts KISILIK_TEMELI`) birlikte ekle.
