// Doğruluk grafiği ("önce gerçek") testleri.
// Vaka üreticisinin ilk katmanı: mekân, kişiler, ilişki/borç grafiği, olay çekirdeği ve
// gerçek zaman çizelgesi. Buradaki "gerçek", ifadelerden ÖNCE ve onlardan bağımsız üretilir;
// sonraki katmanlar (bilgi dağılımı, ifadeler, ipuçları) bunun üstüne kurulur.
import { describe, it, expect } from 'vitest';
import { vakaUret, DILIM_SAYISI } from '@motor/gerceklik';
import type { Vaka } from '@motor/tipler';

const ornek = (seed: number | string): Vaka => vakaUret(seed);

describe('vakaUret — tekrar üretilebilirlik', () => {
  it('aynı seed birebir aynı vakayı üretir', () => {
    expect(ornek('deniz-feneri')).toEqual(ornek('deniz-feneri'));
    expect(ornek(1234)).toEqual(ornek(1234));
  });

  it('farklı seed farklı vaka üretir', () => {
    const a = ornek(1);
    const b = ornek(2);
    expect(a).not.toEqual(b);
  });

  it('vaka seed bilgisini taşır', () => {
    expect(ornek('x').seed).toBe('x');
    expect(ornek(9).seed).toBe('9');
  });
});

describe('vakaUret — yapısal tutarlılık', () => {
  const seedler = Array.from({ length: 60 }, (_, i) => `yapi-${i}`);

  it('5–8 kişi, benzersiz id ve ad', () => {
    for (const s of seedler) {
      const v = ornek(s);
      expect(v.kisiler.length).toBeGreaterThanOrEqual(5);
      expect(v.kisiler.length).toBeLessThanOrEqual(8);
      const idler = v.kisiler.map((k) => k.id);
      const adlar = v.kisiler.map((k) => k.ad);
      expect(new Set(idler).size).toBe(idler.length);
      expect(new Set(adlar).size).toBe(adlar.length);
    }
  });

  it('kişilik parametreleri 0–1 aralığında', () => {
    for (const s of seedler.slice(0, 20)) {
      for (const k of ornek(s).kisiler) {
        for (const deger of Object.values(k.kisilik)) {
          expect(deger).toBeGreaterThanOrEqual(0);
          expect(deger).toBeLessThanOrEqual(1);
        }
        expect(k.yalanBecerisi).toBeGreaterThanOrEqual(0);
        expect(k.yalanBecerisi).toBeLessThanOrEqual(1);
        expect(k.yas).toBeGreaterThanOrEqual(16);
      }
    }
  });

  it('mekân seçildi, en az 4 odası var ve zaman çizelgesindeki her oda mekânda tanımlı', () => {
    for (const s of seedler.slice(0, 20)) {
      const v = ornek(s);
      expect(v.mekan.odalar.length).toBeGreaterThanOrEqual(4);
      const odaIdler = new Set(v.mekan.odalar.map((o) => o.id));
      for (const konum of v.zamanCizelgesi) expect(odaIdler.has(konum.oda), `${s}: ${konum.oda}`).toBe(true);
    }
  });

  it('kurban kişilerden biri; fail (varsa) kurbandan farklı ve kişilerden biri', () => {
    for (const s of seedler) {
      const v = ornek(s);
      const idler = new Set(v.kisiler.map((k) => k.id));
      expect(idler.has(v.olay.kurban)).toBe(true);
      if (v.olay.fail !== null) {
        expect(idler.has(v.olay.fail)).toBe(true);
        expect(v.olay.fail).not.toBe(v.olay.kurban);
      }
    }
  });

  it('cinayette kurban hayatta değil; diğer olay türlerinde hayatta', () => {
    for (const s of seedler) {
      const v = ornek(s);
      const kurban = v.kisiler.find((k) => k.id === v.olay.kurban)!;
      if (v.olay.tur === 'cinayet') expect(kurban.hayatta).toBe(false);
      else expect(kurban.hayatta).toBe(true);
      // Kurban dışında herkes hayatta (görüşülebilir)
      for (const k of v.kisiler) if (k.id !== v.olay.kurban) expect(k.hayatta).toBe(true);
    }
  });

  it('her kişi her zaman diliminde tam olarak bir yerde', () => {
    for (const s of seedler) {
      const v = ornek(s);
      for (const k of v.kisiler) {
        for (let d = 0; d < DILIM_SAYISI; d++) {
          const kayitlar = v.zamanCizelgesi.filter((z) => z.kisi === k.id && z.dilim === d);
          expect(kayitlar.length, `${s}: ${k.id} dilim ${d}`).toBe(1);
        }
      }
    }
  });

  it('olay anında kurban olay odasında; fail varsa o da orada', () => {
    for (const s of seedler) {
      const v = ornek(s);
      const nerede = (kisi: string) => v.zamanCizelgesi.find((z) => z.kisi === kisi && z.dilim === v.olay.dilim)!.oda;
      expect(nerede(v.olay.kurban)).toBe(v.olay.oda);
      if (v.olay.fail) expect(nerede(v.olay.fail)).toBe(v.olay.oda);
    }
  });

  it('cinayet sonrası kurbanın konumu olay odasında sabit kalır (ceset yer değiştirmez)', () => {
    for (const s of seedler) {
      const v = ornek(s);
      if (v.olay.tur !== 'cinayet') continue;
      for (let d = v.olay.dilim; d < DILIM_SAYISI; d++) {
        const z = v.zamanCizelgesi.find((x) => x.kisi === v.olay.kurban && x.dilim === d)!;
        expect(z.oda).toBe(v.olay.oda);
      }
    }
  });

  it('ilişkiler ve borçlar geçerli kişilere işaret eder; kimse kendisiyle ilişkili değil', () => {
    for (const s of seedler) {
      const v = ornek(s);
      const idler = new Set(v.kisiler.map((k) => k.id));
      for (const i of v.iliskiler) {
        expect(idler.has(i.a) && idler.has(i.b)).toBe(true);
        expect(i.a).not.toBe(i.b);
      }
      for (const b of v.borclar) {
        expect(idler.has(b.alacakli) && idler.has(b.borclu)).toBe(true);
        expect(b.alacakli).not.toBe(b.borclu);
      }
    }
  });

  it('her kişinin kurbanla en az bir ilişkisi var (vakada yeri olsun)', () => {
    for (const s of seedler) {
      const v = ornek(s);
      for (const k of v.kisiler) {
        if (k.id === v.olay.kurban) continue;
        const bagli = v.iliskiler.some((i) => (i.a === k.id && i.b === v.olay.kurban) || (i.b === k.id && i.a === v.olay.kurban));
        expect(bagli, `${s}: ${k.ad} kurbanla ilişkisiz`).toBe(true);
      }
    }
  });

  it('fail varsa motivasyonu var; olay türü tanımlı listeden', () => {
    for (const s of seedler) {
      const v = ornek(s);
      expect(['cinayet', 'hirsizlik', 'sabotaj', 'kaza']).toContain(v.olay.tur);
      if (v.olay.fail) expect(v.olay.motivasyon.length).toBeGreaterThan(0);
      else expect(v.olay.tur).toBe('kaza');
    }
  });
});

