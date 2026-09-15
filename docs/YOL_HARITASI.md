# YOL HARİTASI

> Aşamalar TASARIM §18'den. Kutucuklar tamamlandıkça işaretlenir; tarih ve ajan numarası eklenir.

## Aşama 0 — Kurulum
- [x] Depo ve klasör yapısı (2026-09-16, Ajan #1)
- [x] Kaynaklar `docs/kaynaklar/` altında, indeks çıkarıldı (2026-09-16, Ajan #1)
- [x] Belge seti: BAŞLA BURADAN, DURUM, GÜNLÜK, KARARLAR, YOL HARİTASI, brand.md (2026-09-16, Ajan #1)
- [x] Test altyapısı + duman testi yeşil; tip denetimi ve üretim derlemesi temiz (2026-09-16, Ajan #1)
- [x] İçerik şemaları: tipler + doğrulayıcı + 6 JSON kütüğü + 16 içerik testi (2026-09-16, Ajan #1)
- [x] Açık kararlar için kullanıcıdan yanıt → K-007…K-012 (2026-09-16)

## Aşama 1 — Motor (UI yok, tamamı testli) — TAMAMLANDI 2026-09-16
- [x] `ortak/rastgele`: seedli RNG + dağılım yardımcıları + alt akışlar, 14 test (2026-09-16, Ajan #1)
- [x] Tipler v0: Kişi, İlişki, Borç, Zaman çizelgesi, Olay, Vaka (2026-09-16, Ajan #1) — Delil ve İfade tipleri sonraki katmanlarda
- [x] Doğruluk grafiği v0: mekân, kişiler, ilişki/borç grafiği, olay çekirdeği, gerçek zaman çizelgesi, 18 test (2026-09-16, Ajan #1)
- [x] Algı modeli + bilgi dağılımı: kendisi/gördü/dedikodu/medya, dikkat boşluğu, CIT geçerliliği, 13 test (2026-09-16, Ajan #1)
- [x] Sırlar ve korumalar: 6 sır türü, borç/aile/ortak-sır korumaları, 11 test (2026-09-16, Ajan #1)
- [x] NPC konuşma stratejisi + yalan defteri: 8 ifade türü, 18 test (2026-09-16, Ajan #1)
- [x] İpucu kataloğu + olasılıksal ipucu üretimi (masumlar da üretir; mit ipuçları kaymaz; ipucu botu şansa yakın), 11 test (2026-09-16, Ajan #1)
- [x] Delil üretimi: fail izi, yöntem delili, "beklenen ama olmayan", gürültü izleri, çelişki hesabı, 12 test (2026-09-16, Ajan #1)
- [x] Kırmızı ringa: gergin masum (sirlar), bellek uyumu (bilgi), sahte anı (teknik: yönlendirici/yem), tuzak delil (delil) — dağıtık olarak kuruldu; çoğulcu cehalet Aşama 3 (2026-09-16, Ajan #1)
- [x] Çözülebilirlik denetçisi + zorluk + `vakaUretCozulebilir`, 10 test (2026-09-16, Ajan #1)
- [x] Örüntü denetçisi: 13 özellik, 800 vaka, en büyük |r|=.032 (2026-09-16, Ajan #1)
- [x] Soru/teknik motoru: 12 teknik (SUE sırası, bilişsel yük, beklenmedik soru, CIT, SVT, yönlendirici + kontaminasyon, suçlayıcı ton + sahte itiraf…), 19 test (2026-09-16, Ajan #1)
- [x] Puanlama + Brier kalibrasyonu + otomatik hata etiketleri (20 etiket), 14 test (2026-09-16, Ajan #1)
- [x] Denge botları: yöntem 1.00 / ipucu .28 / inanan .12 / şüpheci .20, 5 test (2026-09-16, Ajan #1)

## Aşama 2 — Dikey dilim
- [x] Dil katmanı (K-009): Türkçe ek yardımcıları + şablon-gramer metin üreticisi, 19 test (2026-09-16, Ajan #1)
- [x] Vaka: motor üretir (5–8 kişi, 4 olay türü, 8 mekân) — tek tip yerine üreticinin tamamı dikey dilimde (2026-09-16, Ajan #1)
- [x] Ekranlar: başlık, vaka açılışı, sorgu odası, pano, suçlama + güven, vaka sonu analizi, Kılavuz; depo 12 test + jsdom 2 test (2026-09-16, Ajan #1)
- [x] Kılavuz ekranı: 29 madde, 5 bölüm, rozetler, "karşılaştın" (2026-09-16, Ajan #1)
- [x] Forer testi tutorial'ı: 8 soru → 13 madde → puan → ifşa; ilk vakadan önce; Kılavuz'a soğuk okuma bölümü (3 madde), 4 test (2026-09-16, Ajan #1)
- [x] jsdom duman testi (bir vaka baştan sona) + `scripts/dosya-kontrol.mjs` yerel Chrome ile file:// doğrulaması (2026-09-16, Ajan #1)
- [x] Kayıt: localStorage + JSON dışa/içe aktarma (K-011) (2026-09-16, Ajan #1)

## Aşama 3 — Genişleme
- [x] Zorluk seçici + zorlaştırıcılar: sızıntı, kaçamak eşiği, korkuyla susan tanık, sahnelenmiş delil (Norwood), 11 test (2026-09-16, Ajan #1)
- [x] Şablon havuzu (20 kategori × ≥5) ve mekâna özgü belge delilleri (2026-09-16, Ajan #1)
- [ ] Diğer araçlar ve arketipler (TASARIM §15 vaka arketip havuzu)
- [x] Kör nokta profili + adaptif vaka üretimi: etiket → yapısal hedef (gergin masum, gömülü yalan, sızıntı, telkine yatkın tanık, sahnelenmiş delil, suç var); vaka sonunda açıklanır; Kılavuz'da 'Senin kör noktan' (2026-09-16, Ajan #1)
- [x] Mini oyunlar: kör seçim (Beyerstein), soğuk okuma dedektörü (Rowland öğeleri, çoklu etiket puanı), taban oranı bulmacası; 3 test (2026-09-16, Ajan #1)
- [ ] Kalan tatbikatlar: Linda tuzağı, kaybolan top / off-beat, ince dilim, çift kör test tasarla
- [~] Higgsfield görselleri: prompt listesi hazır (`assets/HIGGSFIELD_PROMPTLAR.md`), SVG siluet yer tutucu (`Portre.tsx`); üretim kullanıcıda (2026-09-16, Ajan #1)
- [x] Kılavuz bölümleri: Bellek ve Tanıklık, Dikkat ve Sihir, İkna ve Manipülasyon, Kişilik Okuma (+2), Soğuk Okuma → 9 bölüm / 50 madde; Navarro ipuçları kataloğa (2026-09-16, Ajan #1)
- [x] Kalan bölümler: Duygular (4), İnanç/Paranormal/Tarikat (3), Holmes Gibi Düşünmek (3) → 12 bölüm / 60 madde; Senin Kör Noktan dinamik (2026-09-16, Ajan #1)

## Aşama 4 — Ark
- [x] Takım NPC'leri: lider / sorgucu / inanan analist / saha ajanı sorgu odasında yorum yapar; saha ajanı sosyal kanıt tuzağı (<%45 isabet); yorumlar kapatılabilir; 'takımın çoğunluk görüşü' dayanağı yanlış suçlamada `sosyal-kanit` etiketi; 4 test (2026-09-16, Ajan #1)
- [x] "Watson'a anlat": pano maddelerini sorgucuya anlatma, sınıflama denetimi, 3 test (2026-09-16, Ajan #1)
- [ ] Takım hikâyesi (arka plan, vakalar arası diyalog)
- [ ] "Ayna" ana düşmanı (oyuncunun kör nokta verisini okuyan manipülatör)
