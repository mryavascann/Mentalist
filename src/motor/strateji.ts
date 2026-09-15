// NPC konuşma stratejisi ve yalan defteri.
//
// Her soru için kişi doğru / yalan / gizleme / kaçamak / koruma kararı verir. Karar üç şeye bakar:
//   1) gerçek (zaman çizelgesi, olay), 2) bildikleri (bilgi dağılımı), 3) sakladıkları (sırlar, korumalar).
// Verilen her cevap yalan defterine yazılır; aynı soru tekrar sorulunca aynı cevap döner
// (planlı yalan tutarlıdır; Vrij 2010). Cevabın gizli etiketi (ifadeTuru) TASARIM §6 tablosundan gelir
// ve vaka sonu analizinde "aslında ne oluyordu" açıklamasını besler.
//
// Bu katman METİN üretmez; yapısal cevap üretir. Metin, dil katmanında (K-009 şablon-gramer) giydirilir.
import { Rastgele } from '@ortak/rastgele';
import { bilgiDagit, type BilgiDagilimi } from './bilgi';
import { odaYalaniGerektirir, sirlarUret, type SirKatmani } from './sirlar';
import type { KisiId, Vaka } from './tipler';

export type Soru =
  | { tur: 'konum'; hedef: KisiId; dilim: number }
  | { tur: 'olay-bilgisi'; konu: 'olay-yontemi' | 'fail-kimligi' };

export interface Cevap {
  kisi: KisiId;
  soru: Soru;
  /** src/icerik/ifade_turleri.json id'si. */
  ifadeTuru: string;
  /** Oda id / yöntem / kişi id; null = "bilmiyorum / hatırlamıyorum". */
  icerik: string | null;
  /** İçerik gerçekle uyuşuyor mu? null cevapta: gerçekten bilmiyorsa true, biliyorsa false. */
  dogru: boolean;
  /** Vaka sonu analizi için iç gerekçe (oyuncuya oyun sırasında gösterilmez). */
  not: string;
}

export interface VakaDurumu {
  vaka: Vaka;
  dagilim: BilgiDagilimi;
  sirKatmani: SirKatmani;
  /** Yalan defteri: `${kisi}|${soruAnahtari}` → cevap. */
  defter: Map<string, Cevap>;
}

/** Gerçek + bilgi + sırlar katmanlarını bir araya getirir; defter boş başlar. */
export function vakaDurumuKur(vaka: Vaka): VakaDurumu {
  return { vaka, dagilim: bilgiDagit(vaka), sirKatmani: sirlarUret(vaka), defter: new Map() };
}

export function soruAnahtari(soru: Soru): string {
  return soru.tur === 'konum' ? `konum:${soru.hedef}:${soru.dilim}` : `olay:${soru.konu}`;
}

/** Kaçamak cevap eşiği: bu becerinin üstündeki yalancı yeri kabul edip eylemi gizler (Vrij 2010 "iyi yalancı"). */
const KACAMAK_BECERI_ESIGI = 0.7;

export function cevapla(durum: VakaDurumu, kisi: KisiId, soru: Soru): Cevap {
  const anahtar = `${kisi}|${soruAnahtari(soru)}`;
  const kayitli = durum.defter.get(anahtar);
  if (kayitli) return kayitli;
  // Soru sırasından bağımsız determinizm: her (kişi, soru) çifti kendi akışını kullanır.
  const r = new Rastgele(`${durum.vaka.seed}/strateji/${anahtar}`);
  const cevap = soru.tur === 'konum' ? konumCevabi(durum, kisi, soru, r) : olayBilgisiCevabi(durum, kisi, soru);
  durum.defter.set(anahtar, cevap);
  return cevap;
}

// ---------------------------------------------------------------------------------------------
// Yardımcılar

function konum(vaka: Vaka, kisi: KisiId, dilim: number): string {
  return vaka.zamanCizelgesi.find((z) => z.kisi === kisi && z.dilim === dilim)!.oda;
}

function koruyorMu(durum: VakaDurumu, koruyan: KisiId, korunan: KisiId): boolean {
  return durum.sirKatmani.korumalar.some((c) => c.koruyan === koruyan && c.korunan === korunan);
}

function sirri(durum: VakaDurumu, kisi: KisiId, dilim: number) {
  return durum.sirKatmani.sirlar.find((s) => s.kisi === kisi && s.dilimler.includes(dilim));
}

/** Gerçek dışında bir oda seç (deterministik). */
function baskaOda(durum: VakaDurumu, gercekOda: string, r: Rastgele): string {
  return r.sec(durum.vaka.mekan.odalar.filter((o) => o.id !== gercekOda)).id;
}

// ---------------------------------------------------------------------------------------------
// Konum soruları

