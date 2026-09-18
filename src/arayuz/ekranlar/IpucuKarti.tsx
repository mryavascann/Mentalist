// İpucu kartı: sorgu odasında tıklanan davranış betimlemesinin katalog kaydı — ad, kanıt düzeyi rozeti,
// etki büyüklüğü, sınırlar ve kaynaklar. Amaç: "gördüm" ile "kanıt" arasına bilimi koymak (TASARIM §8).
import { ICERIK } from '@icerik/index';

const ROZET_ADI: Record<string, string> = { guclu: 'Güçlü', orta: 'Orta', zayif: 'Zayıf', mit: 'Mit' };

export function IpucuKarti({ id, kapat }: { id: string; kapat: () => void }) {
  const ipucu = ICERIK.ipuclari.find((i) => i.id === id);
  if (!ipucu) return null;
  const kaynak = (k: string) => ICERIK.kaynaklar.find((x) => x.id === k)?.baslik ?? k;
  return (
    <div className="kart" role="dialog" aria-label="İpucu kartı" style={{ marginTop: 8 }}>
      <div className="ad">
        {ipucu.ad} <span className={`rozet ${ipucu.kanitDuzeyi}`}>{ROZET_ADI[ipucu.kanitDuzeyi]}</span>
        <button style={{ float: 'right', padding: '0 6px' }} onClick={kapat} aria-label="kapat">×</button>
      </div>
      <p className="soluk" style={{ margin: '6px 0' }}>
        Kanal: {ipucu.kanal} · etki büyüklüğü d = {ipucu.etkiBuyuklugu} ·{' '}
        {ipucu.betimlemeYonu === 'iliskisiz' ? 'yalanla ilişkisiz' : ipucu.betimlemeYonu === 'artar' ? 'yalanda biraz artar' : 'yalanda biraz azalır'}
      </p>
      {ipucu.not && <p style={{ fontSize: 14 }}>{ipucu.not}</p>}
      <p className="uyari">Bu bir kanıt değil, "bu konunun üstüne git" diyen bir işarettir. Masumlarda da görülür. Kesinlik delil ve çelişkiyle gelir.</p>
      <p className="soluk">Kaynak: {ipucu.kaynak.map(kaynak).join(' · ')}</p>
    </div>
  );
}
