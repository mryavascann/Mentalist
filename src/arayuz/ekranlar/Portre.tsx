// Portre: Higgsfield görseli varsa (src) onu, yoksa kişi başına deterministik SVG siluet çizer.
// Renk ve şekil kişi id + ad'dan türer (aynı kişi hep aynı görünür). İfade bilinçli olarak nötr:
// yüz ifadesi oyunda ipucu değildir (Barrett 2019); bilgi metinde. Görseller gorseller.ts ile seed'e bağlı,
// cinsiyet ve yaşa uygun atanır (fail seçimiyle ilgisi yok). Kurban görseli soluk ve çizgili gösterilir.
import { seedHash } from '@ortak/rastgele';

const TONLAR = ['#8a6d1f', '#3b5b7a', '#7a2a2a', '#2f6b3a', '#5c5247', '#b98b5a', '#6b4e8a', '#8a4a1f'];

export function Portre({ id, ad, boyut = 56, kurban = false, src }: { id: string; ad: string; boyut?: number; kurban?: boolean; src?: string | null }) {
  if (src) {
    return (
      <span style={{ position: 'relative', display: 'inline-block', width: boyut, height: boyut, flex: 'none' }}>
        <img src={src} alt={`${ad} portresi`} width={boyut} height={boyut} style={{ borderRadius: 6, border: '1px solid #cbbfa6', objectFit: 'cover', display: 'block', opacity: kurban ? 0.55 : 1, filter: kurban ? 'grayscale(.6)' : undefined }} />
        {kurban && <svg width={boyut} height={boyut} viewBox="0 0 64 64" aria-hidden="true" style={{ position: 'absolute', inset: 0 }}><line x1="8" y1="8" x2="56" y2="56" stroke="#b3261e" strokeWidth="2" /></svg>}
      </span>
    );
  }
  const h = seedHash(`${id}|${ad}`);
  const ton = TONLAR[h % TONLAR.length]!;
  const sacYuksek = 14 + (h >> 3) % 10; // saç hacmi
  const omuzGenis = 30 + (h >> 7) % 8;
  const bas = ad.split(' ').map((p) => p[0]).join('').slice(0, 2).toLocaleUpperCase('tr');
  return (
    <svg width={boyut} height={boyut} viewBox="0 0 64 64" role="img" aria-label={`${ad} portresi (yer tutucu)`} style={{ borderRadius: 6, background: '#e9e1cf', border: '1px solid #cbbfa6', opacity: kurban ? 0.55 : 1 }}>
      <path d={`M ${32 - omuzGenis / 2} 64 Q 32 40 ${32 + omuzGenis / 2} 64 Z`} fill={ton} />
      <circle cx="32" cy="27" r="13" fill="#d8c3a5" />
      <path d={`M 19 27 Q 32 ${27 - sacYuksek} 45 27 L 45 22 Q 32 8 19 22 Z`} fill={ton} />
      <text x="32" y="59" textAnchor="middle" fontFamily="Courier New, monospace" fontSize="9" fill="#f4efe4">{bas}</text>
      {kurban && <line x1="8" y1="8" x2="56" y2="56" stroke="#b3261e" strokeWidth="2" />}
    </svg>
  );
}
