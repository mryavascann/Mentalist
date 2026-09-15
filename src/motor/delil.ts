// Delil üretimi.
//
// Deliller gerçekten (zaman çizelgesi + olay) türer ve v0'da gerçekle asla çelişmez; sahnelenmiş
// delil (Abbey Çiftliği şarap kadehi) sonraki sürümde ayrı bir bayrakla gelir.
// Üç ilke:
//   1) Çözülebilirlik tohumu: fail olay anında olay odasında en az bir iz bırakır. Gömülü yalanı
//      bu izle çelişir (SUE: delili sona sakla, çelişkiyi sor — Vrij 2010).
//   2) Gürültü ve tuzak: masumlar da iz bırakır; alakasız sır yalanı söyleyen masum delille
//      "yakalanabilir" — yakalanan yalan ≠ fail (Othello/gergin masum).
//   3) "Beklenen ama olmayan": cinayette kapı zorlanmamış / köpek havlamamış / boğuşma izi yok gibi
//      yokluk delilleri (Konnikova, Gümüş Şimşek). Kazada suç iması taşıyan yokluk delili üretilmez.
import { Rastgele } from '@ortak/rastgele';
import type { BilgiDagilimi } from './bilgi';
import { ZORLUK_PARAMETRELERI, type KisiId, type MekanTuru, type OdaId, type Vaka } from './tipler';
import type { Cevap } from './strateji';

export type DelilTuru = 'fiziksel' | 'dijital' | 'belge' | 'olmayan';

export type DelilGosterir =
  | { tur: 'konum'; kisi: KisiId; dilim: number; oda: OdaId }
  | { tur: 'yontem'; yontem: string }
  | { tur: 'olmayan'; beklenen: string; ima: string };

export interface Delil {
  id: string;
  tur: DelilTuru;
  /** Bulunduğu (ya da beklendiği) oda. */
  oda: OdaId;
  aciklama: string;
  gosterir: DelilGosterir;
  /** 0–1 kesinlik: dijital > belge > fiziksel. */
  gucu: number;
  /** Basına sızmış mı (CIT geçerliliği). */
  sizmis: boolean;
  /** Fail tarafından yerleştirilmiş mi (Norwood şablonu). Oyuncuya gösterilmez; fizik tutarsızlığıyla bulunur. */
  sahnelenmis: boolean;
}

const KAMERALI_ODA = /Lobi|Otopark|Resepsiyon|Koridor|Bilet|Merdiven|Garaj|Acil/i;

const FIZIKSEL_IZLER = [
  'parmak izi taşıyan bir bardak', 'yarım kalmış bir sigara izmariti', 'düşürülmüş bir düğme', 'ıslak bir ayak izi',
  'unutulmuş bir kalem', 'çay lekesi olan bir peçete', 'bir saç teli', 'kırışmış bir fiş',
];
/** Mekâna özgü belge izleri: her mekân türünün kendi kayıt sistemi vardır. */
export const MEKAN_BELGELERI: Record<MekanTuru, string[]> = {
  malikane: ['misafir defterine düşülmüş imza', 'hizmetli çizelgesinde işaret', 'kilerden alınan şarabın kayıt fişi'],
  ofis: ['kart geçiş kaydı', 'toplantı odası rezervasyon çıktısı', 'yazıcı kuyruğunda adına belge'],
  'sahil-evi': ['iskele kayık defterine yazılmış saat', 'marketten alınan fişin arkasındaki not', 'jeneratör yakıt kaydı'],
  ciftlik: ['topluluk görev çizelgesinde imza', 'sera sulama kayıt defterinde saat', 'bağış makbuzu'],
  hastane: ['ilaç kayıt defterinde paraf', 'hemşire nöbet çizelgesinde saat', 'eczane teslim fişi'],
  motel: ['resepsiyon defterinde giriş saati', 'çamaşırhane jeton fişi', 'oda servisi fişi'],
  karnaval: ['bilet gişesi kasa fişi', 'jeneratör bakım kaydında paraf', 'karavan alanı yer kaydı'],
  apartman: ['posta kutusuna bırakılmış imzalı teslimat', 'kapıcı defterinde not', 'aidat makbuzu'],
};

/** Odada kamera var mı? Mekân şablonundaki oda adından türetilir. */
function kamerali(vaka: Vaka, oda: OdaId): boolean {
  return KAMERALI_ODA.test(vaka.mekan.odalar.find((o) => o.id === oda)!.ad);
}

function odaAdi(vaka: Vaka, oda: OdaId): string {
  return vaka.mekan.odalar.find((o) => o.id === oda)!.ad;
}

function kisiAdi(vaka: Vaka, kisi: KisiId): string {
  return vaka.kisiler.find((k) => k.id === kisi)!.ad;
}

