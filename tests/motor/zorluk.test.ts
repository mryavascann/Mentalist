// Zorluk ayarı ve zorlaştırıcılar (Aşama 3).
// kolay / orta / zor: sızıntı oranı, failin kaçamak eşiği, korkuyla susan görgü tanığı, sahnelenmiş delil.
// "orta" mevcut davranışı korur; "zor" metodik oyuncuyu bile zorlar ama vaka yine çözülebilir kalır.
import { describe, it, expect } from 'vitest';
import { vakaUret } from '@motor/gerceklik';
import { bilgiDagit } from '@motor/bilgi';
import { sirlarUret } from '@motor/sirlar';
import { vakaDurumuKur, cevapla } from '@motor/strateji';
import { delilUret, celisenDeliller, sahnelenmisMi } from '@motor/delil';
import { sorguBaslat } from '@motor/teknik';
import { vakaUretCozulebilir, cozulebilirlikDenetle } from '@motor/cozulebilirlik';
import { yontemBotu } from '@motor/botlar';
import { puanla } from '@motor/puan';
import type { Zorluk } from '@motor/tipler';

const N = 150;
const seedler = Array.from({ length: N }, (_, i) => `zorluk-${i}`);
const ZORLUKLAR: Zorluk[] = ['kolay', 'orta', 'zor'];

function olcumler(zorluk: Zorluk) {
  let suc = 0, sizan = 0, kacamak = 0, korku = 0, sahnelenmis = 0;
  for (const s of seedler) {
    const v = vakaUret(s, { zorluk });
    if (!v.olay.fail) continue;
    suc++;
    const d = bilgiDagit(v);
    if (d.medyayaSizanKonular.includes('olay-yontemi')) sizan++;
    const durum = vakaDurumuKur(v);
    const c = cevapla(durum, v.olay.fail, { tur: 'konum', hedef: v.olay.fail, dilim: v.olay.dilim });
    if (c.ifadeTuru === 'kacamak') kacamak++;
    if (sirlarUret(v).korumalar.some((k) => k.neden === 'korku')) korku++;
    if (delilUret(v, d).some((x) => x.sahnelenmis)) sahnelenmis++;
  }
  return { suc, sizan: sizan / suc, kacamak: kacamak / suc, korku: korku / suc, sahnelenmis: sahnelenmis / suc };
}

describe('zorluk ayarı — üretim', () => {
  const o = Object.fromEntries(ZORLUKLAR.map((z) => [z, olcumler(z)])) as Record<Zorluk, ReturnType<typeof olcumler>>;

  it('ayar vakanın parçasıdır ve deterministiktir; varsayılan orta', () => {
    expect(vakaUret('a').ayar.zorluk).toBe('orta');
    expect(vakaUret('a', { zorluk: 'zor' })).toEqual(vakaUret('a', { zorluk: 'zor' }));
    expect(vakaUret('a', { zorluk: 'zor' }).ayar.zorluk).toBe('zor');
  });

  it('sızıntı oranı kolay < orta < zor', () => {
    expect(o.kolay.sizan).toBeLessThan(o.orta.sizan);
    expect(o.orta.sizan).toBeLessThan(o.zor.sizan);
  });

  it('failin kaçamak oranı kolay < orta < zor', () => {
    expect(o.kolay.kacamak).toBeLessThan(o.orta.kacamak);
    expect(o.orta.kacamak).toBeLessThan(o.zor.kacamak);
    expect(o.zor.kacamak).toBeGreaterThan(0.35);
  });

  it('korkuyla susan tanık: kolayda hiç, zorda sık', () => {
    expect(o.kolay.korku).toBe(0);
    expect(o.zor.korku).toBeGreaterThan(o.orta.korku);
    expect(o.zor.korku).toBeGreaterThan(0.3);
  });

  it('sahnelenmiş delil: kolayda hiç, zorda sık', () => {
    expect(o.kolay.sahnelenmis).toBe(0);
    expect(o.zor.sahnelenmis).toBeGreaterThan(0.4);
    expect(o.zor.sahnelenmis).toBeGreaterThan(o.orta.sahnelenmis);
  });
});

