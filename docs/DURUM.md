# DURUM

> Her ajan üzerine yazar; kısa tutulur. Son güncelleme: 2026-09-16 06:40, Ajan #1.

## Aktif aşama
**Aşama 3 — Genişleme.** Zorluk seçici ve zorlaştırıcılar tamam. Sıradaki: cila (ilk/son ifade özeti, temel çizgi notu), Kılavuz bölümleri, ipucu kataloğu genişletme.

## Biten işler
- Aşama 0–2 tamam (kurulum, motor, dil, ekranlar, Forer, Kılavuz, kayıt). Ayrıntı YOL_HARITASI.md.
- **Zorluk ayarı** (`tipler.ts` `Zorluk`, `VakaAyari`, `ZORLUK_PARAMETRELERI`; `vakaUret(seed, ayar)`; `vakaUretCozulebilir(seed, n, ayar)`): kolay/orta/zor. Parametreler: sızma olasılığı .15/.35/.55, kaçamak eşiği .85/.70/.45, korku olasılığı 0/.2/.6, sahneleme olasılığı 0/.2/.6.
- **Korkuyla susan tanık** (`sirlar.ts` neden `korku`): olay odasındaki görgü tanığı failden korkup fail kimliğini vermez.
- **Sahnelenmiş delil** (`delil.ts` `sahnelenmis`, `sahnelenmisMi`): fail, olay anında başka yerde olan bir masuma ait izi olay odasına yerleştirir; masumun gerçek izi de üretilir → aynı kişi-dilim, iki oda = fizik tutarsızlığı. Çözülebilirlik ve yöntem botu bu delilleri sinyal dışı bırakır; puanlama sahnelenmiş delile kanan oyuncuya `delil-sorgulanmadi` etiketi (Kılavuz `sahnelenmis-suc`) verir.
- Başlık ekranında zorluk seçici; kayıtla taşınır. 11 yeni test (`tests/motor/zorluk.test.ts`).
- Ölçüm (150 vaka/seviye): yöntem botu doğruluk kolay 1.00 / orta 1.00 / zor .97 (masum suçlama .03); ipucu botu .28–.31; ortalama zorluk puanı .32 / .43 / .65; çözülebilir vaka için ort. deneme 1.01 / 1.03 / 1.37.

## Sıradaki 3 iş
1. **Cila:** Analiz'de her kişi için "olay anı ifadesi vs gerçek" tablosu (ilk/son ifade); kişi kartına temel çizgi notu (teknik sonucu kalıcı); sorgu odasında "delil gösterildi" rozeti; klavye/mobil kontrol.
2. **Kılavuz genişletme:** "Bellek ve Tanıklık" (Loftus, French, Nisbett & Wilson), "Dikkat ve Sihir" (Simons & Chabris, Kuhn), "İkna ve Manipülasyon" (Cialdini) bölümleri; ipucu kataloğuna Navarro yatıştırıcı davranışları (`zayif`).
3. **Mini oyunlar:** kör seçim (Beyerstein), soğuk okuma dedektörü (Rowland öğeleri), taban oranı bulmacası (TASARIM §13).

## Açık kararlar (kullanıcıya sorulacak)
1. Vaka başına hedef süre → soruşturma saati bütçesi (varsayılan 12).
2. Yöntem botu zorda hâlâ .97: bot "fizik kontrolü"nü biliyor; insan için zorluk Kılavuz'u okumaya bağlı. Daha da zorlaştırmak istersen: kaçamak eşiğini .30'a, sızmayı .70'e çekmek yeterli (tek yer: `ZORLUK_PARAMETRELERI`).
3. "The Mentalist" adının telif riski (K-007).

## Bilinen hatalar
- Yok.

## Test durumu
- `npm test`: 20 dosya, 211 test geçti (2026-09-16 06:35). Süre ~60 sn (zorluk testleri 3 seviye × 150 vaka).
- `npm run typecheck`: temiz. `npm run build`: tek `dist/index.html`.

## Notlar
- Kullanıcı: sorun yoksa "devam edeyim mi" sorma, sürekli çalış (16.09.2026).
- Bash heredoc'ta uzun Python/Markdown kırılıyor; yamaları scratchpad `.py` olarak yaz ve çalıştır.
- Depo tekildir; testler `depo.sifirla()` ile izole edilir. Playwright'ta rol tabanlı seçici.
- Sahnelenmiş delil oyuncuya bayrakla GÖSTERİLMEZ; oyuncu iki delilin aynı kişiyi aynı anda iki yerde gösterdiğini fark etmeli (Kılavuz: sahnelenmiş suç).
