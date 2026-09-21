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
import { Forer } from './ekranlar/Forer';
import { Tatbikat } from './ekranlar/Tatbikat';
import { Watson } from './ekranlar/Watson';
import { KanepeMolasi } from './ekranlar/KanepeMolasi';
import { Karsilastirma, OlayCizelgesi, VakaArsivi, Gelisim } from './ekranlar/CalismaEkranlari';

export function App() {
  const d = useOyun();
  const [yuklendi, setYuklendi] = useState(false);
  useEffect(() => {
    if (!yuklendi) { kaydiYukle(); setYuklendi(true); }
  }, [yuklendi]);

  let ekran;
  switch (d.ekran) {
    case 'karsilastirma': ekran = <Karsilastirma key={d.sorgu?.durum.vaka.seed} />; break;
    case 'cizelge': ekran = <OlayCizelgesi key={d.sorgu?.durum.vaka.seed} />; break;
    case 'arsiv': ekran = <VakaArsivi />; break;
    case 'gelisim': ekran = <Gelisim />; break;
    case 'baslik': ekran = <Baslik />; break;
    case 'forer': ekran = <Forer />; break;
    case 'tatbikat': ekran = <Tatbikat />; break;
    case 'vaka-acilis': ekran = <VakaAcilis />; break;
    case 'sorgu': ekran = <SorguOdasi />; break;
    case 'pano': ekran = <Pano />; break;
    case 'watson': ekran = <Watson />; break;
    case 'suclama': ekran = <Suclama />; break;
    case 'analiz': ekran = <Analiz />; break;
    case 'kilavuz': ekran = <Kilavuz />; break;
    case 'kanepe': ekran = <KanepeMolasi />; break;
  }
  return <Kabuk>{ekran}</Kabuk>;
}
