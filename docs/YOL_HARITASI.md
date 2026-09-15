# YOL HARİTASI

> Aşamalar TASARIM §18'den. Kutucuklar tamamlandıkça işaretlenir; tarih ve ajan numarası eklenir.

## Aşama 0 — Kurulum
- [x] Depo ve klasör yapısı (2026-09-16, Ajan #1)
- [x] Kaynaklar `docs/kaynaklar/` altında, indeks çıkarıldı (2026-09-16, Ajan #1)
- [x] Belge seti: BAŞLA BURADAN, DURUM, GÜNLÜK, KARARLAR, YOL HARİTASI, brand.md (2026-09-16, Ajan #1)
- [x] Test altyapısı + duman testi yeşil; tip denetimi ve üretim derlemesi temiz (2026-09-16, Ajan #1)
- [x] İçerik şemaları: tipler + doğrulayıcı + 6 JSON kütüğü + 16 içerik testi (2026-09-16, Ajan #1)
- [x] Açık kararlar için kullanıcıdan yanıt → K-007…K-012 (2026-09-16)

## Aşama 1 — Motor (UI yok, tamamı testli)
- [x] `ortak/rastgele`: seedli RNG + dağılım yardımcıları + alt akışlar, 14 test (2026-09-16, Ajan #1)
- [x] Tipler v0: Kişi, İlişki, Borç, Zaman çizelgesi, Olay, Vaka (2026-09-16, Ajan #1) — Delil ve İfade tipleri sonraki katmanlarda
- [x] Doğruluk grafiği v0: mekân, kişiler, ilişki/borç grafiği, olay çekirdeği, gerçek zaman çizelgesi, 18 test (2026-09-16, Ajan #1)
- [x] Algı modeli + bilgi dağılımı: kendisi/gördü/dedikodu/medya, dikkat boşluğu, CIT geçerliliği, 13 test (2026-09-16, Ajan #1)
- [x] Sırlar ve korumalar: 6 sır türü, borç/aile/ortak-sır korumaları, 11 test (2026-09-16, Ajan #1)
- [x] NPC konuşma stratejisi + yalan defteri: 8 ifade türü, 18 test (2026-09-16, Ajan #1)
- [x] İpucu kataloğu + olasılıksal ipucu üretimi (masumlar da üretir; mit ipuçları kaymaz; ipucu botu şansa yakın), 11 test (2026-09-16, Ajan #1)
- [x] Delil üretimi: fail izi, yöntem delili, "beklenen ama olmayan", gürültü izleri, çelişki hesabı, 12 test (2026-09-16, Ajan #1)
- [ ] Kırmızı ringa üretici (gergin masum, sahte anı, bellek uyumu, çoğulcu cehalet)
- [ ] Çözülebilirlik denetçisi (tek çözüm, zorluk puanı)
- [ ] Örüntü denetçisi (binlerce seed; failin yüzeysel özelliklerle korelasyonu ≈ 0)
- [x] Soru/teknik motoru: 12 teknik (SUE sırası, bilişsel yük, beklenmedik soru, CIT, SVT, yönlendirici + kontaminasyon, suçlayıcı ton + sahte itiraf…), 19 test (2026-09-16, Ajan #1)
- [ ] Puanlama + güven kalibrasyonu
- [ ] Denge botları (sadece beden dili / yöntem / hepsine inanan / herkese yalancı) → yöntem botu belirgin şekilde üstün olmalı

## Aşama 2 — Dikey dilim
- [ ] 1 vaka tipi, 5 kişi
- [ ] Ekranlar: vaka açılışı, sorgu odası, pano (gözlem | çıkarım), suçlama + güven beyanı, vaka sonu analizi
- [ ] Kılavuz ekranı (içerik hazır: 29 madde, 5 bölüm; ekran Aşama 2)
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
