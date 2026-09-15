// Puanlama, kalibrasyon ve otomatik hata etiketleri (TASARIM §11, §16).
//
// Doğru faili bulmak tek ölçüt değildir. Süreç de puanlanır: erken gösterilen delil, kirletilen tanık,
// kabul edilen sahte itiraf, geçersiz gizli bilgi testi, baskı, zaman aşımı ceza; SUE çelişkisi ve geçerli
// CIT tanıması bonus. Güven beyanı Brier skoruyla kalibrasyona dönüşür (Ekman & O'Sullivan 1991:
// güven ≠ doğruluk). Hata etiketleri src/icerik/hata_etiketleri.json'dan gelir ve her biri bir Kılavuz
// maddesine bağlıdır; vaka sonu analizi "şunu çalış" derken bu listeyi kullanır.
import { ICERIK } from '@icerik/index';
import { sahnelenmisMi } from './delil';
import { soruAnahtari } from './strateji';
import type { Sorgu } from './teknik';
import type { KisiId } from './tipler';

export interface Suclama {
  /** null = "suç yok / kimseyi suçlamıyorum". */
  fail: KisiId | null;
  /** 0–1 güven beyanı. */
  guven: number;
  /** Oyuncunun dayanakları: 'delil:d3', 'teknik:sue', 'ipucu:goz-temasi' gibi. */
  gerekce?: string[];
}

export interface PuanKalemi { neden: string; miktar: number; aciklama: string }

export interface PuanRaporu {
  dogru: boolean;
  puan: number;
  kalibrasyon: { guven: number; sonuc: 0 | 1; brier: number };
  bonuslar: PuanKalemi[];
  cezalar: PuanKalemi[];
  hataEtiketleri: string[];
  calisilacakKilavuz: string[];
}

export interface PuanSecenekleri {
  /** Soruşturma saati bütçesi; aşımı cezalandırılır. */
  zamanButcesi?: number;
}

const ETIKET_KUTUGU = new Map(ICERIK.hataEtiketleri.map((h) => [h.id, h]));

