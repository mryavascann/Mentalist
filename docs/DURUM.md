# DURUM

> Her ajan üzerine yazar; kısa tutulur. Son güncelleme: 2026-09-16 03:30, Ajan #1.

## Aktif aşama
**Aşama 1 — Motor TAMAMLANDI.** Sıradaki: **Aşama 2 — Dikey dilim** (dil katmanı + ekranlar).

## Biten işler
- Aşama 0: kurulum, belge seti, K-001…K-012, içerik şemaları (16 test), seedli RNG (14 test).
- Aşama 1 motor zinciri (`src/motor/`), hepsi testli:
  - `gerceklik.ts` doğruluk grafiği (18) → `bilgi.ts` bilgi dağılımı/algı (13) → `sirlar.ts` sırlar/korumalar (11) → `strateji.ts` konuşma stratejisi + yalan defteri (18) → `ipucu.ts` olasılıksal ipuçları (11) → `delil.ts` deliller (12) → `teknik.ts` 12 teknik (19) → `cozulebilirlik.ts` çözülebilirlik/zorluk/örüntü denetçisi (10) → `puan.ts` puanlama + hata etiketleri (14) → `botlar.ts` denge botları (5).
- Ölçümler (2026-09-16): yöntem botu doğruluk 1.00 / ort. puan 105 / Brier .04 / masum suçlama 0; ipucu botu .28 / 28.5 / .38 / .71; inanan .12; şüpheci .20. Örüntü: 13 yüzeysel özellikte en büyük |r| = .032 (n=3916 kişi); "en çok delili olan" kestirmesi .33; ilk/son kişi .20/.21. Suç vakalarının %94'ü ilk seed'de çözülebilir; `vakaUretCozulebilir` ort. 1.06 deneme; zorluk 0.05–0.95, medyan 0.35.

## Sıradaki 3 iş (Aşama 2)
1. **Dil katmanı** (`src/motor/dil/`): K-009 şablon-gramer motoru. Girdi: `Cevap` + `IpucuGozlemi[]` + kişi üslup parametreleri (dolgu sözcükleri, cümle uzunluğu, resmîlik; kişilikten türer). Çıktı: Türkçe diyalog metni + davranış betimlemesi. Deterministik (seed), "son kullanılan varyantı tekrar etme" belleği. Test: her cevap türü için metin üretilir, oda/kişi adları doğru geçer, aynı seed aynı metin.
2. **Ekran iskeleti (React):** başlık (kahraman adı girişi, K-007) → vaka açılışı (brifing, kişi kartları, mekân) → sorgu odası (kişi seç, teknik seç, cevap + betimleme akışı, zaman bütçesi) → pano (Gözlem | Çıkarım, hipotezler, "beklenen ama olmayan") → suçlama + güven → vaka sonu analizi (puan, hata etiketleri → Kılavuz bağlantıları, çözüm anlatımı). brand.md'ye göre stil.
3. **Kılavuz ekranı + Forer tutorial'ı + kayıt** (localStorage + JSON dışa/içe aktarma, K-011) + Playwright duman testi (bir vaka baştan sona) + `dist/index.html` file:// doğrulaması.

## Açık kararlar (kullanıcıya sorulacak)
1. Vaka başına hedef oyun süresi → soruşturma saati bütçesi (puan.ts varsayılan 12 saat).
2. Denge notu: metodik oyuncu için oyun şu an KOLAY (yöntem botu %100). Zorlaştırıcılar önerisi: fail kaçamak oranını yükseltmek, görgü tanığını korku ile susturmak, sahnelenmiş delil, sızıntı oranını artırmak. Dikey dilim oynandıktan sonra karar.
3. "The Mentalist" adının telif riski (K-007).

## Bilinen hatalar
- Yok.

## Test durumu
- `npm test`: 13 dosya, 161 test geçti (2026-09-16 03:20). Süre ~25 sn (denge botları 200 vaka × 4 bot).
- `npm run typecheck`: temiz.
- `npm run build`: tek `dist/index.html`.

## Notlar
- Wiseman ve Rowland kitapları Bookey özeti (K-006).
- `pdftotext` kurulu; PDF'leri sayfa aralığıyla oku.
- Uzun Markdown/JSON dosyalarını Bash heredoc yerine doğrudan dosya yazma aracıyla yaz.
- Motor metin üretmez; yapısal sonuç üretir (K-009). Dil katmanı Aşama 2'nin ilk işi.
- İpucu testi zayıf ipuçlarında gürültüye duyarlı; RNG anahtarı değişirse örneklem büyütülür, model gevşetilmez.
- Çözülebilirlik denetimi taze Sorgu klonunda çalışır; oyuncu defterini kirletmez. Botlar gizli etiketleri (ifadeTuru/dogru) görmez.
