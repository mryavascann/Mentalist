// Rol tutarlılığı: kurbanla ilişki rolü kişinin yaşı ve cinsiyetiyle çelişmemeli
// ("25 yaşındaki erkek, 39 yaşındaki kurbanın annesi" olmaz; 21 yaşında terapist olmaz).
import { describe, it, expect } from 'vitest';
import { vakaUret } from '@motor/gerceklik';
import { uygunRoller, ILISKI_SABLONLARI } from '@motor/havuzlar';

describe('rol tutarlılığı', () => {
  it('300 vakada hiçbir rol yaş/cinsiyet kuralını çiğnemez; her kişinin rolü dolu', () => {
    let anne = 0, baba = 0, meslek = 0, cocuk = 0, es = 0;
    for (let i = 0; i < 300; i++) {
      const v = vakaUret(`rol-${i}`);
      const kurban = v.kisiler.find((k) => k.id === v.olay.kurban)!;
      for (const k of v.kisiler) {
        if (k.id === kurban.id) continue;
        expect(k.rol.length, `${v.seed}/${k.id}`).toBeGreaterThan(3);
        const rol = k.rol.split(' ').slice(1).join(' ');
        const fark = k.yas - kurban.yas;
        if (rol === 'annesi') { anne++; expect(k.cinsiyet).toBe('kadin'); expect(fark).toBeGreaterThanOrEqual(16); }
        if (rol === 'babası') { baba++; expect(k.cinsiyet).toBe('erkek'); expect(fark).toBeGreaterThanOrEqual(16); }
        if (['terapisti', 'avukatı', 'muhasebecisi'].includes(rol)) { meslek++; expect(k.yas, `${v.seed}/${k.id} ${rol}`).toBeGreaterThanOrEqual(27); }
        if (rol === 'üvey çocuğu') { cocuk++; expect(fark).toBeLessThanOrEqual(-16); }
        if (rol === 'yeğeni') expect(fark).toBeLessThanOrEqual(-10);
        if (rol === 'çocukluk arkadaşı') expect(Math.abs(fark)).toBeLessThanOrEqual(8);
        if (rol === 'eşi' || rol === 'sevgilisi' || rol === 'eski sevgilisi') {
          expect(k.yas).toBeGreaterThanOrEqual(19);
          // Kullanıcı kararı (16.09.2026): eş/sevgili rolleri kurbanla karşı cinsten.
          expect(k.cinsiyet, `${v.seed}/${k.id} ${rol}`).not.toBe(kurban.cinsiyet);
          es++;
        }
      }
    }
    // Kurallar rolleri yok etmemeli: her tür hâlâ görülüyor.
    expect(anne + baba).toBeGreaterThan(5);
    expect(meslek).toBeGreaterThan(20);
    expect(cocuk).toBeGreaterThan(0);
    expect(es).toBeGreaterThan(30);
  });

  it('uygunRoller: eş/sevgili rolleri kurbanla aynı cinsiyette olana verilmez', () => {
    const es = ILISKI_SABLONLARI.find((s) => s.tur === 'es')!;
    const sevgili = ILISKI_SABLONLARI.find((s) => s.tur === 'sevgili')!;
    const erkek = { yas: 35, cinsiyet: 'erkek' as const };
    const kadin = { yas: 35, cinsiyet: 'kadin' as const };
    expect(uygunRoller(es, erkek, { yas: 40, cinsiyet: 'erkek' })).toEqual(['yakını']);
    expect(uygunRoller(es, erkek, { yas: 40, cinsiyet: 'kadin' })).toEqual(['eşi']);
    expect(uygunRoller(sevgili, kadin, { yas: 40, cinsiyet: 'kadin' })).toEqual(['yakını']);
    expect(uygunRoller(sevgili, kadin, { yas: 40, cinsiyet: 'erkek' })).toEqual(['sevgilisi', 'eski sevgilisi']);
  });

  it('uygunRoller: koşul sağlanmayınca şablonun uygun rolleri kalır; hiçbiri uymazsa genel rol döner', () => {
    const genc = { yas: 22, cinsiyet: 'erkek' as const };
    const kurban = { yas: 40, cinsiyet: 'kadin' as const };
    const aile = ILISKI_SABLONLARI.find((s) => s.tur === 'aile')!;
    const r = uygunRoller(aile, genc, kurban);
    expect(r).not.toContain('annesi');
    expect(r).not.toContain('babası');
    expect(r).toContain('kardeşi');
    expect(r).toContain('üvey çocuğu');
    const is = ILISKI_SABLONLARI.find((s) => s.tur === 'is')!;
    expect(uygunRoller(is, genc, kurban)).not.toContain('avukatı');
    expect(uygunRoller(is, genc, kurban)).toContain('asistanı');
    // Yaşlı kadın: anne olabilir, üvey çocuk olamaz.
    const yasli = { yas: 70, cinsiyet: 'kadin' as const };
    expect(uygunRoller(aile, yasli, kurban)).toContain('annesi');
    expect(uygunRoller(aile, yasli, kurban)).not.toContain('babası');
    expect(uygunRoller(aile, yasli, kurban)).not.toContain('üvey çocuğu');
    // Hiç uygun rol kalmazsa genel rol.
    expect(uygunRoller({ roller: ['annesi'] }, genc, kurban)).toEqual(['yakını']);
  });
});
