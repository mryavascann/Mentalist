// Metin kalitesi: Türkçe ekler (ünlü uyumu, kaynaştırma) ve rol/soyadı tutarlılığı.
//   - Delil açıklamaları ve takım yorumları özel adları doğru çekimler ("Güneş'e ait", "Moreau'yu kaydetmiş").
//   - Tekil roller (anne, baba, eş, avukat, muhasebeci, terapist, şoför, asistan) bir vakada bir kez.
//   - Anne/baba/kardeş kurbanla aynı soyadı taşır; asistan/çalışan/şoför emekli yaşında olmaz.
import { describe, it, expect } from 'vitest';
import { vakaUret } from '@motor/gerceklik';
import { sorguBaslat } from '@motor/teknik';
import { belirtme, tamlayan, yonelme } from '@ortak/turkce';
import { TEKIL_ROLLER } from '@motor/havuzlar';

describe('Türkçe ekler', () => {
  it('yardımcılar özel adları doğru çekimler', () => {
    expect(yonelme('Levent Güneş', true)).toBe("Levent Güneş'e");
    expect(yonelme('Tobias Delgado', true)).toBe("Tobias Delgado'ya");
    expect(belirtme('Victor Moreau')).toBe("Victor Moreau'yu");
    expect(belirtme('Elif')).toBe("Elif'i");
    expect(belirtme('Iris Ostrowski')).toBe("Iris Ostrowski'yi");
    expect(belirtme('Gökçe Bozkurt')).toBe("Gökçe Bozkurt'u");
    expect(tamlayan('Mert Duran')).toBe("Mert Duran'ın");
    // Yabancı adlarda çekim yazıma göre (okunuşa göre değil): kasıtlı, dar kapsam.
    expect(tamlayan('Nora Whitmore')).toBe("Nora Whitmore'nin");
  });

  it('delil açıklamaları kişi adlarını doğru ekle yazar (200 vaka)', () => {
    for (let i = 0; i < 200; i++) {
      const q = sorguBaslat(vakaUret(`ek-${i}`));
      for (const d of q.deliller) {
        if (d.gosterir.tur !== 'konum') continue;
        const ad = q.durum.vaka.kisiler.find((k) => k.id === (d.gosterir as { kisi: string }).kisi)!.ad;
        if (d.aciklama.includes(' ait ')) expect(d.aciklama, d.aciklama).toContain(`${yonelme(ad, true)} ait`);
        if (d.aciklama.includes('kaydetmiş')) expect(d.aciklama, d.aciklama).toContain(`${belirtme(ad)} kaydetmiş`);
        if (d.aciklama.includes('telefonu')) expect(d.aciklama, d.aciklama).toContain(`${tamlayan(ad)} telefonu`);
      }
    }
  });
});

describe('rol tekilliği ve soyadı', () => {
  it('300 vakada tekil roller tekrarlanmaz; anne/baba/kardeş kurbanın soyadını taşır; asistan/çalışan/şoför emekli yaşında değil', () => {
    let soyadEs = 0;
    for (let i = 0; i < 300; i++) {
      const v = vakaUret(`tekil-${i}`);
      const kurban = v.kisiler.find((k) => k.id === v.olay.kurban)!;
      const soyad = (ad: string) => ad.split(' ').slice(-1)[0];
      const gorulen = new Set<string>();
      for (const k of v.kisiler) {
        if (k.id === kurban.id) continue;
        const rol = k.rol.split(' ').slice(1).join(' ');
        if (TEKIL_ROLLER.includes(rol)) { expect(gorulen.has(rol), `${v.seed}: ${rol} iki kez`).toBe(false); gorulen.add(rol); }
        if (['annesi', 'babası', 'kardeşi'].includes(rol)) { soyadEs++; expect(soyad(k.ad), `${v.seed}/${k.ad} ${rol}`).toBe(soyad(kurban.ad)); }
        if (['asistanı', 'çalışanı', 'şoförü'].includes(rol)) expect(k.yas, `${v.seed}/${k.id} ${rol}`).toBeLessThanOrEqual(65);
        if (rol === 'asistanı') expect(k.yas).toBeLessThanOrEqual(50);
      }
    }
    expect(soyadEs).toBeGreaterThan(30);
  });
});
