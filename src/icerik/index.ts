// İçerik yükleyici: JSON kütüklerini tek bir tipli nesnede toplar.
// JSON'dan gelen alanlar geniş tiplidir (string); daraltma dogrula.ts ile test altında güvence altına alınır.
import type { HataEtiketi, IfadeTuru, IpucuKaydi, KaynakKaydi, KilavuzMaddesi, Teknik, TumIcerik } from './tipler';
import kaynaklar from './kaynaklar.json';
import ipuclari from './ipuclari.json';
import ifadeTurleri from './ifade_turleri.json';
import teknikler from './teknikler.json';
import kilavuz from './kilavuz.json';
import hataEtiketleri from './hata_etiketleri.json';

export const ICERIK: TumIcerik = {
  kaynaklar: kaynaklar as KaynakKaydi[],
  ipuclari: ipuclari as IpucuKaydi[],
  ifadeTurleri: ifadeTurleri as IfadeTuru[],
  teknikler: teknikler as Teknik[],
  kilavuz: kilavuz as KilavuzMaddesi[],
  hataEtiketleri: hataEtiketleri as HataEtiketi[],
};

export type { HataEtiketi, IfadeTuru, IpucuKaydi, KaynakKaydi, KilavuzMaddesi, Teknik, TumIcerik } from './tipler';
