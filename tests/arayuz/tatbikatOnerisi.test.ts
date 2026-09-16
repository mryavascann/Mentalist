// Aralıklı tekrar (TASARIM §11/§13): vaka sonunda hata etiketinden ilgili tatbikata yönlendirme.
// Her hata etiketi bir tatbikata bağlanmak zorunda değil; bağlananlar geçerli olmalı, öneriler tekrarsız ve
// deterministik sırada gelmeli; tatbikat kapanınca oyuncu Analiz'e geri dönmeli.
import { describe, it, expect } from 'vitest';
import { ICERIK } from '@icerik/index';
import { TATBIKAT_ONERISI, TATBIKAT_ADLARI, tatbikatOner } from '@arayuz/oyun/tatbikat_onerisi';
import { OyunDeposu } from '@arayuz/oyun/depo';

const ETIKET_IDLER = new Set(ICERIK.hataEtiketleri.map((h) => h.id));
const TATBIKATLAR = ['kor-secim', 'soguk-okuma', 'taban-orani', 'linda', 'off-beat', 'ince-dilim', 'cift-kor'];

describe('tatbikat önerisi eşlemesi', () => {
  it('eşlenen her etiket kütükte, her tatbikat kimliği geçerli ve adlı; en az 8 etiket, en az 5 farklı tatbikat', () => {
    const girisler = Object.entries(TATBIKAT_ONERISI);
    expect(girisler.length).toBeGreaterThanOrEqual(8);
    for (const [etiket, tatbikat] of girisler) {
      expect(ETIKET_IDLER.has(etiket), etiket).toBe(true);
      expect(TATBIKATLAR).toContain(tatbikat);
      expect(TATBIKAT_ADLARI[tatbikat].length).toBeGreaterThan(3);
    }
    expect(new Set(Object.values(TATBIKAT_ONERISI)).size).toBeGreaterThanOrEqual(5);
    for (const t of TATBIKATLAR) expect(TATBIKAT_ADLARI[t as keyof typeof TATBIKAT_ADLARI]).toBeDefined();
  });

  it('öneriler tekrarsız, etiket sırasını korur; eşlenmeyen etiket sessizce atlanır; boş → boş', () => {
    expect(tatbikatOner([])).toEqual([]);
    const r = tatbikatOner(['temsil-edicilik', 'ic-masalci', 'othello-hatasi', 'bilinmeyen-etiket', 'temsil-edicilik']);
    expect(r.map((x) => x.tatbikat)).toEqual(['linda', 'ince-dilim']);
    expect(r[0]!.etiketler).toEqual(['temsil-edicilik', 'ic-masalci']);
    expect(r[1]!.etiketler).toEqual(['othello-hatasi']);
    expect(r[0]!.ad).toBe(TATBIKAT_ADLARI.linda);
  });
});

describe('OyunDeposu — Analiz\'den tatbikata gidip dönmek', () => {
  it('suçlama sonrası tatbikat açılır, kapanınca analize dönülür; sonuç kaydedilir', () => {
    const depo = new OyunDeposu();
    depo.basla('Deniz');
    depo.yeniVaka('oneri-1');
    const vaka = depo.durum.sorgu!.durum.vaka;
    depo.suclamaYap({ fail: vaka.kisiler.find((k) => k.hayatta && k.id !== vaka.olay.kurban)!.id, guven: 0.6 });
    expect(depo.durum.ekran).toBe('analiz');
    depo.tatbikatAc('linda');
    expect(depo.durum.ekran).toBe('tatbikat');
    depo.lindaBitir({});
    depo.tatbikatKapat();
    expect(depo.durum.ekran).toBe('analiz');
    expect(depo.durum.tatbikat.sonuclar.linda?.tamamlandi).toBe(true);
    // Analiz verisi tatbikat gezisinden etkilenmez.
    expect(depo.durum.puan).not.toBeNull();
    expect(depo.durum.gecmis.length).toBe(1);
  });
});