describe('vakaUret — örüntü denetimi (kalıp yok)', () => {
  // Oyuncunun meta-tahminle faili bulmasını engellemek için failin yüzeysel özelliklerle
  // istatistiksel ilişkisi olmamalı. 600 seed ile kaba bir kontrol; tam denetçi Aşama 1'de.
  const N = 600;
  const vakalar = Array.from({ length: N }, (_, i) => ornek(`oruntu-${i}`)).filter((v) => v.olay.fail !== null);

  it('failin listedeki sırası düzgün dağılır (ilk/son kişi tuzağı yok)', () => {
    const konumSayac = new Map<number, number>();
    for (const v of vakalar) {
      const idx = v.kisiler.findIndex((k) => k.id === v.olay.fail);
      // Kurban sıralamadan çıkarılır; kalanlar arasında oransal konum
      const adaylar = v.kisiler.filter((k) => k.id !== v.olay.kurban);
      const oran = Math.floor((adaylar.findIndex((k) => k.id === v.olay.fail) / adaylar.length) * 4); // 4 kova
      expect(idx).toBeGreaterThanOrEqual(0);
      konumSayac.set(oran, (konumSayac.get(oran) ?? 0) + 1);
    }
    for (let kova = 0; kova < 4; kova++) {
      const pay = (konumSayac.get(kova) ?? 0) / vakalar.length;
      expect(pay, `kova ${kova}`).toBeGreaterThan(0.15);
      expect(pay, `kova ${kova}`).toBeLessThan(0.35);
    }
  });

  it('failin kaygı ve dışadönüklük ortalaması masumlarınkinden anlamlı farklı değil', () => {
    let failKaygi = 0, masumKaygi = 0, failDisa = 0, masumDisa = 0, masumSayi = 0;
    for (const v of vakalar) {
      for (const k of v.kisiler) {
        if (k.id === v.olay.kurban) continue;
        if (k.id === v.olay.fail) { failKaygi += k.kisilik.kaygi; failDisa += k.kisilik.disadonukluk; }
        else { masumKaygi += k.kisilik.kaygi; masumDisa += k.kisilik.disadonukluk; masumSayi++; }
      }
    }
    expect(Math.abs(failKaygi / vakalar.length - masumKaygi / masumSayi)).toBeLessThan(0.05);
    expect(Math.abs(failDisa / vakalar.length - masumDisa / masumSayi)).toBeLessThan(0.05);
  });

  it('fail her ilişki türünden gelebilir; tek bir tür baskın değil', () => {
    const turSayac = new Map<string, number>();
    for (const v of vakalar) {
      const iliski = v.iliskiler.find((i) => (i.a === v.olay.fail && i.b === v.olay.kurban) || (i.b === v.olay.fail && i.a === v.olay.kurban))!;
      turSayac.set(iliski.tur, (turSayac.get(iliski.tur) ?? 0) + 1);
    }
    expect(turSayac.size).toBeGreaterThanOrEqual(4);
    for (const [tur, n] of turSayac) expect(n / vakalar.length, tur).toBeLessThan(0.5);
  });

  it('suçsuz vaka (kaza) da üretilir ama azınlıktadır', () => {
    const hepsi = Array.from({ length: N }, (_, i) => ornek(`oruntu-${i}`));
    const kazaOrani = hepsi.filter((v) => v.olay.fail === null).length / N;
    expect(kazaOrani).toBeGreaterThan(0.03);
    expect(kazaOrani).toBeLessThan(0.25);
  });
});
