// Bilgi dağılımı ve algı modeli: "kim neyi NASIL biliyor?"
//
// Gerçek (zaman çizelgesi + olay) verili; bu katman her kişinin o gerçeğin hangi parçasını hangi
// kanaldan bildiğini üretir:
//   kendisi  → kendi konumu, failin olay bilgisi
//   gordu    → aynı odada olup fark ettiği şeyler (dikkat boşluğu olasılıkla; Simons & Chabris 1999)
//   dedikodu → başkasının gördüğünü duyup aktarma; bazen bozulur (bellek uyumu tohumu; French 2024)
//   medya    → kamuya açık bilgi (olay yeri/zamanı) ve bazen sızan ayrıntı (yöntem)
//
// Neden önemli: gizli bilgi testi (CIT) ancak "sadece failin bilebileceği" ayrıntı için geçerlidir
// (Vrij & Verschuere 2014). citGecerliMi bu katmandan hesaplanır; oyuncu geçersiz bir tuzak kurarsa
// masum da tepki verir ve oyun bunu hata raporunda gösterir.
import { Rastgele } from '@ortak/rastgele';
import type { KisiId, Vaka } from './tipler';

export type BilgiKaynagi = 'gordu' | 'duydu' | 'dedikodu' | 'medya' | 'kendisi';
export type BilgiKonusu = 'olay-yeri' | 'olay-zamani' | 'olay-yontemi' | 'fail-kimligi' | 'konum';

export interface Bilgi {
  /** Bilen kişi. */
  kisi: KisiId;
  konu: BilgiKonusu;
  kaynak: BilgiKaynagi;
  /** Kanonik içerik: oda id, dilim indeksi (metin), yöntem, kişi id. */
  icerik: string;
  /** İnanç gerçekle uyuşuyor mu? (dedikodu bozulmuş olabilir) */
  dogru: boolean;
  /** konu = 'konum' ise: kimin, hangi dilimdeki konumu. */
  hedefKisi?: KisiId;
  hedefDilim?: number;
}

export interface BilgiDagilimi {
  bilgiler: Bilgi[];
  /** Basına sızan konular; sızan konuda CIT geçersizdir. */
  medyayaSizanKonular: BilgiKonusu[];
}

/** Bu eylemleri yapan gözlemci aynı odadakini daha az fark eder (dikkatsizlik körlüğü). */
export const DIKKAT_DAGITAN_EYLEMLER: readonly string[] = [
  'telefonla konuşuyordu',
  'bilgisayarda çalışıyordu',
  'müzik dinliyordu',
  'bir şeyler okuyordu',
];

const GORME_OLASILIGI_NORMAL = 0.92;
const GORME_OLASILIGI_DAGINIK = 0.45;
const YONTEM_SIZMA_OLASILIGI = 0.35;
const DEDIKODU_OLASILIGI = 0.12;
const DEDIKODU_BOZULMA_OLASILIGI = 0.3;