export function delilUret(vaka: Vaka, dagilim: BilgiDagilimi): Delil[] {
  const r = new Rastgele(vaka.seed).altUret('delil');
  const deliller: Delil[] = [];
  const { olay } = vaka;
  let sayac = 0;
  const yeniId = () => `d${++sayac}`;
  const konumDelili = (kisi: KisiId, dilim: number, oda: OdaId, zorunluTur?: DelilTuru): Delil => {
    const saat = vaka.dilimler[dilim]!.baslangic;
    const kamera = kamerali(vaka, oda);
    let tur: DelilTuru = zorunluTur ?? (kamera && r.sans(0.7) ? 'dijital' : r.sans(0.2) ? 'dijital' : r.sans(0.2) ? 'belge' : 'fiziksel');
    if (tur === 'dijital' && !kamera && !zorunluTur) tur = r.sans(0.5) ? 'dijital' : 'fiziksel';
    const ad = kisiAdi(vaka, kisi);
    const yer = odaAdi(vaka, oda);
    let aciklama: string;
    let gucu: number;
    if (tur === 'dijital') {
      aciklama = kamera
        ? `${yer} kamerası ${saat} civarında ${ad}'ı kaydetmiş.`
        : `${ad}'ın telefonu ${saat} civarında ${yer} bölgesindeki kablosuz ağa bağlanmış.`;
      gucu = kamera ? 0.95 : 0.85;
    } else if (tur === 'belge') {
      aciklama = `${yer}: ${ad}'a ait ${r.sec(MEKAN_BELGELERI[vaka.mekan.tur])} (${saat}).`;
      gucu = 0.7;
    } else {
      aciklama = `${yer}: ${ad}'a ait ${r.sec(FIZIKSEL_IZLER)}.`;
      gucu = 0.5 + r.sayi() * 0.35;
    }
    return { id: yeniId(), tur, oda, aciklama, gosterir: { tur: 'konum', kisi, dilim, oda }, gucu: Math.round(gucu * 100) / 100, sizmis: false, sahnelenmis: false };
  };
  const zatenVar = (kisi: KisiId, dilim: number) => deliller.some((d) => d.gosterir.tur === 'konum' && d.gosterir.kisi === kisi && d.gosterir.dilim === dilim);

  // 1) Failin olay yerindeki izi (çözülebilirlik tohumu) + bazen komşu dilimde ikinci iz.
  if (olay.fail) {
    deliller.push(konumDelili(olay.fail, olay.dilim, olay.oda, r.sans(0.25) ? 'dijital' : 'fiziksel'));
    if (r.sans(0.3)) {
      const komsu = r.sans(0.5) ? olay.dilim - 1 : olay.dilim + 1;
      if (komsu >= 0 && komsu < vaka.dilimler.length) {
        const oda = vaka.zamanCizelgesi.find((z) => z.kisi === olay.fail && z.dilim === komsu)!.oda;
        deliller.push(konumDelili(olay.fail, komsu, oda));
      }
    }
  }

  // 1b) Tuzak masum izi: rastgele bir masum da olay anında (bulunduğu yerde) fail ile aynı iz profilini bırakır.
  //     Aksi halde "en çok delili olan fail" kalıbı doğar (örüntü denetçisi). Masum olay odasındaysa iz orada olur.
  const tuzakAdaylari = vaka.kisiler.filter((k) => k.hayatta && k.id !== olay.kurban && k.id !== olay.fail);
  if (tuzakAdaylari.length > 0) {
    const tuzak = r.sec(tuzakAdaylari);
    const oda = vaka.zamanCizelgesi.find((z) => z.kisi === tuzak.id && z.dilim === olay.dilim)!.oda;
    if (!zatenVar(tuzak.id, olay.dilim)) deliller.push(konumDelili(tuzak.id, olay.dilim, oda, r.sans(0.25) ? 'dijital' : 'fiziksel'));
    if (r.sans(0.3)) {
      const komsu = r.sans(0.5) ? olay.dilim - 1 : olay.dilim + 1;
      if (komsu >= 0 && komsu < vaka.dilimler.length && !zatenVar(tuzak.id, komsu)) {
        const komsuOda = vaka.zamanCizelgesi.find((z) => z.kisi === tuzak.id && z.dilim === komsu)!.oda;
        deliller.push(konumDelili(tuzak.id, komsu, komsuOda));
      }
    }
  }

  // 2) Yöntem delili.
  if (olay.fail) {
    deliller.push({
      id: yeniId(), tur: 'fiziksel', oda: olay.oda,
      aciklama: `${odaAdi(vaka, olay.oda)}: olayın "${olay.yontem}" ile gerçekleştiğini gösteren iz.`,
      gosterir: { tur: 'yontem', yontem: olay.yontem }, gucu: 0.8,
      sizmis: dagilim.medyayaSizanKonular.includes('olay-yontemi'),
      sahnelenmis: false,
    });
  }

  // 3) Beklenen ama olmayan (yalnızca cinayette; kazada suç iması yok).
  if (olay.tur === 'cinayet' && olay.fail) {
    const yokluklar: { beklenen: string; ima: string }[] = [
      { beklenen: 'zorlanmış kapı ya da pencere', ima: 'içeriden biri ya da tanıdık' },
    ];
    if (['malikane', 'ciftlik', 'sahil-evi'].includes(vaka.mekan.tur)) yokluklar.push({ beklenen: 'köpeğin havlaması', ima: 'köpek geleni tanıyordu' });
    if (['zehir', 'ilaç dozu'].includes(olay.yontem)) yokluklar.push({ beklenen: 'boğuşma izi', ima: 'kurban tehlikeyi fark etmedi' });
    for (const y of yokluklar) {
      deliller.push({ id: yeniId(), tur: 'olmayan', oda: olay.oda, aciklama: `Beklenen ama olmayan: ${y.beklenen} yok.`, gosterir: { tur: 'olmayan', beklenen: y.beklenen, ima: y.ima }, gucu: 0.6, sizmis: false, sahnelenmis: false });
    }
  }

  // 3b) Sahnelenmiş delil (Norwood şablonu; zorluğa bağlı): fail, olay anında BAŞKA yerde olan bir masuma ait
  //     fiziksel bir izi olay odasına yerleştirir. Masumun gerçek izi de üretilir → aynı kişi, aynı dilim, iki oda:
  //     fizik tutarsızlığı. Oyuncu "bu delili kim üretmiş olabilir?" diye sormalı (Konnikova, Cottingley/Norwood).
  if (olay.fail && r.sans(ZORLUK_PARAMETRELERI[vaka.ayar.zorluk].sahnelemeOlasiligi)) {
    const kurbanlar = vaka.kisiler.filter((k) => k.hayatta && k.id !== olay.kurban && k.id !== olay.fail
      && vaka.zamanCizelgesi.find((z) => z.kisi === k.id && z.dilim === olay.dilim)!.oda !== olay.oda);
    if (kurbanlar.length > 0) {
      const gunahKecisi = r.sec(kurbanlar);
      const gercekOda = vaka.zamanCizelgesi.find((z) => z.kisi === gunahKecisi.id && z.dilim === olay.dilim)!.oda;
      const sahte = konumDelili(gunahKecisi.id, olay.dilim, olay.oda, 'fiziksel');
      sahte.gosterir = { tur: 'konum', kisi: gunahKecisi.id, dilim: olay.dilim, oda: olay.oda };
      sahte.sahnelenmis = true;
      sahte.gucu = Math.min(sahte.gucu, 0.6);
      deliller.push(sahte);
      if (!zatenVar(gunahKecisi.id, olay.dilim) || !deliller.some((d) => d.gosterir.tur === 'konum' && d.gosterir.kisi === gunahKecisi.id && d.gosterir.dilim === olay.dilim && !d.sahnelenmis)) {
        deliller.push(konumDelili(gunahKecisi.id, olay.dilim, gercekOda));
      }
    }
  }

  // 4) Gürültü izleri: rastgele (kişi, dilim) çiftleri; masumların da izi olur.
  const hedefSayi = r.tamsayi(5, 10);
  const ciftler = r.karistir(vaka.zamanCizelgesi.filter((z) => !(z.kisi === olay.kurban && !vaka.kisiler.find((k) => k.id === olay.kurban)!.hayatta && z.dilim > olay.dilim)));
  for (const z of ciftler) {
    if (deliller.filter((d) => d.gosterir.tur === 'konum').length >= hedefSayi + 2) break;
    if (zatenVar(z.kisi, z.dilim)) continue;
    deliller.push(konumDelili(z.kisi, z.dilim, z.oda));
  }

  return deliller.slice(0, 20);
}

