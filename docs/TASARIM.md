# OYUN TASARIM BELGESİ — yaşayan belge (v1.0, tohumdan)

> Bu dosya `OYUN_TASARIM_TOHUMU.md` (16.09.2026) kopyasıdır ve bundan sonra ajanlar tarafından geliştirilir (K-003). Orijinal: `kaynaklar/OYUN_TASARIM_TOHUMU_v1_orijinal.md`. Değişiklik gerekçeleri `KARARLAR.md`ye yazılır.

> Hazırlayan: Yönetici ajan · 16.09.2026
> Bu dosya BAĞLAYICI DEĞİL, bir başlangıç noktasıdır. İlk kurulumda `docs/TASARIM.md` olarak kopyalanır; sonraki ajanlar geliştirir, değiştirir, gerekçesini `docs/KARARLAR.md`'ye yazar.
> Kaynak kısaltmaları `docs/kaynaklar/NOTLAR.md` başlıklarıyla eşleşir (ör. "DePaulo 2003", "Vrij 2010 PSPI").

---

## 1. Oyunun özü (tek paragraf)

Oyuncu, sahne medyumluğundan dedektifliğe geçmiş bir "okuyucu"dur. Her vakada 5–8 kişi vardır; bazıları yalan söyler, bazıları birini korur, bazıları dürüst ama yanılır, bazıları oyuncuyu manipüle etmeye çalışır. Oyuncu gerçek bilimsel tekniklerle (temel çizgi, stratejik delil kullanımı, bilişsel yük, gizli bilgi testi, soğuk okumayı çözme...) doğruya ulaşmaya çalışır. **Dizideki kahraman her seferinde haklıdır; bizim oyunda sık sık yanılırsın ve her yanılgı sana neyi çalışman gerektiğini söyler.** Ana duygu: "Beni kandırdı ama NASIL kandırdığını şimdi anladım."

Çalışma adı önerileri: **SOĞUK OKUMA**, TEMEL ÇİZGİ, SIZINTI, KANEPE. (Karar ekibin.)

---

## 2. Diziden alınacaklar / düzeltilecekler

**Korunacak ruh:**
- Kahraman = Sherlock Holmes + sokak medyumu karışımı; eski sahte medyum, becerilerini artık dürüst amaçla kullanıyor.
- Hafiflik ve zarafet bir maske/tercih; altında suçluluk ve takıntı var.
- Kanepede uzanıp düşünmek, çay, gösteriş merakı, polis prosedürünü esnetmek, çocuklarla iyi anlaşmak, otoriteyle ters düşmek.
- Bölüm sonu "oyun salonu itirafı": küçük bir numara/tuzakla failin kendini ele vermesi.
- Takım dinamiği: kurallara bağlı şüpheci lider, duygusuz görünen sorgucu, doğaüstüne inanan genç analist, saf ve iştahlı saha ajanı.
- Kahramanı "okuyabilen" bir baş düşman; kahramanın şüpheli listesini önceden tahmin etmesi; takımın içine sızmış köstebek; taklitçiler.
- Tarikat (dizideki kült yapısı), sahte medyumlar, zengin aile sırları, karnaval dünyası.

**Düzeltilecek (bilim):**
- Dizide okuma her seferinde tutar. Gerçekte okuma olasılıksaldır; profesyonel mentalistler de sık yanılır. → Oyunda yanılmak normal, **yanılgı ders olur**.
- "Gömlek manşetinden katili bulmak" senaryo yazarlığıdır, tümdengelim değil. → Oyunda davranış = **sorulacak konu sinyali (hotspot)**, kanıt değil. Kesinlik delille gelir.
- Mikroifade = yalan, göz sağ-yukarı = uyduruyor, göze bakamayan = yalancı → **Mitler Müzesi**'ne (Barrett 2019, Wiseman 2012, DePaulo 2003).
- Hipnozla hatırlatma → oyunda **güvenilmez anı** üretir (Lynn 2015, French 2024).

**Telif/marka notu:** Dizi adı, karakter adları (Jane, Lisbon, Red John, CBI, Visualize) oyunda kullanılmamalı; ruhu alınır, isimler özgün olur. Yayın planı varsa bu önemli.

**Ekibin eski sunumu (The Mentalist Project) için düzeltmeler:** "Göz kaçırıyor/duraksıyor/elini sürtüyor → YALAN" ve "1.7 sn gecikme" meta-analizlerle uyuşmuyor (DePaulo 2003: göz teması d=.01, duraksama ~.00, gecikme genelde .02; sadece plansız/motivasyonlu yalanda artar). "Baseline sapması" fikri doğru ve korunur.

---

## 3. Çekirdek oyun döngüsü

