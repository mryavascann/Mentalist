// Oyuncuya dönük metinler: soru cümleleri ve teknik sonuç özetleri.
// Saf fonksiyonlar (DOM yok) → Node'da test edilir. Gizli bilgiyi sızdırmaz: CIT geçerliliği, ifade türü
// gibi motor iç bilgileri burada asla yazılmaz; onlar vaka sonu analizinde açılır.
import { belirtme } from '@ortak/turkce';
import type { Soru } from '@motor/strateji';
import type { TeknikSonucu } from '@motor/teknik';
import type { Vaka } from '@motor/tipler';

const ilkAd = (vaka: Vaka, id: string) => vaka.kisiler.find((k) => k.id === id)?.ad.split(' ')[0] ?? id;
const odaAdi = (vaka: Vaka, id: string) => vaka.mekan.odalar.find((o) => o.id === id)?.ad ?? id;
const saat = (vaka: Vaka, dilim: number) => vaka.dilimler[dilim]?.baslangic ?? '?';

/** Oyuncunun sorduğu sorunun metni. */
export function soruMetni(soru: Soru, vaka: Vaka, kisiId: string): string {
  if (soru.tur === 'olay-bilgisi') {
    return soru.konu === 'olay-yontemi' ? 'Olayın nasıl olduğuna dair ne biliyorsun?' : 'Olay anında orada kimi gördün?';
  }
  if (soru.hedef === kisiId) return `${saat(vaka, soru.dilim)} civarında neredeydin?`;
  return `${saat(vaka, soru.dilim)} civarında ${belirtme(ilkAd(vaka, soru.hedef))} gördün mü? Neredeydi?`;
}

/** Teknik sonucunun oyuncuya sunumu. */
export function teknikSonucMetni(sonuc: TeknikSonucu, vaka: Vaka): string {
  switch (sonuc.teknik) {
    case 'temel-cizgi':
      return sonuc.gozlemler.length === 0
        ? 'Tarafsız sohbet (hava, yol, işi): sakin ve akıcı. Dikkat çeken bir şey yok; bu onun normali.'
        : `Tarafsız sohbet (hava, yol, işi). Bu onun normali: ${sonuc.gozlemler.map((g) => g.betimleme).join(' ')}`;
    case 'acik-uclu-anlatim':
      return 'Akşamı baştan sona anlatmasını istedin.';
    case 'yonlendirici-soru':
      return sonuc.kontamineOldu
        ? 'Sorunun içindeki öneriyi benimsedi ve ona göre anlattı. (Bu ayrıntıyı ilk sen söyledin; kayda geçti.)'
        : 'Sorunun içindeki öneriden etkilenmedi.';
    case 'sue': {
      const bas = `Delili açtın: ${sonuc.delil.aciklama}`;
      if (sonuc.erkenGosterildi) return `${bas} Delili anlatımdan önce göstermiştin; anlatımını delile uydurdu, çelişki çıkmadı.`;
      return sonuc.celiski ? `${bas} Anlattığıyla delil ÇELİŞİYOR.` : `${bas} Anlattığıyla delil uyuşuyor.`;
    }
    case 'bilissel-yuk-ters-sira': {
      if (sonuc.celiskiler.length === 0) return 'Akşamı sondan başa anlattı; önceki anlatımıyla tutarlı kaldı.';
      const liste = sonuc.celiskiler.map((c) => `${saat(vaka, c.dilim)}: önce ${odaAdi(vaka, c.ilk ?? '')}, şimdi ${odaAdi(vaka, c.simdi ?? '')}`).join('; ');
      return `Akşamı sondan başa anlattı ve ${sonuc.celiskiler.length} yerde önceki anlatımıyla çelişti (${liste}).`;
    }
    case 'beklenmedik-soru': {
      if (sonuc.iddiaEdilenOda === null) return `${saat(vaka, sonuc.dilim)} için yerini söyleyemediği için soru boşa düştü.`;
      const yer = odaAdi(vaka, sonuc.iddiaEdilenOda);
      if (sonuc.adiGecenler.length === 0) return `"${yer} içinde başka kim vardı?" → Kimseyi hatırlamadı.`;
      return `"${yer} içinde başka kim vardı?" → ${sonuc.adiGecenler.map((a) => ilkAd(vaka, a)).join(', ')}.`;
    }
    case 'gizli-bilgi-testi':
      return sonuc.tepki === 'tanima'
        ? 'Yöntem seçeneklerini sıraladın. Gerçek seçenekte belirgin bir tanıma tepkisi: kısa duraksama, dikkat kilitlenmesi.'
        : 'Yöntem seçeneklerini sıraladın. Seçenekler arasında ayırt edilir bir tepki yok.';
    case 'zorunlu-iki-secenek':
      if (sonuc.skor === null) return 'Zaten bir cevap vermişti; iki seçenekli test uygulanamaz.';
      return `${sonuc.n} iki seçenekli soru: ${sonuc.skor}/${sonuc.n} doğru. ${sonuc.sansAlti ? 'Şans düzeyinin belirgin altında.' : 'Şans düzeyi civarı.'}`;
    case 'saskinlik-testi':
      return sonuc.sasirdi ? 'Bilgiyi açıkladığında belirgin biçimde şaşırdı.' : 'Bilgiyi açıkladığında şaşırmadı; sakin karşıladı.';
    case 'sahte-bilgi-yemi':
      return sonuc.onayladi ? `"${sonuc.uydurmaAd}" adını duyunca onayladı ve ayrıntı ekledi.` : `"${sonuc.uydurmaAd}" adını tanımadı.`;
    case 'seytanin-avukati':
      return `Uygulanamadı: ${sonuc.neden}`;
    case 'suclayici-ton':
      if (sonuc.sahteItiraf || sonuc.itiraf) return `Sesini yükselttin, suçladın. Baskı ${sonuc.stres.toFixed(1)}. Çöktü: "Tamam… ben yaptım."`;
      return `Sesini yükselttin, suçladın. Baskı ${sonuc.stres.toFixed(1)}. Kapandı; cevapları kısaldı, gerginleşti.`;
    default:
      return 'Uygulandı.';
  }
}
