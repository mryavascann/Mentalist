# brand.md — Görsel dil ve UI/UX kararları (v0.1)

> Tüm tasarım kararları (renk, tipografi, layout, ton) burada toplanır. Aşama 2'de (dikey dilim) somutlaşır; şimdilik yön belirleyen taslak. Değişiklik gerekçesi `KARARLAR.md`'ye yazılır.

## 1. İlke: görsel sade, içerik güçlü

- Görsel üretim sınırlı; oyun **metinle** okunur. Davranışlar görselle değil betimlemeyle anlatılır ("sesi alçaldı", "fincanı kenara itti", "cevaptan önce uzun sessizlik").
- Portreler **nötr ifadeli** kalır (bilinçli tercih: yüz ifadesi güvenilir ipucu değildir — Barrett 2019). Bilgi metinde.
- Kodla yapılabilen her şey kodla yapılır: dosya kartları, mantar pano + ip çizgileri (CSS/SVG), zaman çizelgesi, grafikler, ikonlar.

## 2. Ton

- Yüzeyde hafif, zeki, oyunbaz; altta keder ve etik gerilim (manipülasyonu iyilik için kullanmak).
- Oyun oyuncuya "başarısız oldun" demez, "şunu öğrendin" der (gelişim zihniyeti, Dweck).
- İçerik 13+/16+; kan ve vahşet betimlemesi gereksiz, gerilim psikolojiden gelir.
- Dil: Türkçe. Teknik terimlerin Türkçesi tercih edilir, gerekli yerde parantezle İngilizcesi (ör. "stratejik delil kullanımı (SUE)").

## 3. Estetik yön: "dosya dolabı + mantar pano"

- **Metafor:** soruşturma dosyası, daktilo raporu, polaroid, mantar pano ve kırmızı ip, çay lekesi.
- **Yüzeyler:** kağıt tonları (krem/kirli beyaz), manila dosya sarısı, mantar kahvesi; mürekkep siyahı yazı.
- **Vurgu rengi:** tek bir kırmızı (pano ipi, damga, uyarı). İkinci vurgu: soluk mavi (dijital iz, kayıtlar).
- **Kanıt düzeyi rozetleri:** Güçlü / Orta / Zayıf / Mit → dört sabit renk; oyunun her yerinde aynı anlam (renk sözlüğü Aşama 2'de kesinleşir).

## 4. Tipografi

- Rapor/ifade metinleri: daktilo hissi veren monospace (ör. "Courier Prime" / "IBM Plex Mono") — dosya estetiği.
- Kılavuz ve uzun okuma: okunaklı serif (ör. "Source Serif" / "Literata").
- Arayüz etiketleri: nötr sans (sistem fontu yeterli).
- Font yükleme yalnızca Google Fonts; yoksa sistem yedeği.

## 5. Ekran ilkeleri

- **Sorgu odası:** solda kişi kartı (nötr portre, bilinen alanlar, "bilinmiyor" alanları görünür — eksik bilgi ihmaline karşı), ortada diyalog akışı + davranış betimlemeleri, sağda soru kartları / teknik seçimi ve "temel çizgi" notları.
- **Pano:** iki sütun **Gözlem | Çıkarım**; hipotez limiti 4–7; "Karşıt hipotez yaz" ve "Beklenen ama olmayan" alanları; açık sorular listesi.
- **Vaka sonu analizi:** 4 katmanlı hata raporu (Funder RAM), yanlılık etiketi, ilgili Kılavuz sayfası bağlantısı, kalibrasyon grafiği.
- **Kılavuz:** kitap/dosya görünümü; her madde: kısa açıklama → nasıl kullanılır → sınırları → kaynak → kanıt rozeti → "vakada dene".
- Erişilebilirlik: renk tek başına anlam taşımaz (rozetlerde metin de var); klavye ile gezilebilir; küçük ekranda tek sütuna düşer.

## 6. Higgsfield görev listesi (kullanıcı üretir)

Az sayıda, tekrar kullanılabilir, aynı stilde. Her üretim `assets/KAYIT.md`'ye işlenir.
1. Portre havuzu: ~20–24 nötr ifadeli, aynı stil, yaş/tarz çeşitliliği.
2. Takım portreleri: 4–5.
3. Mekân arka planları: 6–8 (malikâne salonu, ofis, sahil evi, tarikat çiftliği, hastane koridoru, sorgu odası, karnaval, motel).
4. Ana görsel: 1.
5. (Opsiyonel, en sona) kısa tanıtım videosu.
Görsel gelene kadar yer tutucu (SVG siluet) kullanılır. Prompt listesi Aşama 3 başında hazırlanır.

## 7. Açık tasarım soruları

- ~~Oyun adı~~ → The Mentalist (K-007). Başlık ekranında oyuncu kahraman adını girer.
- ~~Mekân~~ → vakadan vakaya değişir (K-008); mekân havuzu ile arka plan görselleri eşlenir.
- Karanlık tema: varsayılan "gece masası" (koyu yeşil çuha + lamba ışığı) mı, kağıt mı? Aşama 2'de prototiple karar.
