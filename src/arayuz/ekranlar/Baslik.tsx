// Dedektif masası: ilk vaka, devam eden soruşturma, saha kılavuzu ve kısa tatbikatlar.
import { useRef, useState } from 'react';
import { depo, kaydiSil, useOyun } from '../oyun/kullan';
import type { TatbikatId } from '../oyun/depo';
import { DIGER, TATBIKAT_GORSELLERI } from '../gorseller';
import { ICERIK } from '@icerik/index';
import { Ikon } from './Ikon';

const ALISTIRMALAR: { id: TatbikatId; ad: string; aciklama: string }[] = [
  { id: 'kor-secim', ad: 'Kör seçim', aciklama: 'Kararını gerçekten sen mi verdin?' },
  { id: 'soguk-okuma', ad: 'Soğuk okuma dedektörü', aciklama: 'Sana özel görünen sözlerin ardına bak.' },
  { id: 'taban-orani', ad: 'Taban oranı', aciklama: 'Sezgilerini olasılıklarla karşılaştır.' },
  { id: 'linda', ad: 'Linda tuzağı', aciklama: 'İyi bir hikâye, doğru bir cevap mı?' },
  { id: 'off-beat', ad: 'Kaybolan top ve gevşeme anı', aciklama: 'Dikkatinin nereye gittiğini fark et.' },
  { id: 'ince-dilim', ad: 'İnce dilim', aciklama: 'İlk izlenimin sınırlarını keşfet.' },
  { id: 'cift-kor', ad: 'Çift kör test tasarla', aciklama: 'İnandığın bir iddiayı sınamayı öğren.' },
];
const ZORLUKLAR = [
  { id: 'kolay', ad: 'Kolay', aciklama: 'Yöntemleri keşfet', detay: 'Bilgi sızıntısı az; sahnelenmiş delil yok. Teknikleri tanımak için iyi bir başlangıç.' },
  { id: 'orta', ad: 'Orta', aciklama: 'Sezgilerini sına', detay: 'Dengeli bir soruşturma. İfadeleri karşılaştır, delilleri doğrula ve acele karar verme.' },
  { id: 'zor', ad: 'Zor', aciklama: 'Her ayrıntıyı sorgula', detay: 'Birden çok iz, korkan tanıklar ve sahnelenmiş deliller. Gerçek hayattaki gibi, hiçbir işaret tek başına yeterli değil.' },
] as const;

