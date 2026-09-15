// @vitest-environment jsdom
// Portre yer tutucusu: deterministik, erişilebilir etiketli, kurban işaretli.
import { describe, it, expect } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { Portre } from '@arayuz/ekranlar/Portre';

describe('Portre', () => {
  it('aynı kişi aynı SVG; farklı kişi farklı; kurban çizgili', () => {
    const a = render(<Portre id="k1" ad="Nazlı Aksoy" />).container.innerHTML; cleanup();
    const b = render(<Portre id="k1" ad="Nazlı Aksoy" />).container.innerHTML; cleanup();
    const c = render(<Portre id="k2" ad="Kerem Taş" />).container.innerHTML; cleanup();
    const k = render(<Portre id="k1" ad="Nazlı Aksoy" kurban />).container.innerHTML; cleanup();
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(a).toContain('Nazlı Aksoy portresi');
    expect(a).toContain('>NA<');
    expect(k).toContain('<line');
    expect(a).not.toContain('<line');
  });
});