export function puanla(sorgu: Sorgu, suclama: Suclama, secenekler: PuanSecenekleri = {}): PuanRaporu {
  const { vaka, defter, sirKatmani } = sorgu.durum;
  const { olay } = vaka;
  const dogru = suclama.fail === olay.fail;
  const bonuslar: PuanKalemi[] = [];
  const cezalar: PuanKalemi[] = [];
  const etiketler = new Set<string>();
  const etiket = (id: string) => { if (ETIKET_KUTUGU.has(id)) etiketler.add(id); };

  // Temel puan
  let puan = 0;
  if (dogru) puan = 100;
  else if (suclama.fail === null && olay.fail) puan = 25; // suçu bulamadı ama masuma zarar vermedi
  else puan = 0;

  // Kalibrasyon (Brier): beyan edilen güven ile sonucun karesel uzaklığı
  const sonuc: 0 | 1 = dogru ? 1 : 0;
  const brier = (suclama.guven - sonuc) ** 2;

  // --- Sonuç etiketleri ---
  if (!dogru && suclama.guven >= 0.8) etiket('asiri-ozguven');
  if (suclama.fail === null && olay.fail) etiket('dogruluk-yanliligi');
  if (suclama.fail !== null && suclama.fail !== olay.fail) {
    const m = vaka.kisiler.find((k) => k.id === suclama.fail);
    const sirli = sirKatmani.sirlar.some((s) => s.kisi === suclama.fail);
    if (m && (m.kisilik.kaygi > 0.65 || sirli)) etiket('othello-hatasi');
    // Sahnelenmiş delil tuzağı: suçlanan masuma ait, fizik tutarsızlığı taşıyan delil vardı ve oyuncu sorgulamadı.
    const tuzakDelil = sorgu.deliller.some((d) => d.gosterir.tur === 'konum' && d.gosterir.kisi === suclama.fail && d.gosterir.dilim === olay.dilim && sahnelenmisMi(sorgu.deliller, d.id));
    if (tuzakDelil) etiket('delil-sorgulanmadi');
    // Sahte itiraf kabulü: suçlanan masumun defterinde sahte itiraf var
    const itiraf = defter.get(`${suclama.fail}|${soruAnahtari({ tur: 'olay-bilgisi', konu: 'fail-kimligi' })}`);
    if (itiraf?.ifadeTuru === 'sahte-itiraf') { etiket('sahte-itiraf-kabulu'); cezalar.push({ neden: 'sahte-itiraf-kabulu', miktar: -40, aciklama: 'Baskı altında verilen itirafı doğrulamadan kabul ettin.' }); }
  }
  if (!dogru && olay.fail && !defter.has(`${olay.fail}|${soruAnahtari({ tur: 'konum', hedef: olay.fail, dilim: olay.dilim })}`)) etiket('ipucu-erisilemez');
  if (suclama.gerekce && suclama.gerekce.length > 0 && suclama.gerekce.every((g) => g.startsWith('ipucu:'))) etiket('tek-ipucu');

  // --- Süreç cezaları ---
  const erken = sorgu.gecmis.filter((g) => g.teknik === 'sue' && g.ozet === 'erken gösterildi').length;
  if (erken > 0) { etiket('erken-delil'); cezalar.push({ neden: 'erken-delil', miktar: -10 * erken, aciklama: `${erken} kez delili anlatımdan önce gösterdin; şüpheli hikâyesini delile uydurdu.` }); }
  if (sorgu.kontaminasyon.length > 0) { etiket('tanik-kirletme'); cezalar.push({ neden: 'tanik-kirletme', miktar: -5 * sorgu.kontaminasyon.length, aciklama: `${sorgu.kontaminasyon.length} tanık ifadesine kendi ayrıntını yerleştirdin.` }); }
  const gecersizCit = sorgu.gecmis.filter((g) => g.teknik === 'gizli-bilgi-testi' && g.ozet.startsWith('GEÇERSİZ')).length;
  if (gecersizCit > 0) { etiket('gecersiz-gizli-bilgi-testi'); cezalar.push({ neden: 'gecersiz-cit', miktar: -5 * gecersizCit, aciklama: 'Sızmış ayrıntıyla gizli bilgi testi yaptın; masum da tanır.' }); }
  const baski = sorgu.gecmis.filter((g) => g.teknik === 'suclayici-ton').length;
  if (baski > 0) cezalar.push({ neden: 'baski', miktar: -3 * baski, aciklama: `${baski} kez suçlayıcı ton kullandın; sahte itiraf riski.` });
  const butce = secenekler.zamanButcesi ?? 12;
  if (sorgu.zaman > butce) cezalar.push({ neden: 'zaman-asimi', miktar: -2 * Math.ceil(sorgu.zaman - butce), aciklama: `Soruşturma bütçesini ${(sorgu.zaman - butce).toFixed(1)} saat aştın.` });

  // --- Bonuslar (yalnızca doğru sonuçta) ---
  if (dogru && olay.fail) {
    if (sorgu.gecmis.some((g) => g.teknik === 'sue' && g.kisi === olay.fail && g.ozet === 'çelişki')) bonuslar.push({ neden: 'sue-celiski', miktar: 10, aciklama: 'Delili sona sakladın ve çelişkiyi yakaladın.' });
    if (sorgu.gecmis.some((g) => g.teknik === 'gizli-bilgi-testi' && g.kisi === olay.fail && g.ozet === 'geçerli / tanima')) bonuslar.push({ neden: 'gecerli-cit', miktar: 10, aciklama: 'Geçerli gizli bilgi testiyle tanıma tepkisi aldın.' });
  }

  puan += bonuslar.reduce((t, b) => t + b.miktar, 0) + cezalar.reduce((t, c) => t + c.miktar, 0);
  puan = Math.max(0, Math.min(120, puan));

  const hataEtiketleri = [...etiketler];
  const calisilacakKilavuz = [...new Set(hataEtiketleri.map((e) => ETIKET_KUTUGU.get(e)!.kilavuzMaddesi))];
  return { dogru, puan, kalibrasyon: { guven: suclama.guven, sonuc, brier }, bonuslar, cezalar, hataEtiketleri, calisilacakKilavuz };
}