export function Baslik() {
  const d = useOyun();
  const [ad, setAd] = useState(d.kahramanAdi);
  const [seed, setSeed] = useState('');
  const [silmeOnayi, setSilmeOnayi] = useState(false);
  const [bildirim, setBildirim] = useState('');
  const dosya = useRef<HTMLInputElement>(null);
  const adAlani = useRef<HTMLInputElement>(null);

  const basla = () => {
    depo.basla(ad);
    depo.yeniVaka(seed.trim() || undefined);
    if (!d.forer.tamamlandi) depo.forerBasla();
  };
  // Kayıt taşıma çevrimdışı kalır; hatalar sayfanın içinde anlaşılır biçimde bildirilir.
  const disaAktar = () => {
    const url = URL.createObjectURL(new Blob([depo.disaAktar()], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `cold-read-kayit-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBildirim('Kayıt dosyan indirildi.');
  };
  const iceAktar = async (f: File | undefined) => {
    if (!f) return;
    try {
      if (!depo.iceAktar(await f.text())) setBildirim('Kayıt okunamadı. Cold Read kayıt dosyanı seç.');
      else { setAd(depo.durum.kahramanAdi); setBildirim('Kaydın yüklendi.'); }
    } catch { setBildirim('Dosya açılamadı. Lütfen yeniden dene.'); }
    if (dosya.current) dosya.current.value = '';
  };

  return (
    <div className="baslik-ekrani">
      <section className="giris-sahnesi" aria-labelledby="giris-basligi">
        <img className="giris-gorseli" src={DIGER['ana-pencere'] || DIGER.ana} alt="Yağmurlu şehre bakan bir dedektif masası; vaka dosyaları ve bir fincan çay" />
        <div className="giris-perdesi" />
        <div className="giris-metni">
          <span className="ust-etiket"><span className="durum-noktasi" /> BİLİMSEL BİR DEDEKTİF DENEYİMİ</span>
          <h1 id="giris-basligi">Herkes bir<br />hikâye anlatır.<br /><em>Sen gerçeği bul.</em></h1>
          <p>İfadelerin arasını oku. Sezgilerini sorgula.<br />Gerçeğe, doğru sorularla yaklaş.</p>
          <button className="sahne-dugmesi" onClick={() => { adAlani.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); adAlani.current?.focus({ preventScroll: true }); }}>Masaya otur <Ikon ad="ok" boyut={18} /></button>
        </div>
        <div className="sahne-notu"><span>SAHA NOTU / 001</span><p>Bir davranış ipucudur.<br />Bir hüküm değil.</p></div>
        <div className="sahne-alt"><span>GÖZLEM <i /> ŞÜPHE <i /> KEŞİF</span><span>HER VAKA YENİ BİR HİKÂYE</span></div>
      </section>

      {d.sorgu && <section className="devam-bandi"><div><span className="ust-etiket">{d.puan ? 'SON SORUŞTURMAN' : 'AÇIK BİR DOSYAN VAR'}</span><h2>{d.sorgu.durum.vaka.mekan.ad}</h2><p>{d.puan ? 'Bulgularını ve öğrendiklerini gözden geçir.' : 'Notların ve görüşmelerin seni bekliyor.'}</p></div><button className="birincil" onClick={() => depo.ekranaGit(d.puan ? 'analiz' : 'vaka-acilis')}>Devam et <Ikon ad="ok" boyut={18} /></button></section>}

      <div className="masa-izgarasi">
        <section className="baslangic-karti" aria-labelledby="yeni-dosya-baslik">
          <div className="bolum-ust"><div><span className="ust-etiket">BİR SONRAKİ SORUŞTURMAN</span><h2 id="yeni-dosya-baslik">Yeni bir dosya aç.</h2></div><span className="bolum-ikonu"><Ikon ad="dosya" boyut={24} /></span></div>
          <p className="bolum-aciklama">Bir olay. Birbirini tutmayan ifadeler. Ve sen.</p>
          <form onSubmit={(e) => { e.preventDefault(); basla(); }}>
            <div className="girdi-ikili">
              <label>Kahramanın adı<input ref={adAlani} type="text" value={ad} onChange={(e) => setAd(e.target.value)} placeholder="Adını yaz (boşsa: Okuyucu)" autoComplete="nickname" /></label>
              <label>Vaka kodu <span className="istege-bagli">İsteğe bağlı</span><input type="text" value={seed} onChange={(e) => setSeed(e.target.value)} placeholder="örn. deniz-feneri" aria-describedby="vaka-kodu-yardim" /></label>
            </div>
            <p id="vaka-kodu-yardim" className="alan-notu">Aynı kodla aynı dosyayı yeniden açabilirsin. Boş bırakırsan sürpriz bir vaka gelir.</p>
            <fieldset className="zorluk-grubu"><legend>Soruşturma zorluğu</legend><div className="zorluk-secenekleri">
              {ZORLUKLAR.map((z, i) => <label key={z.id} className={`zorluk-karti${d.zorluk === z.id ? ' secili' : ''}`}><input type="radio" name="zorluk" value={z.id} checked={d.zorluk === z.id} aria-checked={d.zorluk === z.id} onChange={() => depo.zorlukSec(z.id)} /><span className="zorluk-isaret" aria-hidden="true">{[0, 1, 2].map((n) => <i className={n <= i ? 'dolu' : ''} key={n} />)}</span><strong>{z.ad}</strong><small>{z.aciklama}</small></label>)}
            </div></fieldset>
            <p className="zorluk-aciklama" aria-live="polite">{ZORLUKLAR.find((z) => z.id === d.zorluk)?.detay}</p>
            <button className="birincil yeni-vaka" type="submit">Yeni vaka <Ikon ad="ok" /></button>
            <p className="baslangic-notu">{!d.forer.tamamlandi ? 'İlk vakadan önce 2 dakikalık bir açılış dersi seni bekliyor.' : 'Gözlemle başla. Karar vermeden önce doğrula.'}</p>
          </form>
        </section>
        <aside className="ogrenme-karti">
          <div className="ogrenme-gorseli"><img src={DIGER.ana} alt="Notlarla dolu bir soruşturma dosyası" /><span className="gorsel-etiket"><Ikon ad="kitap" boyut={16} /> DEDEKTİFİN EL KİTABI</span></div>
          <div className="ogrenme-metni"><span className="ust-etiket">SEZGİNİN YETMEDİĞİ YERDE</span><h2>İyi bir gözlemci<br />olmayı öğren.</h2><p>Yalan, bellek, beden dili ve zihnin sana kurduğu tuzaklar. Gerçek araştırmalara dayanan bir saha kılavuzu.</p><div className="kilavuz-sayilar"><span><strong>{ICERIK.kilavuz.length}</strong> kaynaklı madde</span><span><strong>{ICERIK.teknikler.length}</strong> sorgu tekniği</span></div><button className="metin-dugmesi" onClick={() => depo.kilavuzAc(null)}>Kılavuzu keşfet <Ikon ad="ok" boyut={18} /></button></div>
        </aside>
      </div>

      <section className="tatbikat-bolumu" aria-labelledby="tatbikat-basligi">
        <div className="bolum-ust"><div><span className="ust-etiket">KÜÇÜK DENEYLER, BÜYÜK FARKINDALIKLAR</span><h2 id="tatbikat-basligi">Zihnini vakaya hazırla.</h2></div><span className="sure-etiketi"><Ikon ad="saat" boyut={16} /> 2–5 dakikalık tatbikatlar</span></div>
        <div className="tatbikat-izgarasi">{ALISTIRMALAR.map((a, i) => <button className="tatbikat-karti" key={a.id} onClick={() => { depo.basla(ad); depo.tatbikatAc(a.id); }}>
          <span className="tatbikat-resim">{TATBIKAT_GORSELLERI[a.id] ? <img src={TATBIKAT_GORSELLERI[a.id]} alt="" loading="lazy" /> : <Ikon ad="hedef" boyut={32} />}<span>0{i + 1}</span></span>
          <span className="tatbikat-metin"><strong>{a.ad}</strong><small>{a.aciklama}</small><span className="tatbikat-alt">{d.tatbikat.sonuclar[a.id]?.tamamlandi ? 'Tamamlandı ✓' : 'Kendini sına'}<Ikon ad="ok" boyut={16} /></span></span>
        </button>)}</div>
        <button className="ders-baglantisi" onClick={() => { depo.basla(ad); depo.forerBasla(); }}><Ikon ad="hedef" boyut={18} /> Açılış dersi (2 dk) <span>İlk izlenimine ne kadar güveniyorsun?</span><Ikon ad="ok" boyut={18} /></button>
      </section>

      <details className="kayit-yonetimi"><summary>Kayıt yönetimi</summary><p className="soluk">İlerlemeni bu tarayıcıda saklıyoruz. Başka bir cihazda devam etmek için kaydını dışa aktar.</p><div className="dugmeler"><button onClick={disaAktar} disabled={!d.sorgu && d.gecmis.length === 0}>Kaydı dışa aktar</button><button onClick={() => dosya.current?.click()}>Kaydı içe aktar</button><input ref={dosya} type="file" accept="application/json" hidden onChange={(e) => void iceAktar(e.target.files?.[0])} /><button onClick={() => setSilmeOnayi(true)}>Sıfırla</button></div>
        {silmeOnayi && <div className="silme-onayi" role="alert"><p>Tüm kayıtların ve ilerlemen silinecek. Devam etmek istiyor musun?</p><div className="dugmeler"><button className="tehlike" onClick={() => { kaydiSil(); depo.sifirla(); setAd(''); setSeed(''); setSilmeOnayi(false); setBildirim('İlerlemen sıfırlandı.'); }}>Evet, ilerlemeyi sil</button><button onClick={() => setSilmeOnayi(false)}>Vazgeç</button></div></div>}
        {bildirim && <p role="status">{bildirim}</p>}
      </details>
    </div>
  );
}
