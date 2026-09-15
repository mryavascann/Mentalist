// Kılavuz: bölümler, maddeler, kanıt rozeti, kaynaklar; baştan tamamen açık (K-012).
// "Karşılaştın" rozeti: vaka analizinde önerilen ya da kullandığın tekniğe bağlı maddeler.
import { ICERIK } from '@icerik/index';
import { depo, useOyun } from '../oyun/kullan';

const BOLUM_ADLARI: Record<string, string> = {
  'yalan-tespitinin-bilimi': 'Yalan Tespitinin Bilimi',
  'sorgulama-teknikleri': 'Sorgulama Teknikleri',
  'bilissel-yanliliklar': 'Bilişsel Yanlılıklar',
  'kisilik-okuma': 'Kişilik Okuma',
  'soguk-okuma': 'Soğuk ve Sıcak Okuma',
  'mitler-muzesi': 'Mitler Müzesi',
};
const ROZET_ADI: Record<string, string> = { guclu: 'Güçlü', orta: 'Orta', zayif: 'Zayıf', mit: 'Mit' };

export function Kilavuz() {
  const d = useOyun();
  const bolumler = [...new Set(ICERIK.kilavuz.map((m) => m.bolum))];
  const karsilasilan = new Set<string>([
    ...(d.puan?.calisilacakKilavuz ?? []),
    ...ICERIK.teknikler.filter((t) => d.sorgu?.gecmis.some((g) => g.teknik === t.id)).map((t) => t.kilavuzMaddesi),
  ]);
  const secili = d.kilavuzMaddesi ? ICERIK.kilavuz.find((m) => m.id === d.kilavuzMaddesi) : null;
  const kaynakAdi = (id: string) => ICERIK.kaynaklar.find((k) => k.id === id)?.baslik ?? id;

  return (
    <div className="kilavuz-duzeni">
      <aside className="dosya">
        <h2>Kılavuz</h2>
        {bolumler.map((b) => (
          <div key={b}>
            <h3 style={{ fontFamily: 'var(--daktilo)', fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase' }}>{BOLUM_ADLARI[b] ?? b}</h3>
            {ICERIK.kilavuz.filter((m) => m.bolum === b).map((m) => (
              <button key={m.id} className={`madde${secili?.id === m.id ? ' secili' : ''}`} onClick={() => depo.kilavuzAc(m.id)}>
                {m.baslik}
                <span className={`rozet ${m.kanitDuzeyi}`}>{ROZET_ADI[m.kanitDuzeyi]}</span>
                {karsilasilan.has(m.id) && <span className="rozet karsilasildi">karşılaştın</span>}
              </button>
            ))}
          </div>
        ))}
      </aside>
      <main className="dosya">
        {!secili && (
          <>
            <h2>Nasıl kullanılır</h2>
            <p>Her madde: kısa açıklama → nasıl kullanılır → sınırları → kaynak → kanıt düzeyi rozeti. Rozetler: <span className="rozet guclu">Güçlü</span> tekrarlanmış meta-analiz bulgusu; <span className="rozet orta">Orta</span> iyi ama sınırlı kanıt; <span className="rozet zayif">Zayıf</span> az çalışma ya da saha deneyimi; <span className="rozet mit">Mit</span> araştırma bunun tersini gösteriyor.</p>
            <p className="soluk">Tek bir davranış yalanın kanıtı değildir. Davranış "sorulacak konu" sinyalidir; kesinlik delille gelir.</p>
          </>
        )}
        {secili && (
          <>
            <h2>{secili.baslik} <span className={`rozet ${secili.kanitDuzeyi}`}>{ROZET_ADI[secili.kanitDuzeyi]}</span></h2>
            <p>{secili.ozet}</p>
            <h3>Nasıl kullanılır</h3>
            <p>{secili.nasilKullanilir}</p>
            <h3>Sınırları</h3>
            <p>{secili.sinirlari}</p>
            {secili.iliskiliTeknikler && secili.iliskiliTeknikler.length > 0 && (
              <p className="soluk">Vakada dene: {secili.iliskiliTeknikler.map((t) => ICERIK.teknikler.find((x) => x.id === t)?.ad ?? t).join(', ')}</p>
            )}
            <h3>Kaynaklar</h3>
            <ul className="soluk">{secili.kaynak.map((k) => <li key={k}>{kaynakAdi(k)}</li>)}</ul>
          </>
        )}
      </main>
    </div>
  );
}
