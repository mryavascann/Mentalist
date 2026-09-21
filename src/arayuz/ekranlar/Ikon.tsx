// Ortak çizgi ikonları: harici font veya bağlantı olmadan çevrimdışı çalışır.
export type IkonAdi = 'ev' | 'dosya' | 'sorgu' | 'pano' | 'terazi' | 'kitap' | 'ok' | 'gunes' | 'ay' | 'cay' | 'hedef' | 'arama' | 'saat';
const YOLLAR: Record<IkonAdi, string> = {
  ev: 'm3 10 9-7 9 7M5 9v12h14V9M9 21v-8h6v8',
  dosya: 'M3 7V5a1 1 0 0 1 1-1h6l2 3h8a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Z M3 9h18',
  sorgu: 'M21 11a8 8 0 0 1-8 8H7l-5 3 2-6a8 8 0 1 1 17-5ZM8 10h8M8 14h5',
  pano: 'M3 3h7v7H3ZM14 14h7v7h-7ZM5 10v8h9M10 6h8v8',
  terazi: 'M12 3v18M6 21h12M3 7h18M5 7l-3 7h6L5 7Zm14 0-3 7h6l-3-7Z',
  kitap: 'M12 5C8 2 5 3 2 4v16c4-2 7-1 10 1 3-2 6-3 10-1V4c-3-1-6-2-10 1Zm0 0v16',
  ok: 'M4 12h16m-6-6 6 6-6 6',
  gunes: 'M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  ay: 'M21 13A9 9 0 0 1 11 3a9 9 0 1 0 10 10Z',
  cay: 'M4 8h13v7a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Zm13 1h2a3 3 0 0 1 0 6h-2M7 2v3m4-3v3M2 23h18',
  hedef: 'M21 12a9 9 0 1 1-9-9M17 12a5 5 0 1 1-5-5m0 5 9-9m-5 0h5v5',
  arama: 'm16 16 5 5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
  saat: 'M12 7v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
};
export function Ikon({ ad, boyut = 20 }: { ad: IkonAdi; boyut?: number }) {
  return <svg width={boyut} height={boyut} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={YOLLAR[ad]} /></svg>;
}
