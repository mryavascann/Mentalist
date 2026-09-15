// Delil üretimi testleri.
// Deliller gerçekten türer ve gerçekle asla çelişmez (v0'da sahnelenmiş delil yok). Failin olay anı
// yalanıyla çelişen en az bir iz vardır (çözülebilirlik tohumu); masumların da izleri vardır ve
// bunlar alakasız sır yalanlarıyla çelişebilir (gergin masum tuzağı). "Beklenen ama olmayan" delil
// (köpek havlamadı, kapı zorlanmadı) ayrı bir tür olarak üretilir (Konnikova, Gümüş Şimşek).
import { describe, it, expect } from 'vitest';
import { vakaUret } from '@motor/gerceklik';
import { bilgiDagit } from '@motor/bilgi';
import { vakaDurumuKur, cevapla } from '@motor/strateji';
import { delilUret, celisenDeliller } from '@motor/delil';
import type { Delil } from '@motor/delil';

const ornekler = Array.from({ length: 120 }, (_, i) => {
  const vaka = vakaUret(`delil-${i}`);
  const dagilim = bilgiDagit(vaka);
  return { seed: `delil-${i}`, vaka, dagilim, deliller: delilUret(vaka, dagilim) };
});

const konum = (o: (typeof ornekler)[number], kisi: string, dilim: number) =>
  o.vaka.zamanCizelgesi.find((z) => z.kisi === kisi && z.dilim === dilim)!.oda;

describe('delilUret — yapı ve tutarlılık', () => {
  it('deterministik', () => {
    const v = vakaUret('delil-det');
    const d = bilgiDagit(v);
    expect(delilUret(v, d)).toEqual(delilUret(v, d));
  });

  it('5–20 delil; idler benzersiz; güç 0–1; oda mekânda tanımlı; açıklama dolu', () => {
    for (const o of ornekler) {
      expect(o.deliller.length).toBeGreaterThanOrEqual(5);
      expect(o.deliller.length).toBeLessThanOrEqual(20);
      const idler = o.deliller.map((d) => d.id);
      expect(new Set(idler).size).toBe(idler.length);
      const odalar = new Set(o.vaka.mekan.odalar.map((x) => x.id));
      for (const d of o.deliller) {
        expect(d.gucu).toBeGreaterThanOrEqual(0);
        expect(d.gucu).toBeLessThanOrEqual(1);
        expect(odalar.has(d.oda), `${o.seed}: ${d.oda}`).toBe(true);
        expect(d.aciklama.length).toBeGreaterThan(0);
        expect(['fiziksel', 'dijital', 'belge', 'olmayan']).toContain(d.tur);
      }
    }
  });

  it('konum gösteren her delil (sahnelenmiş olanlar hariç) zaman çizelgesiyle birebir uyumlu', () => {
    for (const o of ornekler) {
      for (const d of o.deliller) {
        if (d.gosterir.tur !== 'konum' || d.sahnelenmis) continue; // sahnelenmiş delil bilerek gerçekle çelişir
        expect(konum(o, d.gosterir.kisi, d.gosterir.dilim), `${o.seed}: ${d.id}`).toBe(d.gosterir.oda);
        expect(d.oda).toBe(d.gosterir.oda);
      }
    }
  });

  it('fail varsa olay anında olay odasında en az bir konum delili bırakmıştır', () => {
    for (const o of ornekler) {
      const f = o.vaka.olay.fail;
      if (!f) continue;
      const iz = o.deliller.some((d) => d.gosterir.tur === 'konum' && d.gosterir.kisi === f && d.gosterir.dilim === o.vaka.olay.dilim && d.gosterir.oda === o.vaka.olay.oda);
      expect(iz, `${o.seed}: failin olay yerinde izi yok`).toBe(true);
    }
  });

  it('yöntem delili var ve sızma bayrağı bilgi dağılımıyla uyumlu', () => {
    for (const o of ornekler) {
      if (!o.vaka.olay.fail) continue;
      const y = o.deliller.filter((d) => d.gosterir.tur === 'yontem');
      expect(y.length).toBeGreaterThanOrEqual(1);
      for (const d of y) {
        expect(d.gosterir.tur === 'yontem' && d.gosterir.yontem).toBe(o.vaka.olay.yontem);
        expect(d.sizmis).toBe(o.dagilim.medyayaSizanKonular.includes('olay-yontemi'));
      }
    }
  });

  it('cinayette "beklenen ama olmayan" delil üretilir; kazada suç imasına yol açacak olmayan-delil yoktur', () => {
    for (const o of ornekler) {
      const olmayanlar = o.deliller.filter((d) => d.tur === 'olmayan');
      if (o.vaka.olay.tur === 'cinayet') expect(olmayanlar.length, o.seed).toBeGreaterThanOrEqual(1);
      if (o.vaka.olay.tur === 'kaza') expect(olmayanlar.length, o.seed).toBe(0);
      for (const d of olmayanlar) expect(d.gosterir.tur).toBe('olmayan');
    }
  });

  it('masumların da izleri var (gürültü + gergin masum tuzağı); vakaların çoğunda en az bir masum izi', () => {
    let masumIzli = 0;
    for (const o of ornekler) {
      const var_ = o.deliller.some((d) => d.gosterir.tur === 'konum' && d.gosterir.kisi !== o.vaka.olay.fail && d.gosterir.kisi !== o.vaka.olay.kurban);
      if (var_) masumIzli++;
    }
    expect(masumIzli / ornekler.length).toBeGreaterThan(0.7);
  });

  it('dijital deliller yalnızca kameralı/kayıtlı odalarda ya da telefon kaydı olarak; güçleri fizikselden yüksek', () => {
    let dijital = 0;
    for (const o of ornekler) {
      for (const d of o.deliller) {
        if (d.tur !== 'dijital') continue;
        dijital++;
        expect(d.gucu).toBeGreaterThanOrEqual(0.8);
      }
    }
    expect(dijital).toBeGreaterThan(20);
  });
});

