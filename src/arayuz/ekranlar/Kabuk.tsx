// Kalıcı çalışma alanı: ana gezinti, vaka durumu, tema ve erişilebilir içerik geçişi.
import { useEffect, useRef, type ReactNode } from 'react';
import { depo, useOyun } from '../oyun/kullan';
import type { Ekran } from '../oyun/depo';
import { useTema } from '../tema';
import { Ikon, type IkonAdi } from './Ikon';

const SEKMELER: { ekran: Ekran; ad: string; ikon: IkonAdi }[] = [
  { ekran: 'vaka-acilis', ad: 'Dosya', ikon: 'dosya' },
  { ekran: 'sorgu', ad: 'Sorgu', ikon: 'sorgu' },
  { ekran: 'pano', ad: 'Pano', ikon: 'pano' },
  { ekran: 'suclama', ad: 'Suçlama', ikon: 'terazi' },
];
const BASLIKLAR: Record<Ekran, string> = {
  baslik: 'Dedektif masası', 'vaka-acilis': 'Vaka dosyası', sorgu: 'Sorgu odası', pano: 'Soruşturma panosu',
  suclama: 'Karar zamanı', analiz: 'Vaka analizi', kilavuz: 'Saha kılavuzu', forer: 'İlk izlenimin ötesi',
  tatbikat: 'Zihin antrenmanı', watson: 'Sesli düşün', kanepe: 'Kanepe molası',
};

export function Kabuk({ children }: { children: ReactNode }) {
  const d = useOyun();
  const [tema, temaDegistir] = useTema();
  const vakaVar = d.sorgu !== null;
  const asim = d.zaman > d.zamanButcesi;
  const icerik = useRef<HTMLElement>(null);
  const oncekiEkran = useRef(d.ekran);
  // Ekran değişiminde klavye odağı ve kaydırma yeni içeriğin başına taşınır.
  useEffect(() => {
    if (oncekiEkran.current !== d.ekran) {
      icerik.current?.focus({ preventScroll: true });
      document.documentElement.scrollTop = 0;
      oncekiEkran.current = d.ekran;
    }
  }, [d.ekran]);

  return (
    <div className="kabuk">
      <a href="#ana-icerik" className="atla">İçeriğe geç</a>
      <aside className="kenar-cubugu">
        <button className="marka" onClick={() => depo.ekranaGit('baslik')} aria-label="Cold Read ana sayfa">
          <span className="marka-isareti" aria-hidden="true">c<span>r</span><i /></span>
          <span><strong>COLD READ</strong><small>GÖRÜNENİN ÖTESİNDE</small></span>
        </button>
        <nav aria-label="Ekranlar">
          <button className={d.ekran === 'baslik' ? 'secili' : ''} aria-current={d.ekran === 'baslik' ? 'page' : undefined} onClick={() => depo.ekranaGit('baslik')}><Ikon ad="ev" />Dedektif masası</button>
          <span className="nav-etiket">SORUŞTURMA</span>
          {SEKMELER.map((s, i) => <button key={s.ekran} className={d.ekran === s.ekran ? 'secili' : ''}
            aria-current={d.ekran === s.ekran ? 'page' : undefined} disabled={!vakaVar}
            title={!vakaVar ? 'Önce yeni bir vaka başlat' : undefined} onClick={() => depo.ekranaGit(s.ekran)}>
            <Ikon ad={s.ikon} /><span>{s.ad}</span><small aria-hidden="true">0{i + 1}</small>
          </button>)}
          {d.puan && <button className={d.ekran === 'analiz' ? 'secili' : ''} onClick={() => depo.ekranaGit('analiz')}><Ikon ad="hedef" />Analiz</button>}
          <span className="nav-etiket">BİR ADIM DAHA DERİNE</span>
          <button className={d.ekran === 'kilavuz' ? 'secili' : ''} aria-current={d.ekran === 'kilavuz' ? 'page' : undefined} onClick={() => depo.kilavuzAc(null)}><Ikon ad="kitap" />Kılavuz</button>
          {vakaVar && !d.puan && <button title="Zaman 1 saat ilerler; takım yeni bilgi getirir" className={d.ekran === 'kanepe' ? 'secili' : ''} onClick={() => { if (depo.kanepeMolasi()) depo.ekranaGit('kanepe'); }}><Ikon ad="cay" />Kanepe molası</button>}
        </nav>
        <div className="kenar-alt"><span className="kenar-cizgi" /><p>“İlk izlenim bir başlangıçtır.<br /><em>Sonuç değil.</em>”</p><span className="nav-etiket">GÖZLEMLE. SORGULA. DOĞRULA.</span></div>
      </aside>
      <div className="calisma-alani">
        <header className="ust">
          <div className="sayfa-konumu"><span>ÇALIŞMA ALANI</span><strong>{BASLIKLAR[d.ekran]}</strong></div>
          <div className="ust-araclar">
            {vakaVar && <span className={`zaman${asim ? ' asim' : ''}`} title="Harcanan soruşturma saati / bütçe"><Ikon ad="saat" boyut={16} />{d.zaman.toFixed(1).replace('.', ',')} / {d.zamanButcesi} saat</span>}
            <button className="tema-anahtari" onClick={temaDegistir} title={tema === 'acik' ? 'Karanlık moda geç' : 'Aydınlık moda geç'} aria-label={tema === 'acik' ? 'Karanlık moda geç' : 'Aydınlık moda geç'}><Ikon ad={tema === 'acik' ? 'ay' : 'gunes'} /></button>
            <span className="dedektif-kimligi"><span className="avatar-harf">{(d.kahramanAdi || 'D').slice(0, 1).toLocaleUpperCase('tr-TR')}</span><span>{d.kahramanAdi || 'Dedektif'}<small>{d.gecmis.length} tamamlanan vaka</small></span></span>
          </div>
        </header>
        <main id="ana-icerik" className={`ana-icerik ekran-${d.ekran}`} ref={icerik} tabIndex={-1}>
          {d.ekran !== 'baslik' && <div className="ekran-basligi"><span className="ust-etiket">COLD READ / {d.sorgu && !['kilavuz', 'tatbikat', 'forer'].includes(d.ekran) ? d.sorgu.durum.vaka.mekan.ad : 'SAHA NOTLARI'}</span><h1>{BASLIKLAR[d.ekran]}</h1></div>}
          {children}
        </main>
        <footer className="alt-bant"><span>COLD READ <span className="ayirici">/</span> Bir dedektifin en güçlü aracı, doğru sorudur.</span><span>Bilime dayalı. Merakla oynanır.</span></footer>
      </div>
    </div>
  );
}
