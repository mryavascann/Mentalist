// @vitest-environment jsdom
// İpucu kartı: katalog kaydını rozet, uyarı ve kaynaklarla gösterir; bilinmeyen id boş döner.
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { IpucuKarti } from '@arayuz/ekranlar/IpucuKarti';

describe('IpucuKarti', () => {
  it('göz teması kartı "Mit" rozeti, uyarı ve kaynak gösterir; kapat çalışır', () => {
    let kapandi = false;
    render(<IpucuKarti id="goz-temasi" kapat={() => { kapandi = true; }} />);
    expect(screen.getByText('Mit')).toBeTruthy();
    expect(screen.getByText(/kanıt değil/)).toBeTruthy();
    expect(screen.getByText(/DePaulo/)).toBeTruthy();
    fireEvent.click(screen.getByLabelText('kapat'));
    expect(kapandi).toBe(true);
    cleanup();
  });

  it('bilinmeyen id hiçbir şey çizmez', () => {
    const { container } = render(<IpucuKarti id="yok" kapat={() => {}} />);
    expect(container.innerHTML).toBe('');
    cleanup();
  });
});
