# DURUM

> Her ajan üzerine yazar; kısa tutulur. Son güncelleme: 2026-09-16 04:10, Ajan #1.

## Aktif aşama
**Aşama 2 — Dikey dilim.** Dil katmanı tamam. Sıradaki: React ekran iskeleti.

## Biten işler
- Aşama 0 + Aşama 1 (motor zinciri, 161 test) — ayrıntı YOL_HARITASI.md ve günlükte.
- `src/ortak/turkce.ts` (11 test): sonUnlu (rakam okunuşu dahil), bulunma/yonelme/belirtme/tamlayan; iyelikli tamlamada -n-, ünsüz sertleşmesi, kesme işareti.
- `src/motor/dil.ts` (8 test): `uslupUret` (kişilikten: cümle uzunluğu ← dışadönüklük, dolgu olasılığı ← kaygı, resmîlik ← öz-izleme), `VaryantBellegi`, `cevapMetni` (20 şablon kategorisi; gizli etiketi ele vermez; oda/kişi/yöntem çekimli), `betimlemeMetni`, `vakaBrifingi` (fail adı geçmez), `kisiKarti`.
- `gerceklik.ts` rol metni artık doğru ilgi ekiyle ("Nazlı'nın kardeşi").

## Sıradaki 3 iş
1. **React ekran iskeleti** (`src/arayuz/`): oyun durumu (tek `useReducer` + motor çağrıları), ekranlar: Başlık (kahraman adı, K-007) → Vaka açılışı (brifing, kişi kartları, deliller listesi) → Sorgu odası (kişi seç, soru: kendi konumu/başkasının konumu/yöntem/fail; teknik düğmeleri; diyalog akışı + betimleme; zaman bütçesi) → Pano (Gözlem | Çıkarım iki sütun, hipotez limiti, "beklenen ama olmayan") → Suçlama + güven kaydırıcısı → Vaka sonu analizi (`puanla` raporu, hata etiketleri → Kılavuz bağlantısı, gerçeğin anlatımı). Stil: brand.md (dosya kartı + mantar pano; CSS değişkenleri; monospace rapor fontu).
2. **Kılavuz ekranı** (29 madde, 5 bölüm, kanıt rozeti) + **Forer tutorial'ı** (13 madde, herkese aynı metin) + **kayıt** (localStorage try/catch + JSON dışa/içe aktarma, K-011).
3. **Playwright duman testi** (bir vaka baştan sona) + `dist/index.html` `file://` doğrulaması + jsdom bileşen testleri.

## Açık kararlar (kullanıcıya sorulacak)
1. Vaka başına hedef süre → soruşturma saati bütçesi (varsayılan 12).
2. Denge: metodik oyuncu için oyun kolay (yöntem botu 1.00); zorlaştırıcılar dikey dilim sonrası.
3. "The Mentalist" adının telif riski (K-007).

## Bilinen hatalar
- Yok.

## Test durumu
- `npm test`: 15 dosya, 180 test geçti (2026-09-16 04:05). Süre ~25 sn.
- `npm run typecheck`: temiz.
- `npm run build`: tek `dist/index.html`.

## Notlar
- Wiseman ve Rowland kitapları Bookey özeti (K-006).
- `pdftotext` kurulu; PDF'leri sayfa aralığıyla oku.
- Uzun Markdown/JSON dosyalarını Bash heredoc yerine doğrudan dosya yazma aracıyla yaz; Python ile yama yaparken regex kaçışlarına dikkat (SyntaxWarning).
- Şablon havuzu `dil.ts` içinde; büyüyünce `src/icerik/sablonlar.json`'a taşınabilir (içerik testiyle).
- Dil katmanı yalnızca `Cevap` üstünden çalışır; teknik sonuçlarının (SUE çelişkisi, CIT tepkisi…) oyuncuya sunum metinleri arayüzde yazılacak.
