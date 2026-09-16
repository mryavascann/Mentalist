// Zor seviye kararı (K-017, kullanıcı 16.09.2026): "gerçek hayatta nasılsa öyle olsun, zorlasın ki öğretsin."
//   (a) Olay odasında bulunan masumlar da iz bırakır → şüpheli kümesi büyür (olay yerinde iz bırakan tek kişi fail değildir).
//   (b) Gizli bilgi testinde bilen kişi (fail dahil) ayrıntıyı her zaman tanımaz → CIT tek başına karar verdirmez.
//   Her iki karar da ayrı RNG akışından beslenir: orta seviyenin ana akışı ve regresyon seed'leri değişmez.
import { describe, it, expect } from 'vitest';
import { vakaUret } from '@motor/gerceklik';
import { bilgiDagit, kimBiliyor } from '@motor/bilgi';
import { delilUret } from '@motor/delil';
import { sorguBaslat, teknikUygula } from '@motor/teknik';
import { ZORLUK_PARAMETRELERI, type Zorluk } from '@motor/tipler';

const N = 200;
const seedler = Array.from({ length: N }, (_, i) => `zor-${i}`);
const ZORLUKLAR: Zorluk[] = ['kolay', 'orta', 'zor'];

/** Olay odasında olay anına ait konum delili olan hayatta kişi sayısı (fail dahil). */
function olayOdasiIzliler(zorluk: Zorluk) {
  let toplam = 0, suc = 0, cok = 0;
  for (const s of seedler) {
    const v = vakaUret(s, { zorluk });
    if (!v.olay.fail) continue;
    suc++;
    const deliller = delilUret(v, bilgiDagit(v));
    const izli = new Set(deliller.filter((d) => d.gosterir.tur === 'konum' && d.gosterir.dilim === v.olay.dilim && d.gosterir.oda === v.olay.oda && !d.sahnelenmis).map((d) => (d.gosterir as { kisi: string }).kisi));
    toplam += izli.size;
    if (izli.size > 1) cok++;
  }
  return { ort: toplam / suc, cokOrani: cok / suc };
}

/** Yöntemi bilenlerin (fail dahil) gizli bilgi testinde tanıma tepkisi verme oranı. */
function citTanima(zorluk: Zorluk) {
  let n = 0, tanima = 0;
  for (const s of seedler) {
    const v = vakaUret(s, { zorluk });
    if (!v.olay.fail) continue;
    const q = sorguBaslat(v);
    for (const k of kimBiliyor(q.durum.dagilim, 'olay-yontemi')) {
      if (!v.kisiler.find((x) => x.id === k)!.hayatta) continue;
      const c = teknikUygula(q, k, 'gizli-bilgi-testi', { konu: 'olay-yontemi' });
      if (c.teknik !== 'gizli-bilgi-testi') continue;
      n++;
      if (c.tepki === 'tanima') tanima++;
    }
  }
  return tanima / n;
}

describe('zor seviye — olay odasında masum izi (K-017a)', () => {
  const o = Object.fromEntries(ZORLUKLAR.map((z) => [z, olayOdasiIzliler(z)])) as Record<Zorluk, ReturnType<typeof olayOdasiIzliler>>;

  it('parametreler kolay < orta < zor; kolayda hiç', () => {
    expect(ZORLUK_PARAMETRELERI.kolay.olayOdasiMasumIzi).toBe(0);
    expect(ZORLUK_PARAMETRELERI.orta.olayOdasiMasumIzi).toBeLessThan(ZORLUK_PARAMETRELERI.zor.olayOdasiMasumIzi);
    expect(ZORLUK_PARAMETRELERI.zor.ikinciMasumIzi).toBeGreaterThan(0);
  });

  it('olay odasında izi olan kişi sayısı ortalaması kolay < orta < zor; zorda vakaların yarısından fazlasında birden çok şüpheli', () => {
    expect(o.kolay.ort).toBeLessThan(o.orta.ort);
    expect(o.orta.ort).toBeLessThan(o.zor.ort);
    expect(o.zor.cokOrani).toBeGreaterThan(0.5);
    expect(o.zor.ort).toBeGreaterThan(1.6);
  });

  it('fail her seviyede olay odasında iz bırakır (çözülebilirlik tohumu korunur)', () => {
    for (const s of seedler.slice(0, 60)) {
      const v = vakaUret(s, { zorluk: 'zor' });
      if (!v.olay.fail) continue;
      const deliller = delilUret(v, bilgiDagit(v));
      expect(deliller.some((d) => d.gosterir.tur === 'konum' && d.gosterir.kisi === v.olay.fail && d.gosterir.dilim === v.olay.dilim && d.gosterir.oda === v.olay.oda)).toBe(true);
      // Masum izi gerçek konumdan: masumun izi olay odasındaysa gerçekten oradaydı (sahnelenmiş hariç).
      for (const d of deliller) {
        if (d.gosterir.tur !== 'konum' || d.sahnelenmis) continue;
        const gercek = v.zamanCizelgesi.find((z) => z.kisi === (d.gosterir as { kisi: string }).kisi && z.dilim === (d.gosterir as { dilim: number }).dilim)!.oda;
        expect(d.gosterir.oda).toBe(gercek);
      }
    }
  });
});

describe('zor seviye — gizli bilgi testinde tanımama payı (K-017b)', () => {
  // Oran tasarım varsayımıdır: CIT ayrıntının kodlanmış olmasına bağlıdır (Vrij & Verschuere 2014 derlemesi);
  // suçlu isabet sayısı kaynak kütüğünde doğrulanmadı (DURUM.md'ye not düşüldü).
  it('tanıma oranı zor < orta ≤ kolay; zorda 0.55–0.85 aralığında', () => {
    const kolay = citTanima('kolay');
    const orta = citTanima('orta');
    const zor = citTanima('zor');
    expect(zor).toBeLessThan(orta);
    expect(orta).toBeLessThanOrEqual(kolay + 0.02);
    expect(zor).toBeGreaterThan(0.55);
    expect(zor).toBeLessThan(0.85);
  });
});
