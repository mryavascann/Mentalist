// Takım NPC'leri (TASARIM §14; Aşama 4 hazırlığı): lider, sorgucu, inanan analist, saha ajanı.
// Sorgu sırasında yorum yaparlar. Saha ajanı çoğunluk görüşünü seslendirir ve çoğu zaman yanılır (sosyal kanıt
// tuzağı); lider kanıtsız okumaya itiraz eder; inanan analist davranış ipuçlarını abartır; sorgucu kısa ve
// yöntemli konuşur. Yorumlar gizli etiketi sızdırmaz ve failin kimliğini ele vermez.
import { describe, it, expect } from 'vitest';
import { vakaUret } from '@motor/gerceklik';
import { sorguBaslat, sor } from '@motor/teknik';
import { takimYorumu, TAKIM } from '@arayuz/oyun/takim';
import { OyunDeposu } from '@arayuz/oyun/depo';

describe('takım yorumları', () => {
  it('dört üye tanımlı; her üyenin adı, rolü ve tavrı var', () => {
    expect(TAKIM.length).toBe(4);
    for (const u of TAKIM) { expect(u.ad.length).toBeGreaterThan(1); expect(['lider', 'sorgucu', 'inanan', 'saha']).toContain(u.rol); }
  });

  it('yorumlar deterministik, gizli etiketi ve fail adını sızdırmaz; boş ya da "undefined" değil', () => {
    let toplam = 0;
    for (let i = 0; i < 60; i++) {
      const q = sorguBaslat(vakaUret(`takim-${i}`));
      const { vaka } = q.durum;
      const fail = vaka.olay.fail ? vaka.kisiler.find((k) => k.id === vaka.olay.fail)!.ad.split(' ')[0]! : null;
      for (const k of vaka.kisiler) {
        if (!k.hayatta || k.id === vaka.olay.kurban) continue;
        const s = sor(q, k.id, { tur: 'konum', hedef: k.id, dilim: vaka.olay.dilim });
        const y1 = takimYorumu(q, k.id, s);
        const y2 = takimYorumu(q, k.id, s);
        expect(y1).toEqual(y2);
        if (!y1) continue;
        toplam++;
        expect(y1.metin.length).toBeGreaterThan(5);
        expect(y1.metin).not.toMatch(/undefined|\[object|NaN/);
        const kucuk = y1.metin.toLocaleLowerCase('tr');
        expect(kucuk).not.toMatch(/gömülü|kaçamak|koruma yalanı|alakasız sır|sahte itiraf/);
        if (fail && k.id !== vaka.olay.fail) expect(y1.metin).not.toContain(fail);
      }
    }
    expect(toplam).toBeGreaterThan(100);
  });

  it('saha ajanı ipucu görünce hüküm verir ve şansa yakın kalır; lider kanıt ister (sosyal kanıt tuzağı ölçümü)', () => {
    let sahaHukum = 0, sahaDogru = 0, liderKanit = 0, inananIpucu = 0;
    for (let i = 0; i < 150; i++) {
      const q = sorguBaslat(vakaUret(`takim-olcum-${i}`));
      const { vaka } = q.durum;
      for (const k of vaka.kisiler) {
        if (!k.hayatta || k.id === vaka.olay.kurban) continue;
        const s = sor(q, k.id, { tur: 'konum', hedef: k.id, dilim: vaka.olay.dilim });
        const y = takimYorumu(q, k.id, s);
        if (!y) continue;
        if (y.rol === 'saha' && y.hukum === 'supheli') { sahaHukum++; if (k.id === vaka.olay.fail) sahaDogru++; }
        if (y.rol === 'lider' && /kanıt|delil/i.test(y.metin)) liderKanit++;
        if (y.rol === 'inanan' && s.ipuclari.length > 0) inananIpucu++;
      }
    }
    expect(sahaHukum).toBeGreaterThan(30);
    expect(sahaDogru / sahaHukum).toBeLessThan(0.45); // çoğunluk görüşü sık yanılır
    expect(liderKanit).toBeGreaterThan(10);
    expect(inananIpucu).toBeGreaterThan(10);
  });

  it('depo: takım yorumları konuşma kaydına eklenir ve kapatılabilir', () => {
    const depo = new OyunDeposu();
    depo.basla('Deniz');
    depo.yeniVaka('takim-depo');
    const kisi = depo.gorusulebilirler()[0]!;
    depo.kisiSec(kisi.id);
    depo.sor({ tur: 'konum', hedef: kisi.id, dilim: depo.durum.sorgu!.durum.vaka.olay.dilim });
    const kayit = depo.durum.konusmalar.get(kisi.id)![0]!;
    expect(kayit.takimYorumu === undefined || typeof kayit.takimYorumu.metin === 'string').toBe(true);
    depo.takimAcKapat(false);
    depo.sor({ tur: 'konum', hedef: kisi.id, dilim: 0 });
    expect(depo.durum.konusmalar.get(kisi.id)![1]!.takimYorumu).toBeUndefined();
    expect(depo.durum.takimAcik).toBe(false);
  });
});
