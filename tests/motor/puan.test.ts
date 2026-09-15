// Puanlama ve otomatik hata etiketleri testleri (TASARIM §11, §16).
// Doğru faili bulmak tek ölçüt değil: yanlış suçlama, sahte itiraf, kirletilen tanık, erken delil,
// geçersiz CIT, aşırı özgüven ve zaman cezalandırılır; kalibrasyon ölçülür; her hata etiketi bir
// Kılavuz maddesine bağlanır (vaka sonu analizi bunu gösterir).
import { describe, it, expect } from 'vitest';
import { vakaUret } from '@motor/gerceklik';
import { sorguBaslat, sor, delilGoster, teknikUygula } from '@motor/teknik';
import { puanla } from '@motor/puan';
import { ICERIK } from '@icerik/index';

const ETIKETLER = new Map(ICERIK.hataEtiketleri.map((h) => [h.id, h]));
const sucluVaka = (baslangic = 0) => {
  for (let i = baslangic; i < baslangic + 200; i++) {
    const v = vakaUret(`puan-${i}`);
    if (v.olay.fail) return sorguBaslat(v);
  }
  throw new Error('suçlu vaka bulunamadı');
};
const kazaVaka = () => {
  for (let i = 0; i < 400; i++) {
    const v = vakaUret(`puan-kaza-${i}`);
    if (!v.olay.fail) return sorguBaslat(v);
  }
  throw new Error('kaza vakası bulunamadı');
};
const masum = (q: ReturnType<typeof sorguBaslat>) => q.durum.vaka.kisiler.find((k) => k.hayatta && k.id !== q.durum.vaka.olay.fail && k.id !== q.durum.vaka.olay.kurban)!;

describe('puanla — temel', () => {
  it('doğru fail + yüksek güven: yüksek puan, iyi kalibrasyon, hata etiketi yok', () => {
    const q = sucluVaka();
    const r = puanla(q, { fail: q.durum.vaka.olay.fail, guven: 0.9 });
    expect(r.dogru).toBe(true);
    expect(r.puan).toBeGreaterThanOrEqual(80);
    expect(r.kalibrasyon.brier).toBeLessThan(0.05);
    expect(r.hataEtiketleri).toEqual([]);
  });

  it('yanlış suçlama: düşük puan, "asiri-ozguven" (güven yüksekse) ve masum kaygılı/sırlıysa Othello etiketi', () => {
    let othello = 0, asiri = 0, n = 0;
    for (let i = 0; i < 120; i++) {
      const v = vakaUret(`puan-yanlis-${i}`);
      if (!v.olay.fail) continue;
      const q = sorguBaslat(v);
      const m = masum(q);
      const r = puanla(q, { fail: m.id, guven: 0.9 });
      n++;
      expect(r.dogru).toBe(false);
      expect(r.puan).toBeLessThan(30);
      if (r.hataEtiketleri.includes('asiri-ozguven')) asiri++;
      const gergin = m.kisilik.kaygi > 0.65 || q.durum.sirKatmani.sirlar.some((s) => s.kisi === m.id);
      if (gergin) { othello++; expect(r.hataEtiketleri).toContain('othello-hatasi'); }
    }
    expect(asiri).toBe(n);
    expect(othello).toBeGreaterThan(20);
  });

  it('kaza vakasında "suç yok" demek doğrudur; kazada birini suçlamak yanlıştır', () => {
    const q = kazaVaka();
    expect(puanla(q, { fail: null, guven: 0.7 }).dogru).toBe(true);
    const r = puanla(q, { fail: masum(q).id, guven: 0.7 });
    expect(r.dogru).toBe(false);
  });

  it('suç varken "suç yok" demek doğruluk yanlılığı etiketi alır', () => {
    const q = sucluVaka(5);
    const r = puanla(q, { fail: null, guven: 0.6 });
    expect(r.dogru).toBe(false);
    expect(r.hataEtiketleri).toContain('dogruluk-yanliligi');
  });

  it('kalibrasyon: aynı doğru sonuçta düşük güven daha kötü Brier, yanlış sonuçta yüksek güven en kötü', () => {
    const q = sucluVaka(10);
    const f = q.durum.vaka.olay.fail;
    expect(puanla(q, { fail: f, guven: 0.95 }).kalibrasyon.brier).toBeLessThan(puanla(q, { fail: f, guven: 0.55 }).kalibrasyon.brier);
    const m = masum(q).id;
    expect(puanla(q, { fail: m, guven: 0.95 }).kalibrasyon.brier).toBeGreaterThan(puanla(q, { fail: m, guven: 0.55 }).kalibrasyon.brier);
  });
});

