// "Watson'a anlat" ekranı (TASARIM §9): sorgucu Cemal Ilgaz basit sorular sorar; oyuncu her pano maddesini
// gözlem / çıkarım / hipotez diye sınıflar ve test edip etmediğini söyler. Sonuç: çıkarımı gözlem sanma sayısı.
import { depo, useOyun } from '../oyun/kullan';
import { TAKIM } from '../oyun/takim';
import { PORTRELER, TAKIM_PORTRELERI } from '../gorseller';

const SORGUCU = TAKIM.find((t) => t.rol === 'sorgucu')!;
const SORGUCU_PORTRE = PORTRELER[TAKIM_PORTRELERI.sorgucu ?? ''];

export function Watson() {
  const d = useOyun();
  const w = d.watson;
  const adim = w.adimlar[w.indeks];
  return (
    <div className="dosya" style={{ maxWidth: 720, margin: '20px auto' }}>
      <h2 style={{ display: 'flex', gap: 10, alignItems: 'center' }}>{SORGUCU_PORTRE && <img src={SORGUCU_PORTRE} alt="" aria-hidden="true" width={40} height={40} style={{ borderRadius: 6, objectFit: 'cover' }} />}{SORGUCU.ad} dinliyor</h2>
      <p className="soluk">Vakayı adım adım anlat. Her madde için: gözlem mi, çıkarım mı, hipotez mi? Test ettin mi? (Öğreterek öğrenme; Priory Okulu.)</p>
      {!w.bitti && adim && (
        <>
          <p className="soluk">Adım {w.indeks + 1} / {w.adimlar.length} · pano: {adim.tur}</p>
          <p className="takim"><b>{SORGUCU.ad}:</b> {adim.soru}</p>
          <div className="dugmeler">
            {(['gozlem', 'cikarim', 'hipotez'] as const).map((s) => (
              <span key={s}>
                <button onClick={() => depo.watsonCevapla({ sinif: s, testEdildi: true })}>{s === 'gozlem' ? 'Gözlem' : s === 'cikarim' ? 'Çıkarım' : 'Hipotez'} · test ettim</button>
                <button onClick={() => depo.watsonCevapla({ sinif: s, testEdildi: false })}>{s === 'gozlem' ? 'Gözlem' : s === 'cikarim' ? 'Çıkarım' : 'Hipotez'} · test etmedim</button>
              </span>
            ))}
          </div>
        </>
      )}
      {w.bitti && (
        <>
          <p className="uyari">
            {w.celiskiler.length === 0 ? 'Sınıflamaların panoyla uyuştu.' : `${w.celiskiler.length} maddeyi panodaki sütunundan farklı sınıfladın: ${w.celiskiler.join('; ')}. Çıkarımı gözlem sanmak tünel görüşünün başlangıcıdır.`}
          </p>
          {w.testEdilmemisCikarim.length > 0 && <p className="soluk">Test edilmemiş çıkarımlar: {w.testEdilmemisCikarim.join('; ')}. Her biri için "hangi bulgu bunu çürütür?" sorusunu yaz.</p>}
          <div className="dugmeler">
            <button className="birincil" onClick={() => depo.watsonKapat()}>Panoya dön</button>
            <button onClick={() => depo.kilavuzAc('gozlem-cikarim-ayrimi')}>Kılavuz: Gözlem ≠ çıkarım</button>
          </div>
        </>
      )}
      {!w.bitti && <div className="dugmeler" style={{ marginTop: 12 }}><button onClick={() => depo.watsonKapat()}>Vazgeç</button></div>}
    </div>
  );
}