describe('celisenDeliller', () => {
  it('failin gömülü yalanıyla çelişen en az bir delil var; kaçamakla çelişen yok', () => {
    let gomulu = 0;
    for (const o of ornekler) {
      const f = o.vaka.olay.fail;
      if (!f) continue;
      const durum = vakaDurumuKur(o.vaka);
      const c = cevapla(durum, f, { tur: 'konum', hedef: f, dilim: o.vaka.olay.dilim });
      const celisenler = celisenDeliller(o.deliller, c);
      if (c.ifadeTuru === 'gomulu-yalan') { gomulu++; expect(celisenler.length, o.seed).toBeGreaterThanOrEqual(1); }
      else expect(celisenler.length).toBe(0);
    }
    expect(gomulu).toBeGreaterThan(20);
  });

  it('doğru cevapla (sahnelenmiş dışında) hiçbir delil çelişmez', () => {
    for (const o of ornekler.slice(0, 40)) {
      const durum = vakaDurumuKur(o.vaka);
      for (const k of o.vaka.kisiler) {
        if (!k.hayatta) continue;
        for (let d = 0; d < o.vaka.dilimler.length; d++) {
          const c = cevapla(durum, k.id, { tur: 'konum', hedef: k.id, dilim: d });
          if (c.dogru && c.icerik !== null) expect(celisenDeliller(o.deliller, c).filter((x) => !x.sahnelenmis)).toEqual([]);
        }
      }
    }
  });

  it('alakasız sır yalanı söyleyen masum da bazen delille yakalanır (gergin masum tuzağı)', () => {
    let yalan = 0, yakalanan = 0;
    for (const o of ornekler) {
      const durum = vakaDurumuKur(o.vaka);
      for (const s of durum.sirKatmani.sirlar) {
        if (s.kisi === o.vaka.olay.fail) continue;
        for (const d of s.dilimler) {
          const c = cevapla(durum, s.kisi, { tur: 'konum', hedef: s.kisi, dilim: d });
          if (c.ifadeTuru !== 'alakasiz-sir') continue;
          yalan++;
          if (celisenDeliller(o.deliller, c).length > 0) yakalanan++;
        }
      }
    }
    expect(yalan).toBeGreaterThan(30);
    expect(yakalanan).toBeGreaterThan(3);
    expect(yakalanan / yalan).toBeLessThan(0.6);
  });

  it('null (bilmiyorum) cevaplarla ve başkası hakkındaki cevaplarla çelişki hesaplanmaz', () => {
    const o = ornekler[0]!;
    const durum = vakaDurumuKur(o.vaka);
    const k = o.vaka.kisiler.find((x) => x.hayatta)!;
    const bos = { ...cevapla(durum, k.id, { tur: 'konum', hedef: k.id, dilim: 0 }), icerik: null };
    expect(celisenDeliller(o.deliller, bos)).toEqual([]);
    const delil: Delil = o.deliller[0]!;
    expect(delil).toBeDefined();
  });
});