/**
 * Fizik tutarsızlığı: aynı kişi, aynı dilim, farklı oda gösteren iki konum delili varsa ikisi de "şüpheli"dir
 * (biri sahnelenmiş olmalı). Oyuncuya sahnelenmiş bayrağı gösterilmez; bu kontrol onun yapabileceği tek şeydir.
 */
export function sahnelenmisMi(deliller: Delil[], delilId: string): boolean {
  const d = deliller.find((x) => x.id === delilId);
  if (!d || d.gosterir.tur !== 'konum') return false;
  const g = d.gosterir;
  return deliller.some((x) => x.id !== d.id && x.gosterir.tur === 'konum' && x.gosterir.kisi === g.kisi && x.gosterir.dilim === g.dilim && x.gosterir.oda !== g.oda);
}

/** Cevap kişinin KENDİ konumu hakkındaysa ve bir oda iddia ediyorsa, aynı kişi-dilim için farklı oda gösteren deliller. */
export function celisenDeliller(deliller: Delil[], cevap: Cevap): Delil[] {
  if (cevap.soru.tur !== 'konum' || cevap.soru.hedef !== cevap.kisi || cevap.icerik === null) return [];
  const { dilim } = cevap.soru;
  return deliller.filter((d) => d.gosterir.tur === 'konum' && d.gosterir.kisi === cevap.kisi && d.gosterir.dilim === dilim && d.gosterir.oda !== cevap.icerik);
}