function konumCevabi(durum: VakaDurumu, kisi: KisiId, soru: Extract<Soru, { tur: 'konum' }>, r: Rastgele): Cevap {
  const { vaka } = durum;
  const { olay } = vaka;
  const gercek = konum(vaka, soru.hedef, soru.dilim);
  const temel = { kisi, soru };

  // --- Kendi konumu ---
  if (soru.hedef === kisi) {
    // Fail, olay anını saklar.
    if (kisi === olay.fail && soru.dilim === olay.dilim) {
      const beceri = vaka.kisiler.find((k) => k.id === kisi)!.yalanBecerisi;
      const bulundugu = [...new Set(vaka.zamanCizelgesi.filter((z) => z.kisi === kisi && z.oda !== olay.oda).map((z) => z.oda))];
      if (beceri > KACAMAK_BECERI_ESIGI || bulundugu.length === 0) {
        return { ...temel, ifadeTuru: 'kacamak', icerik: gercek, dogru: true, not: 'fail: olay odasında olduğunu kabul eder, eylemi saklar' };
      }
      // Gömülü yalan: o akşam gerçekten bulunduğu başka bir oda (ayrıntılar gerçek, tek kritik ayrıntı değişik).
      return { ...temel, ifadeTuru: 'gomulu-yalan', icerik: r.sec(bulundugu), dogru: false, not: 'fail: olay anındaki konumunu gömülü yalanla saklar' };
    }
    const sir = sirri(durum, kisi, soru.dilim);
    if (sir) {
      if (odaYalaniGerektirir(sir.tur)) {
        return { ...temel, ifadeTuru: 'alakasiz-sir', icerik: baskaOda(durum, gercek, r), dogru: false, not: `alakasız sır (${sir.tur}): konumunu saklar` };
      }
      return { ...temel, ifadeTuru: 'gizleme', icerik: gercek, dogru: true, not: `alakasız sır (${sir.tur}): yerini söyler, ne yaptığını saklar` };
    }
    return { ...temel, ifadeTuru: 'dogru', icerik: gercek, dogru: true, not: 'kendi konumu, saklayacak şey yok' };
  }

  // --- Başkasının konumu ---
  const kendiOdasi = konum(vaka, kisi, soru.dilim);
  const korunanSirri = sirri(durum, soru.hedef, soru.dilim);
  if (koruyorMu(durum, kisi, soru.hedef) && (soru.dilim === olay.dilim || korunanSirri)) {
    if (gercek === kendiOdasi) {
      return { ...temel, ifadeTuru: 'dogru', icerik: gercek, dogru: true, not: 'koruduğu kişi gerçekten yanındaydı' };
    }
    return { ...temel, ifadeTuru: 'koruma-yalani', icerik: kendiOdasi, dogru: false, not: `koruma yalanı: ${soru.hedef} için "yanımdaydı" der` };
  }

  const bilgiler = durum.dagilim.bilgiler.filter((b) => b.kisi === kisi && b.konu === 'konum' && b.hedefKisi === soru.hedef && b.hedefDilim === soru.dilim);
  const gordu = bilgiler.find((b) => b.kaynak === 'gordu');
  if (gordu) return { ...temel, ifadeTuru: 'dogru', icerik: gordu.icerik, dogru: true, not: 'gördüğünü aktarır' };
  const dedikodu = bilgiler.find((b) => b.kaynak === 'dedikodu');
  if (dedikodu) {
    if (dedikodu.dogru) return { ...temel, ifadeTuru: 'dogru', icerik: dedikodu.icerik, dogru: true, not: 'duyduğunu aktarır (doğru dedikodu)' };
    return { ...temel, ifadeTuru: 'bellek-uyumu', icerik: dedikodu.icerik, dogru: false, not: 'bozuk dedikoduyu gerçek sanarak aktarır' };
  }
  if (gercek === kendiOdasi) {
    return { ...temel, ifadeTuru: 'dikkat-boslugu', icerik: null, dogru: true, not: 'aynı odadaydı ama fark etmedi (dikkatsizlik körlüğü)' };
  }
  return { ...temel, ifadeTuru: 'dogru', icerik: null, dogru: true, not: 'gerçekten bilmiyor' };
}

// ---------------------------------------------------------------------------------------------
// Olay bilgisi soruları

function olayBilgisiCevabi(durum: VakaDurumu, kisi: KisiId, soru: Extract<Soru, { tur: 'olay-bilgisi' }>): Cevap {
  const { vaka, dagilim } = durum;
  const { olay } = vaka;
  const temel = { kisi, soru };
  const bilgi = dagilim.bilgiler.find((b) => b.kisi === kisi && b.konu === soru.konu);

  if (kisi === olay.fail) {
    if (soru.konu === 'fail-kimligi') return { ...temel, ifadeTuru: 'gizleme', icerik: null, dogru: false, not: 'fail: kimliğini asla vermez' };
    if (dagilim.medyayaSizanKonular.includes('olay-yontemi')) {
      return { ...temel, ifadeTuru: 'dogru', icerik: olay.yontem, dogru: true, not: 'fail: bilgi zaten basında, "gazetede okudum" der' };
    }
    return { ...temel, ifadeTuru: 'gizleme', icerik: null, dogru: false, not: 'fail: sadece kendisinin bildiği ayrıntıyı bilmiyormuş gibi yapar' };
  }

  if (!bilgi) return { ...temel, ifadeTuru: 'dogru', icerik: null, dogru: true, not: 'gerçekten bilmiyor' };

  if (soru.konu === 'fail-kimligi' && olay.fail && koruyorMu(durum, kisi, olay.fail)) {
    return { ...temel, ifadeTuru: 'koruma-yalani', icerik: null, dogru: false, not: 'faili gördü ama koruyor' };
  }
  return { ...temel, ifadeTuru: 'dogru', icerik: bilgi.icerik, dogru: bilgi.dogru, not: `bildiğini söyler (kaynak: ${bilgi.kaynak})` };
}
