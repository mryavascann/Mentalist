// Kılavuz: bölümler, maddeler, kanıt rozeti, kaynaklar; baştan tamamen açık (K-012).
// "Karşılaştın" rozeti: vaka analizinde önerilen ya da kullandığın tekniğe bağlı maddeler.
import { ICERIK } from '@icerik/index';
import { depo, useOyun } from '../oyun/kullan';
import { KILAVUZ_GORSELLERI } from '../gorseller';

const BOLUM_ADLARI: Record<string, string> = {
  'yalan-tespitinin-bilimi': 'Yalan Tespitinin Bilimi',
  'sorgulama-teknikleri': 'Sorgulama Teknikleri',
  'bilissel-yanliliklar': 'Bilişsel Yanlılıklar',
  'kisilik-okuma': 'Kişilik Okuma',
  'soguk-okuma': 'Soğuk ve Sıcak Okuma',
  'bellek-taniklik': 'Bellek ve Tanıklık',
  'dikkat-sihir': 'Dikkat ve Sihir',
  'ikna-manipulasyon': 'İkna ve Manipülasyon',
  'duygular': 'Duygular',
  'inanc-paranormal': 'İnanç, Paranormal ve Tarikatlar',
  'holmes': 'Holmes Gibi Düşünmek',
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
  const korNoktalar = depo.korNoktalar();
  const etiketAdi = (id: string) => ICERIK.hataEtiketleri.find((h) => h.id === id);

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
        {!secili && korNoktalar.length > 0 && (
          <section style={{ marginBottom: 16 }}>
            <h2>Senin kör noktan</h2>
            <p className="soluk">Vakadan vakaya tekrarladığın hatalar. Sonraki vakalar, sana söylemeden, bu konuları çalıştıracak biçimde üretilir.</p>
            <ul className="liste-temiz">
              {korNoktalar.map((k) => {
                const h = etiketAdi(k.etiket);
                return (
                  <li key={k.etiket}>
                    <button className="etiket" onClick={() => h && depo.kilavuzAc(h.kilavuzMaddesi)}>{h?.ad ?? k.etiket}</button>
                    <span className="soluk">{k.sayi} kez</span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
        {!secili && (
          <>
            <h2>Nasıl kullanılır</h2>
            <p>Her maddede önce kısa bir açıklama, sonra nasıl kullanılacağı, sınırları, kaynakları ve kanıt düzeyi yer alır. Rozetlerin anlamı: <span className="rozet guclu">Güçlü</span> tekrarlanmış ve meta-analizle desteklenmiş bulgu; <span className="rozet orta">Orta</span> iyi ama sınırlı kanıt; <span className="rozet zayif">Zayıf</span> az sayıda çalışma ya da saha deneyimi; <span className="rozet mit">Mit</span> araştırmalar bunun tersini gösteriyor.</p>
            <p className="soluk">Tek bir davranış yalanın kanıtı değildir. Davranış, "bu konuyu sor" diyen bir işarettir; kesinlik delille gelir.</p>
          </>
        )}
        {secili && (
          <>
            {KILAVUZ_GORSELLERI[secili.bolum] && <img src={KILAVUZ_GORSELLERI[secili.bolum]} alt={`${BOLUM_ADLARI[secili.bolum] ?? secili.bolum} bölümü`} style={{ width: '100%', maxHeight: 200, objectFit: 'cover', border: '1px solid var(--cizgi)', marginBottom: 8 }} />}
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