describe('sahnelenmiş delil — Norwood şablonu', () => {
  it('sahnelenmiş delil masumu olay yerinde gösterir; o masumun aynı dilimde GERÇEK bir izi de vardır (fizik tutarsızlığı); sahnelenmisMi çelişen çifti bulur', () => {
    let sayi = 0;
    for (const s of seedler) {
      const v = vakaUret(s, { zorluk: 'zor' });
      if (!v.olay.fail) continue;
      const deliller = delilUret(v, bilgiDagit(v));
      for (const d of deliller.filter((x) => x.sahnelenmis)) {
        sayi++;
        expect(d.gosterir.tur).toBe('konum');
        if (d.gosterir.tur !== 'konum') continue;
        expect(d.gosterir.kisi).not.toBe(v.olay.fail);
        expect(d.gosterir.oda).toBe(v.olay.oda);
        expect(d.gosterir.dilim).toBe(v.olay.dilim);
        const gercek = v.zamanCizelgesi.find((z) => z.kisi === (d.gosterir as { kisi: string }).kisi && z.dilim === v.olay.dilim)!.oda;
        expect(gercek).not.toBe(v.olay.oda);
        const gercekIz = deliller.find((x) => !x.sahnelenmis && x.gosterir.tur === 'konum' && x.gosterir.kisi === (d.gosterir as { kisi: string }).kisi && x.gosterir.dilim === v.olay.dilim);
        expect(gercekIz).toBeDefined();
        expect(sahnelenmisMi(deliller, d.id)).toBe(true);
        expect(sahnelenmisMi(deliller, gercekIz!.id)).toBe(true); // çift olarak şüpheli: hangisi sahte, fizik kontrolü ile
      }
    }
    expect(sayi).toBeGreaterThan(30);
  });

  it('sahnelenmiş delil masumun doğru cevabıyla çelişir (tuzak) ama çelişki hesabı bunu "şüpheli delil" olarak işaretler', () => {
    let tuzak = 0;
    for (const s of seedler) {
      const v = vakaUret(s, { zorluk: 'zor' });
      if (!v.olay.fail) continue;
      const q = sorguBaslat(v);
      const sahte = q.deliller.find((x) => x.sahnelenmis);
      if (!sahte || sahte.gosterir.tur !== 'konum') continue;
      const masum = sahte.gosterir.kisi;
      const c = cevapla(q.durum, masum, { tur: 'konum', hedef: masum, dilim: v.olay.dilim });
      if (!c.dogru || c.icerik === null) continue;
      const celisenler = celisenDeliller(q.deliller, c);
      expect(celisenler.some((x) => x.id === sahte.id)).toBe(true);
      tuzak++;
    }
    expect(tuzak).toBeGreaterThan(20);
  });
});

describe('zorluk — çözülebilirlik ve botlar', () => {
  it('zor vakalar da vakaUretCozulebilir ile çözülebilir kalır; ortalama zorluk puanı kolaydan yüksek', () => {
    let kolayZ = 0, zorZ = 0, n = 0, deneme = 0;
    for (const s of seedler.slice(0, 60)) {
      const k = vakaUretCozulebilir(s, 10, { zorluk: 'kolay' });
      const z = vakaUretCozulebilir(s, 10, { zorluk: 'zor' });
      expect(k.rapor.cozulebilir).toBe(true);
      expect(z.rapor.cozulebilir).toBe(true);
      expect(k.vaka.ayar.zorluk).toBe('kolay');
      expect(z.vaka.ayar.zorluk).toBe('zor');
      if (k.vaka.olay.fail && z.vaka.olay.fail) { kolayZ += k.rapor.zorluk; zorZ += z.rapor.zorluk; n++; }
      deneme += z.deneme;
    }
    expect(zorZ / n).toBeGreaterThan(kolayZ / n);
    expect(deneme / 60).toBeLessThan(3);
  });

  it('cozulebilirlikDenetle sahnelenmiş delili sinyal olarak kullanmaz (masuma çelişki puanı vermez)', () => {
    for (const s of seedler.slice(0, 80)) {
      const v = vakaUret(s, { zorluk: 'zor' });
      if (!v.olay.fail) continue;
      const q = sorguBaslat(v);
      const sahte = q.deliller.find((x) => x.sahnelenmis);
      if (!sahte || sahte.gosterir.tur !== 'konum') continue;
      const r = cozulebilirlikDenetle(q);
      expect(r.sinyaller.some((x) => x.tur === 'delil-celiskisi' && x.hedef === (sahte.gosterir as { kisi: string }).kisi)).toBe(false);
    }
  });

  it('yöntem botu zorda hâlâ iyi (>%65) ve masumu nadiren suçlar (<%20); kolayda daha iyi', () => {
    const kos = (zorluk: Zorluk) => {
      let dogru = 0, masum = 0;
      for (const s of seedler.slice(0, 100)) {
        const { vaka } = vakaUretCozulebilir(s, 10, { zorluk });
        const q = sorguBaslat(vaka);
        const su = yontemBotu(q);
        if (puanla(q, su).dogru) dogru++;
        if (su.fail && su.fail !== vaka.olay.fail) masum++;
      }
      return { dogru: dogru / 100, masum: masum / 100 };
    };
    const kolay = kos('kolay');
    const zor = kos('zor');
    expect(zor.dogru).toBeGreaterThan(0.65);
    expect(zor.masum).toBeLessThan(0.2);
    expect(kolay.dogru).toBeGreaterThanOrEqual(zor.dogru);
  });

  it('sahnelenmiş delile kanıp masumu suçlayan oyuncu "delil-sorgulanmadi" etiketi alır', () => {
    let bulundu = false;
    for (const s of seedler) {
      const v = vakaUret(s, { zorluk: 'zor' });
      if (!v.olay.fail) continue;
      const q = sorguBaslat(v);
      const sahte = q.deliller.find((x) => x.sahnelenmis);
      if (!sahte || sahte.gosterir.tur !== 'konum') continue;
      bulundu = true;
      const r = puanla(q, { fail: sahte.gosterir.kisi, guven: 0.7, gerekce: [`delil:${sahte.id}`] });
      expect(r.hataEtiketleri).toContain('delil-sorgulanmadi');
      break;
    }
    expect(bulundu).toBe(true);
  });
});