1. **Vaka açılır** → kısa brifing, olay yeri, kişi listesi (bazı alanlar "bilinmiyor").
2. **Keşif** → olay yeri / odalar / dijital iz / kayıtlar. Zaman bütçesi sınırlı (soruşturma saati).
3. **Görüşmeler** → önce sohbet (temel çizgi), sonra soru kartları/teknikler. Her soru tanığı etkileyebilir (yönlendirici soru anıyı kirletir, suçlayıcı ton masumu da gerer).
4. **Pano** → gözlem / çıkarım / hipotez ayrımı; karşıt hipotez; "beklenen ama olmayan".
5. **Kanepe molası** → zaman ilerler, takım yeni bilgi getirir, pano yeniden düzenlenir.
6. **Tuzak / yüzleşme** → oyuncu bir tuzak kurar (gizli bilgi testi, sahte bilgi yemi, şaşkınlık testi). Oyun tuzağın geçerliliğini denetler.
7. **Suçlama + güven beyanı** → "%kaç eminsin?" + "Savcıya savun" kontrol listesi.
8. **Vaka Sonu Analizi** → nerede, neden yanıldın; hangi Kılavuz konusunu çalışmalısın; kör nokta profili güncellenir.
9. Sonraki vaka, zayıflıklarına göre (gizlice) ayarlanır.

---

## 4. Vaka üretici: "Önce gerçek, sonra ifadeler"

Rastgele ama gerçekçi, kalıpsız vaka için önerilen katmanlı yapı (seed ile tekrar üretilebilir):

1. **Olay çekirdeği:** ne oldu (cinayet, kaza, dolandırıcılık, kayıp, sabotaj, doğal ölümün cinayet sanılması...). Bazen suç yoktur.
2. **Kişi havuzu:** 5–8 kişi; ilişki grafiği (aile, iş, aşk, rekabet) + **borç grafiği** (kim kime iyilik borçlu → sadakat, Cialdini karşılıklılık).
3. **Gerçek zaman çizelgesi:** kim, nerede, ne zaman, ne yaptı.
4. **Algı modeli:** kim neyi gördü, neyi kaçırdı (dikkatsizlik körlüğü, off-beat anları, dikkat dağıtma). Görmediğini "görmüş gibi" hatırlayabilir.
5. **Bilgi dağılımı:** kim neyi, NASIL biliyor (gördü / duydu / dedikodu / medya / başka tanıkla konuştu). Bu, gizli bilgi testinin geçerliliğini belirler.
6. **Sırlar ve motivasyonlar:** suçla ilgili olan ve OLMAYAN sırlar (ilişki, borç, iş kaybı, utanç verici bir alışkanlık) → masum ama bir şey saklayan kişiler.
7. **Konuşma stratejisi:** her kişi her soruda doğru / yalan / gizleme / kaçamak / saptırma arasında karar verir; söylediği yalanları bir "yalan defteri"nde tutar ve tutarlı kalmaya çalışır. Prova edilmiş ortak alibi sadece beklenen sorularda tutarlıdır.
8. **Delil üretimi:** fiziksel, dijital, oda eşyaları, belgeler, **olmayan ipucu** (köpek havlamadı, kapı zorlanmadı).
9. **Kırmızı ringa:** gerçek psikolojik olgulardan (gergin masum, sahte anı, bellek uyumu, çoğulcu cehalet, konfabulasyon).
10. **Çözülebilirlik denetçisi:** vaka, eldeki bilgiyle mantıksal olarak çözülebilir mi? Tek çözüm mü? Zorluk puanı kaç?
11. **Örüntü denetçisi:** binlerce vaka üret, failin "en gergin", "ilk görüşülen", "en sempatik", "alibisi olmayan", "en az konuşan" gibi özelliklerle istatistiksel ilişkisi var mı kontrol et. İlişki varsa oyuncu kalıbı öğrenir → üretici düzeltilir.

**Kalıp kırıcı ilkeler:** Fail bazen en sempatik kişi, bazen en şüpheli görünen (yani oyuncunun "çok bariz, o olamaz" meta-tahmini de cezalandırılır). Bazen kimse kritik konuda yalan söylemez. Bazen iki ayrı suç iç içe. Bazen itiraf eden masumdur.

**Hibrit öneri (karar ekibin):** Gerçeklik motoru deterministik ve test edilebilir olur. Diyaloglar önce şablonla üretilir; istenirse sonradan bir LLM katmanı sadece **üslubu** zenginleştirir, gerçeği değiştiremez (motor, LLM çıktısını doğruluk grafiğine karşı doğrular).

---

## 5. Karakter modeli (parametre fikirleri)

