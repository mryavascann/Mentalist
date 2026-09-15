// Dil katmanı testleri (K-009): yapısal cevap → Türkçe diyalog + davranış betimlemesi.
// Metin gizli etiketi ele vermez ("yalan" kelimesi geçmez), oda/kişi adlarını doğru çekimle içerir,
// seed ile deterministiktir, üslup parametreleri (dolgu sözcükleri) kişiye göre değişir ve
// varyant belleği aynı kalıbı art arda tekrarlamaz.
import { describe, it, expect } from 'vitest';
import { vakaUret } from '@motor/gerceklik';
import { sorguBaslat, sor, teknikUygula } from '@motor/teknik';
import { uslupUret, cevapMetni, betimlemeMetni, vakaBrifingi, kisiKarti, VaryantBellegi } from '@motor/dil';
import type { KisiUslubu } from '@motor/dil';
import { YALAN_IFADE_TURLERI } from '@motor/ipucu';

const sorgular = Array.from({ length: 40 }, (_, i) => sorguBaslat(vakaUret(`dil-${i}`)));
const odaAdi = (q: (typeof sorgular)[number], id: string) => q.durum.vaka.mekan.odalar.find((o) => o.id === id)!.ad;
const ilkAd = (q: (typeof sorgular)[number], id: string) => q.durum.vaka.kisiler.find((k) => k.id === id)!.ad.split(' ')[0]!;

