// @vitest-environment jsdom
// Suçlama ekranı: dayanak listesindeki delil cümleleri tam görünür (kullanıcı: "delil cümleleri yarıda kalmış").
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { App } from '@arayuz/App';
import { depo, kaydiSil } from '@arayuz/oyun/kullan';

beforeEach(() => {
  cleanup();
  kaydiSil();
  depo.sifirla();
});

describe('Suçlama ekranı', () => {
  it('her delilin açıklaması dayanak listesinde tam metinle görünür; kesilmez', () => {
    let uzun = 0;
    for (const seed of ['suclama-metin-1', 'suclama-metin-2', 'suclama-metin-3']) {
      cleanup();
      depo.sifirla();
      depo.basla('Deniz');
      depo.yeniVaka(seed);
      depo.ekranaGit('suclama');
      render(<App />);
      const deliller = depo.durum.sorgu!.deliller;
      expect(deliller.length).toBeGreaterThan(3);
      for (const d of deliller) {
        if (d.aciklama.length > 60) uzun++;
        const eslesen = screen.getAllByText((_, el) => el?.tagName === 'LABEL' && (el.textContent ?? '').includes(d.aciklama));
        expect(eslesen.length, `${seed} ${d.id}: ${d.aciklama}`).toBeGreaterThan(0);
      }
    }
    expect(uzun).toBeGreaterThan(0); // kesme hatası ancak uzun cümlede görünür
  });
});