- **Duygu profili (Ekman'ın 8 boyutu):** tetiklenme hızı, şiddet, süre, toparlanma, sıklık, kontrol, sinyal netliği, tetikleyiciler.
- **Temel çizgi davranışları:** doğal tikleri (ör. zaten sürekli "açıkçası" der, zaten az göz teması kurar — kültür, içe dönüklük, sosyal kaygı).
- **Yalan becerisi (Vrij 2010'un 6 özelliği):** doğal güven veren tavır, prova/bilişsel rahatlık, düşük duygu, oyunculuk, çekicilik, "iyi psikolog" olma.
- **Saflık (Teunisse):** ikna edilebilir / boyun eğen / şüphesiz.
- **Telkine yatkınlık** (Lynn 2015) → yönlendirici sorulara ve sahte anıya açıklık.
- **Kişisel tetikleyiciler:** bazı konulara orantısız tepki (yalan değil, geçmiş yarası) → Othello tuzağı.
- **Manipülasyon repertuvarı:** karşılıklılık, kapıyı yüze çarpma, ayak kapıda, "sadece sana söylüyorum", sahte otorite, iltifat, kıtlık/aciliyet, pacing & leading.
- **Görüşme tarzına tepki:** rapor kurulunca açılır; baskıda kapanır ya da reaktans gösterir; aşırı aynalamada şüphelenir.
- **Yargılanabilirlik (Funder):** tutarlı dürüst karakter kolay okunur; yüksek öz-izleyen manipülatör zor okunur.

---

## 6. İfade türleri (her cümlenin gizli etiketi)

| Tür | Örnek | Kaynak |
|---|---|---|
| Doğru | — | — |
| Uydurma yalan | Hiç olmamış olay | DePaulo 2003 |
| Gömülü yalan | Gerçek bir akşamı anlatır, sadece günü değiştirir | Vrij 2010, DePaulo 2003 |
| Gizleme | Soruyu doğru cevaplar, kritik bilgiyi söylemez | Ekman 1996 |
| Kaçamak / teknik doğru | "Ona hiç kızmadım" (ama tehdit etti) | DePaulo & Bell (DePaulo ek) |
| Koruma yalanı | Anne oğlunu, çalışan patronunu korur | Cialdini (borç), Navarro (anne) |
| Alakasız sır | Olay saatinde sevgilisindeydi, bu yüzden gergin | Navarro (bekçi) |
| Konfabulasyon | Kararının nedenini dürüstçe ama yanlış açıklar | Nisbett & Wilson 1977 |
| Sahte anı | "Hipnozda hatırladım", "haberde görmüştüm" | Loftus, French 2024 |
| Bellek uyumu | Tanıklar konuşmuş, anlatılar senkronize | French 2024, Cialdini |
| Dikkat boşluğu | "Kimse yoktu" = dikkat çeken kimse yoktu | Simons & Chabris, Konnikova |
| Anlatım abartısı | Her anlatışta olay biraz daha olağanüstü | Derren Brown |
| Prova edilmiş grup alibisi | Beklenmedik soruda çelişir | Vrij 2010 |
| Sahte itiraf | Baskı altında ya da birini korumak için | Navarro 8, Kassin (notlarda) |
| İnanan medyum | Gerçekten inanıyor (dolandırıcı değil) | Wiseman, Derren Brown |

---

## 7. Oyuncunun araçları (soru türleri ve teknikler)

Her araç bir **Kılavuz sayfasına** bağlanır ve motor, etkisini kaynaktaki bulguya yakın simüle eder.

- **Sohbet / temel çizgi:** tarafsız konularla kişinin normalini öğren. Uyarı: küçük sohbet temel çizgisi ≠ suç sorusu temel çizgisi; "karşılaştırılabilir doğru" ara (Vrij 2010).
- **Açık uçlu serbest anlatım** → çok bilgi, az kirlilik.
- **Yönlendirici soru** → hızlı ama tanığın anısını değiştirir (Loftus fiil etkisi: "çarptı" vs "değdi"). Motor bir **kontaminasyon kaydı** tutar: "Bu ayrıntıyı ilk kim söyledi?"
- **SUE (stratejik delil kullanımı):** önce serbest anlatım → delili açmadan ilgili soru → sonra delili açıp çelişkiyi sor. Erken delil göstermek hata (Vrij 2010: %56 → %85).
- **Bilişsel yük:** ters sırayla anlat, göz teması sürdürerek anlat, eş zamanlı görev.
- **Beklenmedik soru:** mekânsal ("en yakın masa neredeydi?"), zamansal ("kim önce çıktı?"), **çizim iste**.
- **Aynı soruyu farklı formatta sor** (yaş → doğum tarihi).
- **Şeytanın avukatı:** görüşünün karşısını savunmasını iste.
- **Zorunlu iki seçenek** ("hatırlamıyorum" diyene): şans altı skor = kasıtlı kaçınma (Symptom Validity Test, Vrij & Verschuere 2014).
- **Gizli bilgi testi (CIT/GKT):** sadece failin bilebileceği detayı seçenekler arasında sun. Detay basına sızdıysa test geçersiz.
- **Şaşkınlık testi:** bilmemesi gereken bilgiye şaşırmıyorsa zaten biliyordu (Ekman).
- **Sahte bilgi yemi (psychic baiting):** var olmayan bir kişiyi/olayı sor; "doğrularsa" uyduruyordur (Rowland, Derren Brown). Masuma yanlış bilgi yerleştirme riski var.
- **"Atladığın bir şey var mı?"**, **"Hiç kimse mi, yoksa dikkat çeken kimse mi?"** (dil nüansı takibi).
- **Kişiye göre yaklaşım (Konnikova):** kumarbaza bahis teklif et, dedikoducuyu ilgisizce dinle, kibirliye meydan oku.
- **Ton seçimi:** bilgi toplama vs suçlayıcı. Suçlayıcı ton masumu da gerer (Othello), yalancıya "bana inanmıyorsunuz, konuşmam" kaçışı verir.
- **İyi polis / kötü polis, ayak kapıda:** işe yarar ama sahte itiraf riskini artırır.
- **Cam arkası izleme:** sorguyu takım arkadaşı yapar, oyuncu üçüncü göz olarak izler (üçüncü göz daha iyi ayırt eder — Bond & DePaulo 2006).
- **Kayıt inceleme:** yavaşlat, yüzün bir kısmını kapat, aynı kişinin doğru bilinen ifadesiyle kıyasla (etkisi küçük olduğu dürüstçe gösterilir — Swerts 2013).
- **Oda okuma (Gosling 2002):** her eşya kimlik iddiası mı, davranış kalıntısı mı, sahnelenmiş mi?
- **Dijital iz (Kosinski 2013, Gosling 2011):** sosyal medya profilinden dışadönüklük okunur, kaygı okunamaz; tahmin bireyde yanılabilir.
- **"Şu an ne düşünüyor?" (Ickes):** oyuncu karakterin iç sesini tahmin eder, sonra gerçek iç ses açılır ve benzerlik puanlanır.
- **Soğuk okuma dedektörü:** bir medyum/manipülatör kaydındaki cümleleri etiketle (Barnum, gökkuşağı hilesi, olta, çatal, belirsiz gelecek, gizli soru...). Rowland'ın 5 bloklama kuralı oyuncu aracı olur: sakin kal, sorunun soru olduğunu fark ettir, soruya cevap verme, geri bildirim verme, yapıyı açığa çıkar.

**Uygulama notu (2026-09-16, `src/motor/araclar.ts`):** Oda okuma, dijital iz, iç ses ve kayıt inceleme "Kişiyi oku" bloğunda; hepsi kişilik ve sır okur, suç okumaz. Oda eşyaları oyuncu tarafından iddia/kalıntı/sahnelenmiş diye sınıflanır, gerçek tür ve ima vaka sonu karnesinde açılır; sahnelenmiş oda öz-izlemeye bağlıdır, faille ilişkisizdir. İç ses tahmini vaka sonunda puanlanır (K-014); az konuşulan kişide seçenek altıya çıkar. Kayıt incelemenin etkisi bilerek küçüktür; asıl değeri temel çizgiyle kıyastır. Kişilik okumasını suç dayanağı yapıp yanılmak `oda-okuma-suc` etiketi verir. **İkinci kez sor** (K-016): aynı soru tekrar sorulunca cevap aynı kalır, gözlemler yeniden çekilir ve yalan kayması ×1.2 (Swerts 2013); kayıtta "(tekrar)".

---

## 8. Davranış ipuçları sistemi

- Görseller nötr kalır; davranışlar **metinle** betimlenir ("sesi alçaldı", "bardağı kenara itti", "cevaptan önce uzun sessizlik").
- Her ipucu bir **katalog** kaydıdır: ad, betimleme, kaynak, etki büyüklüğü (d), yön, hangi koşulda güçlenir (motivasyon, ihlal yalanı, plansız yalan), **kanıt düzeyi** (Güçlü / Orta / Zayıf / Mit).
- Örnek ağırlıklar (DePaulo 2003): sözel-vokal yakınlık −.55, detay −.30, göz bebeği +.39, ses perdesi +.21 (kimlik motivasyonunda +.67), tutarsızlık/ambivalans +.34, kendiliğinden düzeltme −.29, "hatırlamıyorum" demek −.42; göz teması .01, duraksama ~.00. İhlal yalanlarında gerginlik +.51, göz kırpma +.38, ayak hareketi −.24 (donma).
- Motor ipucunu olasılıkla üretir; **masumlar da ipucu üretir** (gerginlik, kişisel tetikleyici, alakasız sır).
- Oyuncu bir ipucunu işaretlediğinde bu "kanıt" değil **hotspot** olur: "Bu konuyu kurcala."
- Navarro'nun saha iddiaları (ayak en dürüst, limbik beyin yalan söylemez) Kılavuz'da "saha deneyimi, bilimsel desteği sınırlı" etiketiyle yer alır; işe yarayan kısmı (temel çizgi, kümeler, değişim, **hangi soruda** gerildi) mekaniğin çekirdeğidir → **stres ısı haritası**: hangi konu kimi geriyor?

---

## 9. Pano ve akıl yürütme araçları

- **İki sütun:** Gözlem (ham) | Çıkarım (yorum). Oyuncu bir çıkarımı gözlem sütununa koyarsa işaretlenir (Konnikova, Priory Okulu).
- **Hipotez limiti:** aynı anda 4–7 aktif hipotez (çalışma belleği, Baddeley 1994). Fazlası için not defteri.
- **Karşıt hipotez yaz** butonu (çapalama kırıcı, Strack & Mussweiler).
- **"Beklenen ama olmayan"** listesi (köpek havlamadı).
- **Açık sorular panosu** (Zeigarnik motivasyonu).
- **Zaman çizelgesi** + herkesin dikkatinin başka yerde olduğu "off-beat" anları.
- **Zihin sarayı** görünümü: ipuçları bir evin odalarına yerleşir (basit görsel, güçlü içerik).
- **"Watson'a anlat" / sesli anlatım:** oyuncu vakayı takım arkadaşına adım adım anlatır, oyun her adımda "gözlem mi çıkarım mı, test ettin mi?" sorar. Takım arkadaşı bilerek basit sorular sorar (öğreterek öğrenme).
- **Güven barı vs doğruluk:** topladıkça artan "eminlik" hissinin doğrulukla ilişkisinin zayıf olduğunu gösteren kalibrasyon grafiği (güven–doğruluk r≈.04).

---

## 10. Final: Tuzak tasarımcısı

Dizideki "son sahne numarası" oyunlaştırılır ama **bilimsel denetimle**:
- Oyuncu tuzak türünü seçer (gizli bilgi testi, sahte bilgi yemi, zarf numarası, şaşkınlık testi, herkesi bir odada toplama).
- Oyun sorar: "Masum biri de bu tepkiyi verir miydi? Bu detay sızmış mıydı? Kişi bu bilgiyi senden mi öğrendi?"
- Geçersiz tuzak yanlış kişiyi ele verebilir; geçerli tuzak "aha!" anı yaratır (Rensink & Kuhn 2015: yöntemi keşfetmek güçlü motivasyon).

---

## 11. Geri bildirim: Vaka Sonu Analizi + Kör Nokta

- **4 katmanlı hata raporu (Funder RAM):** (1) ipucu ilgisizdi, (2) ipucu önünde değildi (sormadın/gitmedin), (3) ipucunu fark etmedin, (4) yanlış yorumladın.
- **Yanlılık etiketi:** Othello hatası, hale etkisi, çapalama, doğrulama yanlılığı, sosyal kanıt (takım çoğunluğuna uyma), doğruluk yanlılığı, yalan yanlılığı, tek ipucu, temsil, sorgulama heuristiği (iz bulamayınca daha çok inanma), tutarlılık heuristiği (tutarlı = doğru), beklenti ihlali (tuhaf = yalancı), aşırı özgüven, "iç masalcı" (tutarsızlığı test etmeden açıklamayla kapatma).
- **Zaman çizgisi tekrarı:** "Şu soruda şu cevabı yalan sandın; gerçekte X'i koruyordu."
- **Çalışma önerisi:** ilgili Kılavuz sayfası + 2 dakikalık mini tatbikat.
- **Kör nokta profili:** tekrarlayan hata türleri kaydedilir; Kılavuz'da "Senin kör noktan" bölümü açılır; sonraki vakalar (fark ettirmeden) o zayıflığı çalıştıracak şekilde üretilir (bilinçli pratik, Ericsson 1993).
- **Dil:** gelişim zihniyeti; "başarısız oldun" değil "şunu öğrendin".
- **Karar günlüğü:** oyuncunun kararları kaydedilir, vakalar arası örüntü gösterilir.

---

## 12. Kılavuz sekmesi (ayrı sekme)

Kitap/dosya görünümlü, oyuncunun istediği an açabileceği rehber. Her madde: kısa açıklama → nasıl kullanılır → sınırları → kaynak → **kanıt düzeyi rozeti** → "vakada dene" bağlantısı. Maddeler karşılaşıldıkça açılabilir (ama hepsi baştan okunabilir de; karar ekibin).

Bölüm önerisi:
1. Yalan Tespitinin Bilimi (doğruluk %54, doğruluk yanlılığı, zayıf ipuçları, neden yakalayamıyoruz)
2. Sorgulama Teknikleri (SUE, bilişsel yük, beklenmedik soru, CIT, SVT, şeytanın avukatı)
3. Beden Dili ve Temel Çizgi (Navarro'nun işe yarayanları + uyarılar)
4. Duygular (Ekman + Barrett eleştirisi, Othello hatası, gösterim kuralları)
5. Bellek ve Tanıklık (Loftus, sahte anı, bellek uyumu, konfabulasyon, yeniden konsolidasyon)
6. Dikkat ve Sihir (yanlış yönlendirme, dikkatsizlik/değişim körlüğü, zorlama, seçim körlüğü)
7. İkna ve Manipülasyon (Cialdini'nin ilkeleri, dolandırıcılığın 7 prensibi, saflık)
8. Soğuk ve Sıcak Okuma (Hyman'ın 13 kuralı, Rowland'ın öğeleri ve bloklama, Forer/Barnum)
9. Bilişsel Yanlılıklar (Tversky & Kahneman, çerçeveleme, taban oranı, aşırı özgüven)
10. Kişilik Okuma (Funder RAM, oda ipuçları, ince dilimler, dijital iz)
11. İnanç, Paranormal ve Tarikatlar (French, Festinger, Irwin, telkin, uyku felci)
12. Holmes Gibi Düşünmek (Konnikova: gözlem/çıkarım, zihin çatı katı, kontrol listesi)
13. **Mitler Müzesi** (NLP göz hareketleri, mikroifade = yalan, göze bakamayan yalancıdır, Reid ipuçları, ses stres analizi, "vücut dili %93")
14. **Senin Kör Noktan** (kişisel)

---

## 13. Mini oyunlar / tatbikatlar

- **Açılış tutorial'ı — Forer testi:** oyuncu kısa bir "kişilik testi" doldurur, kendine özel analiz alır, puanlar; sonra herkesin aynı metni aldığı gösterilir. Güçlü ilk ders.
- **Soğuk okuma dedektörü:** medyum kaydında teknik etiketleme (çoklu etiket puanı).
- **Kör seçim (Beyerstein):** anonim profillerden kendini bul.
- **Taban oranı bulmacası:** "%99 doğru test pozitif çıktı" → gerçek olasılık?
- **Linda tuzağı:** ayrıntılı profil daha mı olası?
- **Kaybolan top / off-beat:** dikkat nereye kaydı?
- **İnce dilim:** 30 saniyelik betimlemeden kişilik tahmini (kişilikte iyi, yalanda değil).
- **Çift kör test tasarla:** "şifacı"yı test edecek protokol kur.
Tatbikatlar kısa (2–5 dk), anında geri bildirimli, aralıklı tekrar mantığıyla önerilir.

**Uygulama durumu (16.09.2026):** yedi tatbikatın hepsi `src/icerik/mini_oyunlar.{json,ts}` + `Tatbikat.tsx`'te. Linda tuzağında 4 birleşim çiftine 1 ayrık ('ya da') çift eklendi ki oyuncu 'hep kısa olanı seç' kalıbı yerine 'koşulları say' kuralını öğrensin. Off-beat tatbikatı üç soruludur: yöntemin anı (gevşeme), 'gözümü ayırmadım' ifadesinin anlamı (bakmak ≠ görmek), kaybolan top (tanık tahmini 'gördü'). İnce dilimde yalan sorusunun tek doğrusu 'bilinemez'dir; evet/hayır 'aşırı genelleme' sayılır. Çift kör testte gerekli madde +1, tuzak −1. İki yeni Kılavuz maddesi: `birlesim-yanilgisi`, `cift-kor-test`. Aralıklı tekrar: Analiz'de hata etiketine uyan tatbikat önerilir (`tatbikat_onerisi.ts`; 13 etiket → 6 tatbikat), bitince Analiz'e dönülür.

---

## 14. Takım ve ana düşman

**Takım (özgün isimlerle, dizideki rollerin analoğu):**
- **Lider:** kurallara bağlı, şüpheci; oyuncunun kanıtsız okumalarına itiraz eder → hesap verebilirlik.
- **Sorgucu:** duygusuz görünen, kısa cümleli; cam arkası modunda soruları o sorar.
- **İnanan analist:** medyumlara/burçlara açık; "Watson" rolü, oyuncuya basit/yanlış sorular sorar.
- **Saha ajanı:** iştahlı, iyi kalpli, hızlı hüküm veren; takımın çoğunluk görüşünü seslendirir → sosyal kanıt tuzağı.

**Ana düşman arkı fikri — "Ayna":** oyuncunun kör nokta profilini "okuyan" bir manipülatör. Ark vakaları oyuncunun en çok düştüğü yanlılıkları hedefleyerek üretilir; bıraktığı imza, oyuncunun geçmiş vakalarda yaptığı bir hatayı alıntılayan kısa bir nottur. Dizideki "düşmanın şüpheli listesini önceden bilmesi" anının karşılığı: Ayna, oyuncunun kime şüpheleneceğini oyuncunun kendi verisinden tahmin eder. (Çekirdek oyun bitmeden yapılmamalı; sonraki aşama.)

**Uygulama durumu (16.09.2026):**
- *Takım hikâyesi* (`src/arayuz/oyun/takim_hikaye.ts`): her vaka sonunda Analiz'de "Ofis · sonra" sahnesi. Tepki (doğruysa övgü; yanlışsa ilk hata etiketiyle ilgili üye konuşur: sosyal kanıt → saha, Othello → sorgucu, hale → lider, doğruluk yanlılığı → inanan), arka plan bölümü (üye = (n−1) mod 4, bölüm = ⌊(n−1)/4⌋; üye başına 5 bölüm, her biri bir Kılavuz maddesine bağlı), karşılık, kapanış. Yalnızca geçmiş kayıtlardan üretilir; vaka verisi kullanılmaz.
- *Ayna taslağı* (`src/motor/ayna.ts`, K-013): her 3. bitmiş vakada, kör nokta profilinin baskın etiketi ≥2 tekrarlamışsa Ayna vakası. Tahmin yalnızca görünür özelliklerden: Othello/tek ipucu → en kaygılı; hale → en az dışadönük; temsil edicilik → kurbana en soğuk; çapalama/doğrulama → ilk kişi; doğruluk yanlılığı → "suç yok"; sosyal kanıt → kaygı + düşük öz-izleme. Olay yerinde imza notu (kahraman adı + geçmiş hata iması; kişi adı yok). Analiz'de "Ayna seni okudu / yanıldı" + gerekçe + kör nokta bağı; geçmiş kaydına `ayna.okundu`. Örüntü testi: tahmin faille şans düzeyinde.
- *Ayna arkı* (K-015): Ayna vakası `ayar.ayna` ile üretilir → sahne/manipülasyon arketipleri (motelde sahnelenmiş olay, sahte medyum, karnaval el çabukluğu, romantik dolandırıcılık, ofis sabotajı, tarikat içi ölüm, hastanede yanlış doz) ×5 ağırlık; hedeflere sahnelenmiş delil eklenir; mekân/kişiler değişmez. Not, karşılaşma sayısına ve önceki sonuca göre değişir ("geçen sefer okudum" / "şaşırttın"). Geçmiş kaydı notu saklar; Analiz'de önceki notlar ve "Ayna n karşılaşmada seni k kez okudu" satırı. Kayıt bayrağı taşır. 3. karşılaşmadan itibaren takım sahnesi Ayna'yı açıkça konuşur (okundu: "kalıbı kır"; kırdı: "kayıtlara erişimi mi var?").

---

## 15. Vaka arketipi havuzu (üretici bunları karıştırır, kalıp oluşturmaz)

Sahte medyum dolandırıcılığı · tarikat içi ölüm (kehanet başarısızlığı sonrası artan inanç) · miras kavgası · hastanede yanlış doz ("emir aldım", otoriteye itaat) · yaşlıları hedefleyen telefon dolandırıcılığı · kayıp yakınının TV çağrısı (yalvaran yakın bazen fail) · sahnelenmiş suç (şarap kadehi tortusu gibi tek fiziksel tutarsızlık) · dışlanmış masum şüpheli ve tünel görüşü (Edalji şablonu) · "fazla açık" delil (Norwood şablonu) · tanıkların hiçbir şey yapmadığı olay (çoğulcu cehalet) · taklitçi suç · "hipnozda hatırladım" tanığı · uyku felci yaşayan samimi tanık · iş yerinde zimmet ve görmek istemeyen patron (devekuşu etkisi) · romantik dolandırıcılık ve bunu saklayan utanmış kurban · karnaval/sahne dünyasında el çabukluğuyla delil karartma · "kuantum şifacı" · sahte uzman/otorite · kıskançlık üçgeni · rakip iki grubun ortak tehditte birleşmesi.

**İçerik tonu:** 13+ / 16+ düzeyinde; kan ve vahşet betimlemesi gereksiz, gerilim psikolojiden gelir.

---

## 16. Puanlama fikirleri

Doğru faili bulmak tek ölçüt değil: yanlış suçlama cezası, alınan sahte itiraf, kirletilen tanık sayısı, kalibrasyon puanı (beyan edilen güven vs gerçek), delil kalitesi, "koruyanı" doğru anlamak, manipülasyona düşmemek, zaman verimliliği. **Denge hedefi:** sadece beden diline bakan oyuncu şansa yakın kalmalı; yöntem kullanan oyuncu belirgin şekilde daha başarılı olmalı (bu, test botlarıyla ölçülür).

---

## 17. Görsel strateji ve Higgsfield görevleri

**Kodla yapılacaklar (kredi yok):** dosya/dosya kartı estetiği, mantar pano + ip çizgileri (CSS/SVG), daktilo tipografi, delil ikonları (SVG), zaman çizelgesi, grafikler.

**Higgsfield ile (az sayıda, tekrar kullanılabilir):**
1. **Portre havuzu:** ~20–24 adet, **nötr ifadeli**, aynı stil, yaş/tarz çeşitliliği. Rastgele vakalarda isim ve rol değişir, portre tekrar kullanılır. Nötr ifade bilinçli: yüz ifadesi güvenilir ipucu değil, bilgi metinde.
2. **Takım portreleri:** 4–5 adet.
3. **Mekân arka planları:** 6–8 adet (malikane salonu, ofis, sahil evi, tarikat çiftliği, hastane koridoru, sorgu odası, karnaval, motel).
4. **Ana görsel:** 1 adet.
5. (Opsiyonel, en sona) kısa tanıtım videosu.
Her üretim `assets/KAYIT.md`'ye yazılır: tarih, amaç, kullanılan prompt, dosya adı, tahmini kredi.

---

## 18. Kapsam önerisi

- **Aşama 0 — Kurulum:** repo, docs, test altyapısı, brand.md, içerik şemaları.
- **Aşama 1 — Motor (UI yok):** tipler, seedli rastgelelik, doğruluk grafiği, NPC karar mantığı, ipucu kataloğu, çözülebilirlik ve örüntü denetçisi, denge botları. Tamamı testli.
- **Aşama 2 — Dikey dilim:** 1 vaka tipi, 5 kişi, sorgu odası + pano + suçlama + vaka sonu analizi + Kılavuz'un 3 bölümü + Forer tutorial'ı.
- **Aşama 3 — Genişleme:** diğer araçlar, arketipler, kör nokta ve adaptif üretim, mini oyunlar, Higgsfield görselleri.
- **Aşama 4 — Ark:** takım hikâyesi, Ayna.

---

## 19. Açık karar noktaları (DURUM.md'de takip edilir)

Kullanıcı 16.09.2026'da karara bağladı (ayrıntılar KARARLAR.md K-007…K-012):
1. **Oyun adı:** Cold Read (K-019; önceki ad The Mentalist, K-007). **Kahraman adı:** oyuncu girer.
2. **Mekân:** her vakada farklı olabilir; sabit şehir yok (K-008).
3. **Runtime LLM:** yok. Diyaloglar seedli şablon-gramer motoruyla üretilir (K-009).
4. **Platform:** tek HTML dosyası, çevrimdışı, kurulumsuz; dosya gönderilir, çift tıkla açılır (K-010).
5. **Kılavuz:** baştan tamamen açık; karşılaşılan maddeler rozet alır (K-012).
6. **Kayıt:** tarayıcı depolaması + JSON dışa/içe aktarma (K-011).

Yeni açık sorular (henüz karar yok):
- Vaka başına hedef oyun süresi (öneri: 20–40 dk).
- Oyuncu sayısı: tek oyuncu (varsayım). "Cam arkası" modu için ikinci oyuncu (sorgucu) düşünülebilir mi?

## 20. Ön yüz uygulama notu (21.09.2026)

K-020 ile görsel dil ve navigasyon yeniden tasarlandı; ayrıntılar `brand.md` §8. Açık ve koyu temalar kullanıcının tercihiyle sıcak kahve tonlarında. Sorgu araçları dört gruptan açılır; kılavuz araması tüm maddeleri baştan erişilebilir tutar. Kayıt sıfırlama açık onay ister. Oyun kuralları, teknik maliyetleri, bilimsel rozetler ve seed davranışı değişmedi.

## 21. Çalışma masası araçları (21.09.2026, K-022)
Sekiz yeni özellik uygulandı: kaynaklı defter; ifade karşılaştırma; oyuncunun düzenlediği olay çizelgesi; tamamlanan dosyaların arşivi; kayıt dönüş özeti; yerel ortam sesleri; okuma ve sorgu odağı; kişisel gelişim. Oyuncunun bir notu doğrulaması kendi dayanağını yazması anlamına gelir, motor doğruluğu değildir. Gerçek anlatımı yalnızca suçlama sonrası arşivlenir. Eski kayıtlarda özet sonuçlar korunur, yeni arşiv ayrıntıları geriye dönük üretilmez. `brand.md` §9 kullanım düzenini açıklar.