export function bilgiDagit(vaka: Vaka): BilgiDagilimi {
  const r = new Rastgele(vaka.seed).altUret('bilgi');
  const bilgiler: Bilgi[] = [];
  const { olay } = vaka;
  const canlilar = vaka.kisiler.filter((k) => k.hayatta);
  const konum = (kisi: KisiId, dilim: number) => vaka.zamanCizelgesi.find((z) => z.kisi === kisi && z.dilim === dilim)!;
  const ekle = (b: Bilgi) => bilgiler.push(b);
  const biliyorMu = (kisi: KisiId, konu: BilgiKonusu) => bilgiler.some((b) => b.kisi === kisi && b.konu === konu);

  // 1) Fail her şeyi kendisinden bilir.
  if (olay.fail) {
    const f = olay.fail;
    ekle({ kisi: f, konu: 'olay-yeri', kaynak: 'kendisi', icerik: olay.oda, dogru: true });
    ekle({ kisi: f, konu: 'olay-zamani', kaynak: 'kendisi', icerik: String(olay.dilim), dogru: true });
    ekle({ kisi: f, konu: 'olay-yontemi', kaynak: 'kendisi', icerik: olay.yontem, dogru: true });
    ekle({ kisi: f, konu: 'fail-kimligi', kaynak: 'kendisi', icerik: f, dogru: true });
  }

  // 2) Hayatta kurban: yer ve zamanı kendisinden bilir; yöntemi çoğunlukla, faili bazen görmüştür.
  const kurban = vaka.kisiler.find((k) => k.id === olay.kurban)!;
  if (kurban.hayatta) {
    ekle({ kisi: kurban.id, konu: 'olay-yeri', kaynak: 'kendisi', icerik: olay.oda, dogru: true });
    ekle({ kisi: kurban.id, konu: 'olay-zamani', kaynak: 'kendisi', icerik: String(olay.dilim), dogru: true });
    if (r.sans(0.7)) ekle({ kisi: kurban.id, konu: 'olay-yontemi', kaynak: 'kendisi', icerik: olay.yontem, dogru: true });
    if (olay.fail && r.sans(0.3)) ekle({ kisi: kurban.id, konu: 'fail-kimligi', kaynak: 'gordu', icerik: olay.fail, dogru: true });
  }

  // 3) Herkes kendi konumunu bilir.
  for (const k of canlilar) {
    for (let d = 0; d < vaka.dilimler.length; d++) {
      ekle({ kisi: k.id, konu: 'konum', kaynak: 'kendisi', icerik: konum(k.id, d).oda, dogru: true, hedefKisi: k.id, hedefDilim: d });
    }
  }

  // 4) Algı: aynı odadakileri görme (dikkat boşluğuyla). Olay odasında olay anında görenler faili ve yöntemi de görür.
  for (const gozlemci of canlilar) {
    for (let d = 0; d < vaka.dilimler.length; d++) {
      const gz = konum(gozlemci.id, d);
      const p = DIKKAT_DAGITAN_EYLEMLER.includes(gz.eylem) ? GORME_OLASILIGI_DAGINIK : GORME_OLASILIGI_NORMAL;
      for (const hedef of vaka.kisiler) {
        if (hedef.id === gozlemci.id) continue;
        const hz = konum(hedef.id, d);
        if (hz.oda !== gz.oda) continue;
        if (!r.sans(p)) continue; // dikkat boşluğu: aynı odada ama fark etmedi
        ekle({ kisi: gozlemci.id, konu: 'konum', kaynak: 'gordu', icerik: hz.oda, dogru: true, hedefKisi: hedef.id, hedefDilim: d });
        // Görgü tanıklığı: olay anında olay odasında faili gördü
        if (olay.fail && d === olay.dilim && gz.oda === olay.oda && hedef.id === olay.fail && gozlemci.id !== olay.fail) {
          if (!biliyorMu(gozlemci.id, 'fail-kimligi')) ekle({ kisi: gozlemci.id, konu: 'fail-kimligi', kaynak: 'gordu', icerik: olay.fail, dogru: true });
          if (!biliyorMu(gozlemci.id, 'olay-yontemi')) ekle({ kisi: gozlemci.id, konu: 'olay-yontemi', kaynak: 'gordu', icerik: olay.yontem, dogru: true });
        }
      }
    }
  }

  // 5) Dedikodu: başkasının gördüğü bir konumu duyup aktarma; bazen bozulur (bellek uyumu tohumu).
  const gorulenler = bilgiler.filter((b) => b.konu === 'konum' && b.kaynak === 'gordu');
  for (const dinleyen of canlilar) {
    for (const g of gorulenler) {
      if (g.kisi === dinleyen.id) continue;
      if (!r.sans(DEDIKODU_OLASILIGI)) continue;
      // Zaten kendisi biliyorsa (kendi konumu ya da gördü) dedikodu eklenmez.
      const zatenBiliyor = bilgiler.some((b) => b.kisi === dinleyen.id && b.konu === 'konum' && b.hedefKisi === g.hedefKisi && b.hedefDilim === g.hedefDilim);
      if (zatenBiliyor) continue;
      const bozuk = r.sans(DEDIKODU_BOZULMA_OLASILIGI);
      const icerik = bozuk ? r.sec(vaka.mekan.odalar.filter((o) => o.id !== g.icerik)).id : g.icerik;
      ekle({ kisi: dinleyen.id, konu: 'konum', kaynak: 'dedikodu', icerik, dogru: !bozuk, hedefKisi: g.hedefKisi, hedefDilim: g.hedefDilim });
    }
  }

  // 6) Medya: yer ve zaman kamuya açık; yöntem bazen sızar.
  const medyayaSizanKonular: BilgiKonusu[] = ['olay-yeri', 'olay-zamani'];
  if (olay.fail && r.sans(YONTEM_SIZMA_OLASILIGI)) medyayaSizanKonular.push('olay-yontemi');
  for (const k of canlilar) {
    if (!biliyorMu(k.id, 'olay-yeri')) ekle({ kisi: k.id, konu: 'olay-yeri', kaynak: 'medya', icerik: olay.oda, dogru: true });
    if (!biliyorMu(k.id, 'olay-zamani')) ekle({ kisi: k.id, konu: 'olay-zamani', kaynak: 'medya', icerik: String(olay.dilim), dogru: true });
    if (medyayaSizanKonular.includes('olay-yontemi') && !biliyorMu(k.id, 'olay-yontemi')) {
      ekle({ kisi: k.id, konu: 'olay-yontemi', kaynak: 'medya', icerik: olay.yontem, dogru: true });
    }
  }

  return { bilgiler, medyayaSizanKonular };
}

/** Bir konuyu (herhangi bir kaynaktan) bilen kişilerin tekrarsız listesi. */
export function kimBiliyor(dagilim: BilgiDagilimi, konu: BilgiKonusu): KisiId[] {
  return [...new Set(dagilim.bilgiler.filter((b) => b.konu === konu).map((b) => b.kisi))];
}

/**
 * Gizli bilgi testi bu konuda geçerli mi?
 * Geçerli = konuyu bilenlerin hepsi "meşru" bilenler (fail, kurban, görgü tanığı) ve
 * hiç kimse medya/dedikodu yoluyla öğrenmemiş. Aksi halde masum da tanıma tepkisi verir.
 */
export function citGecerliMi(vaka: Vaka, dagilim: BilgiDagilimi, konu: BilgiKonusu): boolean {
  if (!vaka.olay.fail) return false;
  const kayitlar = dagilim.bilgiler.filter((b) => b.konu === konu);
  if (kayitlar.some((b) => b.kaynak === 'medya' || b.kaynak === 'dedikodu' || b.kaynak === 'duydu')) return false;
  const mesru = new Set<KisiId>([vaka.olay.fail, vaka.olay.kurban]);
  for (const b of kayitlar) if (b.kaynak === 'gordu') mesru.add(b.kisi);
  return kayitlar.every((b) => mesru.has(b.kisi));
}
