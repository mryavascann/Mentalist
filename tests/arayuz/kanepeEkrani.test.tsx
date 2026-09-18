// @vitest-environment jsdom
// Kanepe molası sekmesi: düğme eski işini yapar (1 saat + takım notu) ve ayrıca kendi ekranını açar.
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { App } from '@arayuz/App';
import { depo, kaydiSil } from '@arayuz/oyun/kullan';

beforeEach(() => {
  cleanup();
  kaydiSil();
  depo.sifirla();
});

function vakayaGir() {
  render(<App />);
  fireEvent.change(screen.getByPlaceholderText(/örn\./), { target: { value: 'kanepe-1' } });
  fireEvent.click(screen.getByText('Yeni vaka'));
  fireEvent.click(screen.getByText('Analizimi hazırla'));
  fireEvent.click(screen.getByText('Puanla'));
  fireEvent.click(screen.getByText('Anladım, dosyaya geç'));
}

describe('Kanepe molası sekmesi', () => {
  it('düğme saati 1 ilerletir, takım notu ekler ve Kanepe Molası ekranını açar', () => {
    vakayaGir();
    const once = depo.durum.zaman;
    fireEvent.click(screen.getByText(/Kanepe molası/));
    expect(depo.durum.zaman).toBe(once + 1);
    expect(depo.durum.takimNotlari.length).toBe(1);
    expect(depo.durum.ekran).toBe('kanepe');
    expect(screen.getByRole('heading', { name: 'Kanepe Molası' })).toBeTruthy();
    // Takımın getirdiği son not bu ekranda da okunur.
    expect(screen.getByText(depo.durum.takimNotlari[0]!.metin)).toBeTruthy();
  });

  it('"işe dön" düğmesi sorgu odasına götürür; zamana dokunmaz', () => {
    vakayaGir();
    fireEvent.click(screen.getByText(/Kanepe molası/));
    const zaman = depo.durum.zaman;
    fireEvent.click(screen.getByText(/işe dön/));
    expect(depo.durum.ekran).toBe('sorgu');
    expect(depo.durum.zaman).toBe(zaman);
  });
});
