// Denge botları: oyunu farklı stratejilerle oynayan otomatik oyuncular.
// Amaç dengeyi ÖLÇMEK: sadece davranış ipuçlarına bakan bot şansa yakın kalmalı; yöntem kullanan bot
// belirgin şekilde üstün olmalı (TASARIM §16). Botlar yalnızca oyuncunun görebileceği şeyleri kullanır:
// cevap içerikleri, ipucu gözlemleri, deliller ve teknik sonuçları — asla gizli etiketleri (ifadeTuru, dogru).
import { Rastgele } from '@ortak/rastgele';
import { ICERIK } from '@icerik/index';
import { citGecerliMi } from './bilgi';
import { sahnelenmisMi } from './delil';
import type { Suclama } from './puan';
import { delilGoster, sor, teknikUygula, type Sorgu } from './teknik';
import type { KisiId } from './tipler';

export type Bot = (sorgu: Sorgu) => Suclama;

const ARTAN_IPUCLARI = new Set(ICERIK.ipuclari.filter((i) => i.betimlemeYonu === 'artar').map((i) => i.id));

function adaylar(sorgu: Sorgu): KisiId[] {
  const { vaka } = sorgu.durum;
  return vaka.kisiler.filter((k) => k.hayatta && k.id !== vaka.olay.kurban).map((k) => k.id);
}

/** Sadece davranış ipuçlarına bakar: olay anı sorusunda en çok "artar" ipucu gösteren kişiyi suçlar. */
export const ipucuBotu: Bot = (sorgu) => {
  const { olay } = sorgu.durum.vaka;
  let enIyi: KisiId | null = null;
  let enIyiPuan = -1;
  const gerekce: string[] = [];
  for (const k of adaylar(sorgu)) {
    const s = sor(sorgu, k, { tur: 'konum', hedef: k, dilim: olay.dilim });
    const puan = s.ipuclari.filter((g) => ARTAN_IPUCLARI.has(g.ipucuId)).length;
    if (puan > enIyiPuan) { enIyiPuan = puan; enIyi = k; gerekce.splice(0, gerekce.length, ...s.ipuclari.map((g) => `ipucu:${g.ipucuId}`)); }
  }
  return { fail: enIyi, guven: 0.7, gerekce };
};

/** Yöntem botu: olay yeri delilleri → SUE sırası → geçerli CIT → beklenmedik soru → SVT; görgü tanığına sorar. */
export const yontemBotu: Bot = (sorgu) => {
  const { vaka, dagilim } = sorgu.durum;
  const { olay } = vaka;
  const puanlar = new Map<KisiId, number>();
  const gerekce: string[] = [];
  const arttir = (k: KisiId, p: number, g: string) => { puanlar.set(k, (puanlar.get(k) ?? 0) + p); gerekce.push(g); };

  const supheliler = adaylar(sorgu).filter((k) => sorgu.deliller.some((d) => d.gosterir.tur === 'konum' && d.gosterir.kisi === k && d.gosterir.dilim === olay.dilim));
  const citGecerli = citGecerliMi(vaka, dagilim, 'olay-yontemi');
  for (const s of supheliler) {
    const konum = sor(sorgu, s, { tur: 'konum', hedef: s, dilim: olay.dilim }); // delili göstermeden
    // Fizik kontrolü: aynı kişi-dilim için iki farklı oda gösteren deliller güvenilmez (biri sahnelenmiş olabilir).
    const guvenilir = konum.celisenDeliller.filter((d) => !sahnelenmisMi(sorgu.deliller, d.id));
    if (guvenilir.length > 0) arttir(s, 3, `delil:${guvenilir[0]!.id}`);
    for (const d of guvenilir) delilGoster(sorgu, s, d.id);
    if (citGecerli) {
      const cit = teknikUygula(sorgu, s, 'gizli-bilgi-testi', { konu: 'olay-yontemi' });
      if (cit.teknik === 'gizli-bilgi-testi' && cit.tepki === 'tanima') arttir(s, 2, 'teknik:gizli-bilgi-testi');
    }
    const bs = teknikUygula(sorgu, s, 'beklenmedik-soru', { dilim: olay.dilim });
    if (bs.teknik === 'beklenmedik-soru' && bs.iddiaEdilenOda !== null) {
      for (const ad of bs.adiGecenler) {
        const onunKonumu = sor(sorgu, ad, { tur: 'konum', hedef: ad, dilim: olay.dilim }).cevap.icerik;
        if (onunKonumu !== null && onunKonumu !== bs.iddiaEdilenOda) arttir(s, 1, 'teknik:beklenmedik-soru');
      }
    }
    const yontem = sor(sorgu, s, { tur: 'olay-bilgisi', konu: 'olay-yontemi' }).cevap;
    if (yontem.icerik === null) {
      const svt = teknikUygula(sorgu, s, 'zorunlu-iki-secenek', { konu: 'olay-yontemi' });
      if (svt.teknik === 'zorunlu-iki-secenek' && svt.skor !== null && svt.sansAlti) arttir(s, 1, 'teknik:zorunlu-iki-secenek');
    }
  }
  for (const t of adaylar(sorgu)) {
    const c = sor(sorgu, t, { tur: 'olay-bilgisi', konu: 'fail-kimligi' }).cevap;
    if (c.icerik && c.icerik !== t && adaylar(sorgu).includes(c.icerik)) arttir(c.icerik, 4, `tanik:${t}`);
  }
  let enIyi: KisiId | null = null;
  let enIyiPuan = 0;
  for (const [k, p] of puanlar) if (p > enIyiPuan) { enIyiPuan = p; enIyi = k; }
  if (enIyi === null || enIyiPuan < 2) return { fail: null, guven: 0.5, gerekce };
  return { fail: enIyi, guven: Math.min(0.95, 0.5 + 0.1 * enIyiPuan), gerekce };
};

/** Herkese inanır: kimseyi suçlamaz. */
export const inananBot: Bot = () => ({ fail: null, guven: 0.6, gerekce: [] });

/** Herkese yalancı der: rastgele birini yüksek güvenle suçlar. */
export const supheciBot: Bot = (sorgu) => {
  const r = new Rastgele(`${sorgu.durum.vaka.seed}/supheci`);
  return { fail: r.sec(adaylar(sorgu)), guven: 0.9, gerekce: ['ipucu:genel-gerginlik'] };
};