describe('uslupUret', () => {
  it('kişilikten deterministik üslup türetir; parametreler geçerli', () => {
    const q = sorgular[0]!;
    for (const k of q.durum.vaka.kisiler) {
      const a = uslupUret(q.durum.vaka, k.id);
      const b = uslupUret(q.durum.vaka, k.id);
      expect(a).toEqual(b);
      expect(['kisa', 'orta', 'uzun']).toContain(a.cumleUzunlugu);
      expect(a.resmilik).toBeGreaterThanOrEqual(0);
      expect(a.resmilik).toBeLessThanOrEqual(1);
      expect(a.dolguOlasiligi).toBeGreaterThanOrEqual(0);
      expect(a.dolguOlasiligi).toBeLessThanOrEqual(1);
      expect(a.dolguSozcukleri.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('içe dönük kişi daha kısa cümle kurar; kaygılı kişi daha çok dolgu kullanır (eğilim)', () => {
    let kisaIcedonuk = 0, icedonuk = 0, kisaDisadonuk = 0, disadonuk = 0, dolguKaygili = 0, kaygili = 0, dolguSakin = 0, sakin = 0;
    for (const q of sorgular) for (const k of q.durum.vaka.kisiler) {
      const u = uslupUret(q.durum.vaka, k.id);
      if (k.kisilik.disadonukluk < 0.35) { icedonuk++; if (u.cumleUzunlugu === 'kisa') kisaIcedonuk++; }
      if (k.kisilik.disadonukluk > 0.65) { disadonuk++; if (u.cumleUzunlugu === 'kisa') kisaDisadonuk++; }
      if (k.kisilik.kaygi > 0.65) { kaygili++; dolguKaygili += u.dolguOlasiligi; }
      if (k.kisilik.kaygi < 0.35) { sakin++; dolguSakin += u.dolguOlasiligi; }
    }
    expect(kisaIcedonuk / icedonuk).toBeGreaterThan(kisaDisadonuk / disadonuk);
    expect(dolguKaygili / kaygili).toBeGreaterThan(dolguSakin / sakin);
  });
});

describe('cevapMetni', () => {
  it('her cevap için boş olmayan, "undefined"/"[object" içermeyen metin üretir; deterministik', () => {
    for (const q of sorgular.slice(0, 15)) {
      const bellek = new VaryantBellegi();
      for (const k of q.durum.vaka.kisiler) {
        if (!k.hayatta) continue;
        const uslup = uslupUret(q.durum.vaka, k.id);
        for (const hedef of q.durum.vaka.kisiler) {
          const s = sor(q, k.id, { tur: 'konum', hedef: hedef.id, dilim: q.durum.vaka.olay.dilim });
          const m1 = cevapMetni(q.durum.vaka, s.cevap, uslup, new VaryantBellegi());
          const m2 = cevapMetni(q.durum.vaka, s.cevap, uslup, new VaryantBellegi());
          expect(m1).toBe(m2);
          expect(m1.length).toBeGreaterThan(3);
          expect(m1).not.toMatch(/undefined|\[object|NaN/);
          cevapMetni(q.durum.vaka, s.cevap, uslup, bellek);
        }
        for (const konu of ['olay-yontemi', 'fail-kimligi'] as const) {
          const s = sor(q, k.id, { tur: 'olay-bilgisi', konu });
          const m = cevapMetni(q.durum.vaka, s.cevap, uslup, bellek);
          expect(m.length).toBeGreaterThan(3);
          expect(m).not.toMatch(/undefined|\[object|NaN/);
        }
      }
    }
  });

  it('oda iddiası olan cevaplar odanın adını çekimli olarak içerir; "bilmiyorum" cevapları oda adı içermez', () => {
    for (const q of sorgular.slice(0, 20)) {
      for (const k of q.durum.vaka.kisiler) {
        if (!k.hayatta) continue;
        const uslup = uslupUret(q.durum.vaka, k.id);
        for (let d = 0; d < q.durum.vaka.dilimler.length; d += 2) {
          const s = sor(q, k.id, { tur: 'konum', hedef: k.id, dilim: d });
          const m = cevapMetni(q.durum.vaka, s.cevap, uslup, new VaryantBellegi());
          if (s.cevap.icerik) expect(m).toContain(odaAdi(q, s.cevap.icerik));
        }
        const baska = q.durum.vaka.kisiler.find((x) => x.id !== k.id)!;
        const s2 = sor(q, k.id, { tur: 'konum', hedef: baska.id, dilim: 2 });
        const m2 = cevapMetni(q.durum.vaka, s2.cevap, uslup, new VaryantBellegi());
        if (s2.cevap.icerik === null) for (const o of q.durum.vaka.mekan.odalar) expect(m2).not.toContain(o.ad);
        else expect(m2).toContain(odaAdi(q, s2.cevap.icerik));
        if (s2.cevap.icerik !== null) expect(m2).toContain(ilkAd(q, baska.id));
      }
    }
  });

  it('yalan içeren cevapların metni gizli etiketi ele vermez', () => {
    for (const q of sorgular) {
      for (const k of q.durum.vaka.kisiler) {
        if (!k.hayatta) continue;
        const uslup = uslupUret(q.durum.vaka, k.id);
        const s = sor(q, k.id, { tur: 'konum', hedef: k.id, dilim: q.durum.vaka.olay.dilim });
        if (!YALAN_IFADE_TURLERI.has(s.cevap.ifadeTuru)) continue;
        const m = cevapMetni(q.durum.vaka, s.cevap, uslup, new VaryantBellegi()).toLocaleLowerCase('tr');
        expect(m).not.toMatch(/yalan|gizl|koru|sakl|fail|gömülü|kaçamak/);
      }
    }
  });

  it('doğru konum cevabı zaman çizelgesindeki eylemi anlatır; olay bilgisi cevapları yöntem/isim içerir', () => {
    let eylemli = 0, yontemli = 0, isimli = 0;
    for (const q of sorgular) {
      for (const k of q.durum.vaka.kisiler) {
        if (!k.hayatta) continue;
        const uslup = uslupUret(q.durum.vaka, k.id);
        const s = sor(q, k.id, { tur: 'konum', hedef: k.id, dilim: 0 });
        if (s.cevap.ifadeTuru === 'dogru' && s.cevap.icerik) {
          const eylem = q.durum.vaka.zamanCizelgesi.find((z) => z.kisi === k.id && z.dilim === 0)!.eylem;
          const m = cevapMetni(q.durum.vaka, s.cevap, uslup, new VaryantBellegi());
          if (m.toLocaleLowerCase('tr').includes(eylem.split(' ')[0]!.toLocaleLowerCase('tr'))) eylemli++;
        }
        const y = sor(q, k.id, { tur: 'olay-bilgisi', konu: 'olay-yontemi' });
        if (y.cevap.icerik) { yontemli++; expect(cevapMetni(q.durum.vaka, y.cevap, uslup, new VaryantBellegi())).toContain(y.cevap.icerik); }
        const f = sor(q, k.id, { tur: 'olay-bilgisi', konu: 'fail-kimligi' });
        if (f.cevap.icerik) { isimli++; expect(cevapMetni(q.durum.vaka, f.cevap, uslup, new VaryantBellegi())).toContain(ilkAd(q, f.cevap.icerik)); }
      }
    }
    expect(eylemli).toBeGreaterThan(50);
    expect(yontemli).toBeGreaterThan(10);
    expect(isimli).toBeGreaterThan(3);
  });

  it('dolgu sözcükleri: yüksek dolgu üslubunda metinlerin bir kısmı dolguyla başlar, sıfır dolguda hiç', () => {
    const q = sorgular[0]!;
    const k = q.durum.vaka.kisiler.find((x) => x.hayatta)!;
    const temel = uslupUret(q.durum.vaka, k.id);
    const yuksek: KisiUslubu = { ...temel, dolguOlasiligi: 1, dolguSozcukleri: ['Açıkçası'] };
    const sifir: KisiUslubu = { ...temel, dolguOlasiligi: 0 };
    let dolgulu = 0;
    for (let d = 0; d < q.durum.vaka.dilimler.length; d++) {
      const s = sor(q, k.id, { tur: 'konum', hedef: k.id, dilim: d });
      if (cevapMetni(q.durum.vaka, s.cevap, yuksek, new VaryantBellegi()).startsWith('Açıkçası')) dolgulu++;
      expect(cevapMetni(q.durum.vaka, s.cevap, sifir, new VaryantBellegi()).startsWith('Açıkçası')).toBe(false);
    }
    expect(dolgulu).toBe(q.durum.vaka.dilimler.length);
  });

  it('varyant belleği: aynı kişiden art arda aynı türde cevaplar ardışık aynı kalıbı kullanmaz', () => {
    const q = sorgular[1]!;
    const k = q.durum.vaka.kisiler.find((x) => x.hayatta && x.id !== q.durum.vaka.olay.fail)!;
    const uslup = { ...uslupUret(q.durum.vaka, k.id), dolguOlasiligi: 0 };
    const bellek = new VaryantBellegi();
    const metinler: string[] = [];
    for (let d = 0; d < q.durum.vaka.dilimler.length; d++) {
      const s = sor(q, k.id, { tur: 'konum', hedef: k.id, dilim: d });
      if (s.cevap.ifadeTuru !== 'dogru') continue;
      metinler.push(cevapMetni(q.durum.vaka, s.cevap, uslup, bellek));
    }
    // Aynı kalıp = oda/eylem/saat dışındaki iskelet; kaba ölçüt: ardışık iki metnin ilk üç kelimesi aynı olmasın
    for (let i = 1; i < metinler.length; i++) {
      const a = metinler[i - 1]!.split(' ').slice(0, 2).join(' ');
      const b = metinler[i]!.split(' ').slice(0, 2).join(' ');
      if (a === b) expect(metinler[i]).not.toBe(metinler[i - 1]);
    }
    expect(metinler.length).toBeGreaterThan(2);
  });
});

describe('betimlemeMetni / vakaBrifingi / kisiKarti', () => {
  it('betimleme: gözlem yoksa boş metin, varsa katalog cümleleri birleşir', () => {
    const q = sorgular[2]!;
    const k = q.durum.vaka.kisiler.find((x) => x.hayatta)!;
    const s = sor(q, k.id, { tur: 'konum', hedef: k.id, dilim: q.durum.vaka.olay.dilim });
    const m = betimlemeMetni(s.ipuclari);
    if (s.ipuclari.length === 0) expect(m).toBe('');
    else for (const g of s.ipuclari) expect(m).toContain(g.betimleme);
  });

  it('brifing mekân adını, kurban adını ve olay türünü içerir; kişi kartı rol ve yaş içerir', () => {
    for (const q of sorgular.slice(0, 20)) {
      const v = q.durum.vaka;
      const b = vakaBrifingi(v);
      expect(b).toContain(v.mekan.ad);
      expect(b).toContain(v.kisiler.find((k) => k.id === v.olay.kurban)!.ad);
      expect(b).not.toMatch(/undefined|\[object/);
      if (v.olay.fail) expect(b).not.toContain(v.kisiler.find((k) => k.id === v.olay.fail)!.ad.split(' ')[0]);
      for (const k of v.kisiler) {
        const kart = kisiKarti(v, k.id);
        expect(kart).toContain(k.ad);
        expect(kart).toContain(String(k.yas));
        if (k.id !== v.olay.kurban) expect(kart).toContain(k.rol);
      }
    }
  });

  it('teknik sonucu için metinler: SUE çelişkisi delil açıklamasını gösterir (oyuncuya sunum)', () => {
    const q = sorgular[3]!;
    const f = q.durum.vaka.olay.fail;
    if (!f) return;
    const delil = q.deliller.find((d) => d.gosterir.tur === 'konum' && d.gosterir.kisi === f && d.gosterir.dilim === q.durum.vaka.olay.dilim)!;
    const sonuc = teknikUygula(q, f, 'sue', { delilId: delil.id });
    if (sonuc.teknik === 'sue') expect(sonuc.delil.aciklama.length).toBeGreaterThan(0);
  });
});
