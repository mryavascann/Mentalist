// Uygulamanın kök bileşeni: depo durumuna göre ekranı seçer; kabuk gezintiyi sağlar.
import { useEffect, useState } from 'react';
import { kaydiYukle, useOyun } from './oyun/kullan';
import { Kabuk } from './ekranlar/Kabuk';
import { Baslik } from './ekranlar/Baslik';
import { VakaAcilis } from './ekranlar/VakaAcilis';
import { SorguOdasi } from './ekranlar/SorguOdasi';
import { Pano } from './ekranlar/Pano';
import { Suclama } from './ekranlar/Suclama';
import { Analiz } from './ekranlar/Analiz';
import { Kilavuz } from './ekranlar/Kilavuz';

export function App() {
  const d = useOyun();
  const [yuklendi, setYuklendi] = useState(false);
  useEffect(() => {
    if (!yuklendi) { kaydiYukle(); setYuklendi(true); }
  }, [yuklendi]);

  let ekran;
  switch (d.ekran) {
    case 'baslik': ekran = <Baslik />; break;
    case 'vaka-acilis': ekran = <VakaAcilis />; break;
    case 'sorgu': ekran = <SorguOdasi />; break;
    case 'pano': ekran = <Pano />; break;
    case 'suclama': ekran = <Suclama />; break;
    case 'analiz': ekran = <Analiz />; break;
    case 'kilavuz': ekran = <Kilavuz />; break;
  }
  return <Kabuk>{ekran}</Kabuk>;
}