describe('puanla — süreç cezaları ve etiketler', () => {
  it('erken gösterilen delil "erken-delil" etiketi ve ceza getirir', () => {
    const q = sucluVaka(20);
    const f = q.durum.vaka.olay.fail!;
    const delil = q.deliller.find((d) => d.gosterir.tur === 'konum' && d.gosterir.kisi === f && d.gosterir.dilim === q.durum.vaka.olay.dilim)!;
    delilGoster(q, f, delil.id);
    teknikUygula(q, f, 'sue', { delilId: delil.id });
    const r = puanla(q, { fail: f, guven: 0.8 });
    expect(r.hataEtiketleri).toContain('erken-delil');
    expect(r.cezalar.some((c) => c.neden === 'erken-delil')).toBe(true);
  });

  it('kirletilen tanık ceza ve "tanik-kirletme" etiketi', () => {
    let bulundu = false;
    for (let i = 0; i < 150 && !bulundu; i++) {
      const v = vakaUret(`puan-kirlet-${i}`);
      if (!v.olay.fail) continue;
      const q = sorguBaslat(v);
      for (const k of q.durum.vaka.kisiler) {
        if (!k.hayatta || k.id === v.olay.fail) continue;
        teknikUygula(q, k.id, 'sahte-bilgi-yemi', { uydurmaAd: 'Cemil Aktaş' });
      }
      if (q.kontaminasyon.length === 0) continue;
      bulundu = true;
      const r = puanla(q, { fail: v.olay.fail, guven: 0.8 });
      expect(r.hataEtiketleri).toContain('tanik-kirletme');
      expect(r.cezalar.some((c) => c.neden === 'tanik-kirletme')).toBe(true);
    }
    expect(bulundu).toBe(true);
  });

  it('sahte itirafı kabul edip masumu suçlamak "sahte-itiraf-kabulu" etiketi ve ağır ceza', () => {
    let bulundu = false;
    for (let i = 0; i < 300 && !bulundu; i++) {
      const v = vakaUret(`puan-itiraf-${i}`);
      if (!v.olay.fail) continue;
      const q = sorguBaslat(v);
      const aday = q.durum.vaka.kisiler.find((k) => k.hayatta && k.id !== v.olay.fail && k.id !== v.olay.kurban && k.kisilik.telkineYatkinlik > 0.7);
      if (!aday) continue;
      teknikUygula(q, aday.id, 'suclayici-ton');
      const t = teknikUygula(q, aday.id, 'suclayici-ton');
      if (t.teknik !== 'suclayici-ton' || !t.sahteItiraf) continue;
      bulundu = true;
      sor(q, aday.id, { tur: 'olay-bilgisi', konu: 'fail-kimligi' });
      const r = puanla(q, { fail: aday.id, guven: 0.9 });
      expect(r.hataEtiketleri).toContain('sahte-itiraf-kabulu');
      expect(r.puan).toBeLessThan(10);
    }
    expect(bulundu).toBe(true);
  });

  it('geçersiz CIT kullanımı "gecersiz-gizli-bilgi-testi" etiketi alır', () => {
    let bulundu = false;
    for (let i = 0; i < 150 && !bulundu; i++) {
      const v = vakaUret(`puan-cit-${i}`);
      if (!v.olay.fail) continue;
      const q = sorguBaslat(v);
      if (!q.durum.dagilim.medyayaSizanKonular.includes('olay-yontemi')) continue;
      bulundu = true;
      teknikUygula(q, masum(q).id, 'gizli-bilgi-testi', { konu: 'olay-yontemi' });
      const r = puanla(q, { fail: v.olay.fail, guven: 0.8 });
      expect(r.hataEtiketleri).toContain('gecersiz-gizli-bilgi-testi');
    }
    expect(bulundu).toBe(true);
  });

  it('zaman bütçesi aşımı ceza getirir', () => {
    const q = sucluVaka(30);
    const f = q.durum.vaka.olay.fail!;
    for (let i = 0; i < 12; i++) teknikUygula(q, f, 'acik-uclu-anlatim');
    const r = puanla(q, { fail: f, guven: 0.8 }, { zamanButcesi: 6 });
    expect(r.cezalar.some((c) => c.neden === 'zaman-asimi')).toBe(true);
  });

  it('faile olay anını hiç sormadan yanlış suçlamak "ipucu-erisilemez" (RAM 2) etiketi alır', () => {
    const q = sucluVaka(40);
    const r = puanla(q, { fail: masum(q).id, guven: 0.6 });
    expect(r.hataEtiketleri).toContain('ipucu-erisilemez');
  });

  it('sadece ipucu gerekçesiyle suçlamak "tek-ipucu" etiketi alır', () => {
    const q = sucluVaka(50);
    const r = puanla(q, { fail: masum(q).id, guven: 0.6, gerekce: ['ipucu:goz-temasi', 'ipucu:duraksama'] });
    expect(r.hataEtiketleri).toContain('tek-ipucu');
  });

  it('SUE çelişkisi ve geçerli CIT tanıması bonus getirir', () => {
    let bulundu = false;
    for (let i = 0; i < 200 && !bulundu; i++) {
      const v = vakaUret(`puan-bonus-${i}`);
      if (!v.olay.fail) continue;
      const q = sorguBaslat(v);
      const f = v.olay.fail;
      const ilk = sor(q, f, { tur: 'konum', hedef: f, dilim: v.olay.dilim });
      if (ilk.cevap.ifadeTuru !== 'gomulu-yalan') continue;
      const delil = q.deliller.find((d) => d.gosterir.tur === 'konum' && d.gosterir.kisi === f && d.gosterir.dilim === v.olay.dilim)!;
      teknikUygula(q, f, 'sue', { delilId: delil.id });
      bulundu = true;
      const r = puanla(q, { fail: f, guven: 0.85 });
      expect(r.bonuslar.some((b) => b.neden === 'sue-celiski')).toBe(true);
      expect(r.puan).toBeGreaterThan(puanla(sorguBaslat(v), { fail: f, guven: 0.85 }).puan);
    }
    expect(bulundu).toBe(true);
  });

  it('her hata etiketi kütükte tanımlı ve çalışılacak Kılavuz maddeleri etiketlerden türetilir', () => {
    const q = sucluVaka(60);
    const r = puanla(q, { fail: masum(q).id, guven: 0.95, gerekce: ['ipucu:goz-temasi'] });
    for (const e of r.hataEtiketleri) expect(ETIKETLER.has(e), e).toBe(true);
    for (const e of r.hataEtiketleri) expect(r.calisilacakKilavuz).toContain(ETIKETLER.get(e)!.kilavuzMaddesi);
    expect(new Set(r.calisilacakKilavuz).size).toBe(r.calisilacakKilavuz.length);
  });
});
