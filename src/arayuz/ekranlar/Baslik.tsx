// Başlık ekranı: kahraman adı girişi (K-007), yeni vaka, kayıt dışa/içe aktarma (K-011).
import { useRef, useState } from 'react';
import { depo, kaydiSil, useOyun } from '../oyun/kullan';

export function Baslik() {
  const d = useOyun();
  const [ad, setAd] = useState(d.kahramanAdi);
  const [seed, setSeed] = useState('');
  const dosya = useRef<HTMLInputElement>(null);

  const basla = () => {
    depo.basla(ad);
    depo.yeniVaka(seed.trim() || undefined);
    if (!d.forer.tamamlandi) depo.forerBasla(); // ilk vakadan önce açılış dersi (TASARIM §13)
  };

  const disaAktar = () => {
    const blob = new Blob([depo.disaAktar()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `the-mentalist-kayit-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const iceAktar = async (f: File | undefined) => {
    if (!f) return;
    const metin = await f.text();
    if (!depo.iceAktar(metin)) alert('Kayıt dosyası okunamadı.');
  };

  return (
    <div className="baslik-ekrani">
      <h1>THE MENTALIST</h1>
      <p>Okuma sanatını bilimle sınayan bir dedektif oyunu. Yanılmak oyunun parçası; her yanılgı sana neyi çalışman gerektiğini söyler.</p>
      <div className="dosya" style={{ textAlign: 'left' }}>
        <label>
          Kahramanın adı
          <br />
          <input type="text" value={ad} onChange={(e) => setAd(e.target.value)} placeholder="Adını yaz (boşsa: Okuyucu)" style={{ width: '100%' }} />
        </label>
        <label style={{ display: 'block', marginTop: 8 }}>
          Vaka kodu (isteğe bağlı; aynı kod aynı vakayı üretir)
          <br />
          <input type="text" value={seed} onChange={(e) => setSeed(e.target.value)} placeholder="örn. deniz-feneri" style={{ width: '100%' }} />
        </label>
        <label style={{ display: 'block', marginTop: 8 }}>
          Zorluk
          <br />
          <select value={d.zorluk} onChange={(e) => depo.zorlukSec(e.target.value as 'kolay' | 'orta' | 'zor')}>
            <option value="kolay">Kolay — sızıntı az, sahnelenmiş delil yok</option>
            <option value="orta">Orta — dengeli</option>
            <option value="zor">Zor — kaçamak fail, korkan tanık, sahnelenmiş delil</option>
          </select>
        </label>
        <div className="dugmeler" style={{ marginTop: 12 }}>
          <button className="birincil" onClick={basla}>Yeni vaka</button>
          <button onClick={() => { depo.basla(ad); depo.forerBasla(); }}>Açılış dersi (2 dk)</button>
          {d.sorgu && <button onClick={() => depo.ekranaGit(d.puan ? 'analiz' : 'vaka-acilis')}>Devam et</button>}
          <button onClick={disaAktar} disabled={!d.sorgu && d.gecmis.length === 0}>Kaydı dışa aktar</button>
          <button onClick={() => dosya.current?.click()}>Kaydı içe aktar</button>
          <input ref={dosya} type="file" accept="application/json" style={{ display: 'none' }} onChange={(e) => void iceAktar(e.target.files?.[0])} />
          <button onClick={() => { kaydiSil(); depo.sifirla(); }}>Sıfırla</button>
        </div>
        {d.gecmis.length > 0 && (
          <p className="soluk">
            {d.gecmis.length} vaka çözdün; doğruluk {Math.round((d.gecmis.filter((g) => g.dogru).length / d.gecmis.length) * 100)}%.
          </p>
        )}
      </div>
    </div>
  );
}
