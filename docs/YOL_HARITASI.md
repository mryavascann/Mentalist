# YOL HARİTASI

> Aşamalar TASARIM §18'den. Kutucuklar tamamlandıkça işaretlenir; tarih ve ajan numarası eklenir.

## Aşama 0 — Kurulum
- [x] Depo ve klasör yapısı (2026-09-16, Ajan #1)
- [x] Kaynaklar `docs/kaynaklar/` altında, indeks çıkarıldı (2026-09-16, Ajan #1)
- [x] Belge seti: BAŞLA BURADAN, DURUM, GÜNLÜK, KARARLAR, YOL HARİTASI, brand.md (2026-09-16, Ajan #1)
- [x] Test altyapısı + duman testi yeşil; tip denetimi ve üretim derlemesi temiz (2026-09-16, Ajan #1)
- [ ] İçerik şemaları: ipucu kataloğu kaydı, ifade türü, soru/teknik, Kılavuz maddesi (TypeScript tipleri + JSON örnekleri + içerik testleri)
- [ ] Açık kararlar için kullanıcıdan yanıt (bkz. DURUM.md)

## Aşama 1 — Motor (UI yok, tamamı testli)
- [ ] `ortak/rastgele`: seedli, tekrar üretilebilir RNG + dağılım yardımcıları (aynı seed = aynı vaka)
- [ ] Tipler: Kişi, İlişki grafiği, Borç grafiği, Zaman çizelgesi, Olay, Delil, İfade (gizli etiketli), Vaka
- [ ] Doğruluk grafiği: "önce gerçek" — olay çekirdeği, gerçek zaman çizelgesi, algı modeli, bilgi dağılımı
- [ ] Sırlar ve motivasyonlar (suçla ilgili / ilgisiz)
- [ ] NPC konuşma stratejisi + yalan defteri (tutarlılık testi)
- [ ] İpucu kataloğu (DePaulo 2003 ağırlıkları, kanıt düzeyi) + olasılıksal ipucu üretimi (masumlar da üretir)
- [ ] Delil üretimi (fiziksel, dijital, "beklenen ama olmayan")
- [ ] Kırmızı ringa üretici (gergin masum, sahte anı, bellek uyumu, çoğulcu cehalet)
- [ ] Çözülebilirlik denetçisi (tek çözüm, zorluk puanı)
- [ ] Örüntü denetçisi (binlerce seed; failin yüzeysel özelliklerle korelasyonu ≈ 0)
- [ ] Soru/teknik motoru: temel çizgi, açık uçlu, yönlendirici (kontaminasyon kaydı), SUE, bilişsel yük, beklenmedik soru, CIT, SVT, şaşkınlık testi, sahte bilgi yemi
- [ ] Puanlama + güven kalibrasyonu
- [ ] Denge botları (sadece beden dili / yöntem / hepsine inanan / herkese yalancı) → yöntem botu belirgin şekilde üstün olmalı

## Aşama 2 — Dikey dilim
- [ ] 1 vaka tipi, 5 kişi
- [ ] Ekranlar: vaka açılışı, sorgu odası, pano (gözlem | çıkarım), suçlama + güven beyanı, vaka sonu analizi
- [ ] Kılavuz'un 3 bölümü (Yalan Tespitinin Bilimi, Sorgulama Teknikleri, Mitler Müzesi)
- [ ] Forer testi tutorial'ı
- [ ] Playwright duman testi: bir vaka baştan sona oynanabiliyor

## Aşama 3 — Genişleme
- [ ] Diğer araçlar ve arketipler
- [ ] Kör nokta profili + adaptif vaka üretimi
- [ ] Mini oyunlar / tatbikatlar
- [ ] Higgsfield görselleri (portre havuzu, takım, mekânlar, ana görsel)
- [ ] Kalan Kılavuz bölümleri (14 bölüm hedefi)

## Aşama 4 — Ark
- [ ] Takım hikâyesi
- [ ] "Ayna" ana düşmanı (oyuncunun kör nokta verisini okuyan manipülatör)
