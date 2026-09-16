# DURUM

> Her ajan üzerine yazar; kısa tutulur. Son güncelleme: 2026-09-16 17:00, Ajan #1.

## Aktif aşama
**Aşama 3 — Genişleme.** Zorluk, cila, Kılavuz genişletmesi, yedi tatbikat, adaptif üretim, takım NPC'leri, şablon havuzu, arketip havuzu, kanepe molası, ifade çizelgesi, kalibrasyon günlüğü, regresyon seed'leri, takım hikâyesi, aralıklı tekrar, **§7'nin tüm araçları** ve **Ayna arkı** tamam (Kılavuz 66 madde, 16 teknik). Yol haritasındaki Aşama 3 maddeleri bitti; kalan: kullanıcı kararları (zor seviye, bütçe) ve Higgsfield görselleri.

## Biten işler
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
- **Görseller (Higgsfield, 2026-09-16):** 122 WebP `assets/` altında (56 portre + 4 takım, 9 mekân, 18 oda, 12 Kılavuz bölümü, 7 tatbikat, 4 delil türü, 12 diğer); `src/arayuz/gorseller.ts` kütük + seed'li portre eşlemesi (cinsiyet/yaş uyumlu, faille ilişkisiz); ekranlara bağlı (başlık, vaka açılışı, sorgu, Kılavuz, tatbikat, Analiz, Pano, suçlama, Forer, Watson). `Portre.tsx` görsel yoksa siluete düşer. Kayıt: `assets/KAYIT.md`. 6 test.

## Sıradaki 3 iş
1. **Zor seviye kararı:** kullanıcı açık karar 2'deki seçeneklerden birini seçerse uygula (`ZORLUK_PARAMETRELERI` + `delil.ts` tohumu); bot ve zorluk test eşiklerini koru.
2. **Boyut (isteğe bağlı):** dist 6 MB; gerekirse portre 384² / oda q50 ile ~4 MB. Higgsfield kredisi 0.
3. **Küçük fikirler:** oda görsellerini ifade çizelgesinde de göstermek; Kılavuz 'kayit-inceleme' maddesinden "tekrar sor" ipucuna oyun içi bağ; takım sahnesinde oyuncunun kısa cevap seçmesi.

## Açık kararlar (kullanıcı henüz oynamadı; oynayınca cevaplanacak — 16.09.2026)
1. Vaka başına soruşturma saati bütçesi (varsayılan 12; oynayınca "yetmedi / bol" hissine göre).
2. **Zor seviye yeterince zor mu? Bot ölçümü (2026-09-16, 300 vaka/zorluk):** yöntem botu kolay/orta/zor = %97/%97/%97 doğruluk (masum suçlama %3); ipucu botu %32/%31/%30; şüpheci %20/%20/%18. Zorluk parametreleri bot için fark yaratmıyor. Tanı (suç vakalarında): tanık faili söyledi %44/%38/%30, delil çelişkisi %96/%89/%60, ikisi de yok %1/%5/%23, fail kaçamak %4/%11/%40. Zorda tanık ve delil azalıyor ama bot "olay anında izi olan tek kişi + geçerli CIT" yolundan buluyor (çözülebilirlik tohumu: fail her zaman olay odasında iz bırakır). **Seçenekler (karar oyuncuda):** (a) zorda masumlara da olay dilimi/odasında gürültü izi (şüpheli kümesi büyür), (b) zorda CIT'te failin ayrıntıyı "fark etmemiş" olma olasılığı, (c) hiç dokunma; insan oyuncu botun prosedürünü uygulamaz, önce oyna. Tek ayar noktası `ZORLUK_PARAMETRELERI` + `delil.ts` çözülebilirlik tohumu.
3. "The Mentalist" adının telif riski (K-007) — yalnızca not; yayın öncesi hatırlatılacak.
4. ~~Higgsfield görselleri~~ → üretildi ve gömüldü (16.09.2026). dist 6 MB; küçültme gerekirse portre 384² / oda q50.

## Bilinen hatalar
- Yok.

## Test durumu
- **Son eklemeler (19:40):** "ikinci kez sor" (K-016, `TEKRAR_CARPANI`), konuşma kaydında oda küçük resmi, delil türü ikonları, Ayna 3. karşılaşma takım sahnesi (`AYNA_SAHNE_ESIGI`), oda eşyası → Pano düğmesi. 4 test.
- `npm test`: 40 dosya, 315 test geçti (2026-09-16 19:40). Süre ~90 sn.
- `npm run typecheck`: temiz. `npm run build`: tek `dist/index.html` (5.98 MB; 122 görsel gömülü, gzip 4.3 MB).

## Notlar
- Kullanıcı: sorun yoksa "devam edeyim mi" sorma, sürekli çalış (16.09.2026).
- Bash heredoc'ta uzun Python/Markdown kırılıyor; yamaları scratchpad `.py` olarak yaz ve çalıştır (`PYTHONIOENCODING=utf-8`). JSON yaması dosyayı indent=2 ile yeniden biçimler.
- Higgsfield CLI global kurulu (`higgsfield --version`), giriş tarayıcıdan (`higgsfield auth login`); skill'ler proje içinde `.agents/skills/` (git dışı).
- Depo tekildir; testler `depo.sifirla()` ile izole edilir. Playwright'ta rol tabanlı seçici.
- Sahnelenmiş delil oyuncuya bayrakla gösterilmez; fizik tutarsızlığı ile bulunur. Sahnelenmiş oda eşyası da öyle (toz izi, kırılmamış kitap sırtı).
- İpucu sadakat testi zayıf ipuçlarında gürültüye duyarlı; yeni ipucu eklerken `betimlemeYonu` ve kişilik temel çizgisini (`ipucu.ts KISILIK_TEMELI`) birlikte ekle.
- Gizli bilgi (ifade türü, iç ses gerçeği, eşya türü) oyun sırasında metne yazılmaz; Analiz'de açılır. Yeni araç eklerken sızma testi yaz.
