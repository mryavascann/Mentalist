# BAŞLA BURADAN

> Yeni sohbete başlayan her ajan önce bu dosyayı okur. Okuma sırası aşağıda. Sırayı atlama; token ekonomisi için büyük dosyaların sadece ilgili bölümünü aç.

## Proje 10 satırda

1. The Mentalist dizisinden esinlenen, **metin ağırlıklı, görsel olarak sade, içerik olarak güçlü** bir dedektif oyunu. Adı: **Cold Read** (K-019; eski ad The Mentalist, K-007); kahraman adını oyuncu girer.
2. Her vakada 5–8 kişi; kimi yalan söyler, kimi birini korur, kimi dürüst ama yanılır, kimi oyuncuyu manipüle eder.
3. Oyuncu **gerçek bilimsel teknikler** kullanır: temel çizgi, stratejik delil kullanımı (SUE), bilişsel yük, gizli bilgi testi, beklenmedik soru, soğuk okumayı çözme…
4. **Yanılmak oyunun parçasıdır.** Vaka sonunda oyun nerede, neden yanıldığını ve hangi Kılavuz konusunu çalışması gerektiğini söyler; kör nokta profili tutar.
5. **Kılavuz sekmesi:** 7 kitap + ~56 makaleden damıtılmış teknikler; her madde kaynaklı ve kanıt düzeyi rozetli (Güçlü / Orta / Zayıf / Mit).
6. Vakalar seed ile **rastgele üretilir**; "önce gerçek, sonra ifadeler" mimarisi; çözülebilirlik ve örüntü denetçileri kalıp oluşmasını engeller.
7. Bilimsel sadakat: tek davranış yalanın kanıtı değildir; davranış = sorulacak konu sinyali; kesinlik delille gelir. Mitler mit olarak sunulur.
8. Dizinin ruhu korunur (eski sahte medyum kahraman, çay, kanepe, son sahne tuzağı, takım); dizi/karakter adları kullanılmaz.
9. Teknoloji: TypeScript + Vite + React + Vitest. Motor saf TS ve UI'dan bağımsız. **Önce test, sonra kod; kırmızı testle ilerlenmez.**
10. Görseller: kodla yapılabilenler kodla (CSS/SVG); az sayıda portre/mekân görseli Higgsfield ile (kullanıcı üretir, ajan prompt verir, `assets/KAYIT.md` tutulur).

## Okuma sırası (her yeni sohbette)

1. Bu dosya.
2. `DURUM.md` → neredeyiz, sıradaki iş, açık kararlar.
3. `AJAN_GUNLUGU.md` → **son 3 kayıt**.
4. `KARARLAR.md` → özellikle son kararlar.
5. Sıradaki işle ilgili `TASARIM.md` bölümü.
6. Gerekirse `kaynaklar/NOTLAR.md`'de ilgili başlık (78 başlık var; başlık listesini `grep '^## ' docs/kaynaklar/NOTLAR.md` ile çıkar, tamamını okuma).
7. Gerekirse ilgili PDF: `kaynaklar/KAYNAK_INDEKSI.md` dosya adlarını kaynaklara eşler. `pdftotext -f N -l M dosya.pdf -` ile sadece gereken sayfaları oku (pdftotext bu makinede kurulu).

Sonra kullanıcıya: "Kaldığımız yer: … Sıradaki iş: … Başlayayım mı?"

## Dosya haritası

| Dosya | Ne için |
|---|---|
| `AJAN_PROMPTU.md` | Sabit ajan promptu (kurallar, döngü, test kuralları, devir teslim şablonu) |
| `DURUM.md` | Anlık durum; her ajan üzerine yazar, kısa tutulur |
| `AJAN_GUNLUGU.md` | Sadece eklenir; devir teslim kayıtları |
| `KARARLAR.md` | Numaralı karar kayıtları; prompt ile çelişirse yeni tarihli karar geçerli |
| `YOL_HARITASI.md` | Aşamalar ve onay kutuları |
| `TASARIM.md` | Yaşayan oyun tasarım belgesi (tohumdan büyür) |
| `brand.md` | Görsel dil ve UI/UX kararları |
| `USLUP.md` | Türkçe üslup kılavuzu ve terim sözlüğü; oyuncuya görünen her metin buna göre yazılır (K-018) |
| `kaynaklar/NOTLAR.md` | Önceki ajanların ~1230 satırlık okuma notları (kaynak kısaltmaları buradaki başlıklarla eşleşir) |
| `kaynaklar/KAYNAK_INDEKSI.md` | PDF dosya adı → kaynak eşlemesi |
| `kaynaklar/mentaldocs/` | 7 kitap + 59 makale PDF (git'e alınmaz, bkz. KARARLAR K-002) |
| `kaynaklar/OYUN_TASARIM_TOHUMU_v1_orijinal.md` | Tohumun değiştirilmemiş ilk hali (karşılaştırma için) |

## Komutlar

```
npm test          # tüm test paketi (vitest run)
npm run typecheck # tsc --noEmit
npm run dev       # geliştirme sunucusu
npm run build     # tip denetimi + üretim derlemesi
```

## Kod kuralları (kısa)

- Oyuncuya görünen metin `docs/USLUP.md`'ye uyar (terim sözlüğü, sembolsüz düz metin, havuz boyutu sabit).
- Türkçe isimlendirme ve bol Türkçe yorum: her modülün başında ne işe yaradığı, her önemli fonksiyonun üstünde ne yaptığı ve neden.
- İthalat takma adları: `@motor/*`, `@icerik/*`, `@arayuz/*`, `@ortak/*`.
- `src/motor` ve `src/ortak` asla `src/arayuz`'u ithal etmez.
- Kaynak alanları `NOTLAR.md` başlık adıyla yazılır (ör. `"DePaulo 2003"`), bkz. K-004.
