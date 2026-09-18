// Oyuncuya dönük metinler: soru cümleleri ve teknik sonuç özetleri.
// Saf fonksiyonlar (DOM yok) → Node'da test edilir. Gizli bilgiyi sızdırmaz: CIT geçerliliği, ifade türü
// gibi motor iç bilgileri burada asla yazılmaz; onlar vaka sonu analizinde açılır.
import { basHarfBuyut, belirtme, bulunma } from '@ortak/turkce';
import { IC_SES_SECENEKLERI } from '@motor/araclar';
import type { Soru } from '@motor/strateji';
import type { TeknikSonucu } from '@motor/teknik';
import type { Vaka } from '@motor/tipler';

const ilkAd = (vaka: Vaka, id: string) => vaka.kisiler.find((k) => k.id === id)?.ad.split(' ')[0] ?? id;
const odaAdi = (vaka: Vaka, id: string) => vaka.mekan.odalar.find((o) => o.id === id)?.ad ?? id;
const saat = (vaka: Vaka, dilim: number) => vaka.dilimler[dilim]?.baslangic ?? '?';
/** Gündelik ondalık: virgülle (USLUP §3). */
const ondalik = (x: number) => x.toFixed(1).replace('.', ',');

/** Oyuncunun sorduğu sorunun metni. */
export function soruMetni(soru: Soru, vaka: Vaka, kisiId: string): string {
  if (soru.tur === 'olay-bilgisi') {
    return soru.konu === 'olay-yontemi' ? 'Olayın nasıl olduğuna dair ne biliyorsun?' : 'Olay anında orada kimi gördün?';
  }
  if (soru.hedef === kisiId) return `${saat(vaka, soru.dilim)} civarında neredeydin?`;
  return `${saat(vaka, soru.dilim)} civarında ${belirtme(ilkAd(vaka, soru.hedef))} gördün mü? Neredeydi?`;
}

/** Teknik sonucunun oyuncuya sunumu. kisiId, kayıt incelemede sorunun kimin için sorulduğunu yazmak için. */
export function teknikSonucMetni(sonuc: TeknikSonucu, vaka: Vaka, kisiId = ''): string {
  switch (sonuc.teknik) {
    case 'temel-cizgi':
      return sonuc.gozlemler.length === 0
        ? 'Havadan, yoldan, işinden konuştunuz. Sakin ve akıcı; dikkat çeken bir şey yok. Bu onun normali.'
        : `Havadan, yoldan, işinden konuştunuz. Onun normali şöyle: ${sonuc.gozlemler.map((g) => g.betimleme).join(' ')}`;
    case 'acik-uclu-anlatim':
      return 'Akşamı baştan sona anlatmasını istedin.';
    case 'yonlendirici-soru':
      return sonuc.kontamineOldu
        ? 'Sorunun içindeki öneriyi benimsedi ve anlatımını ona göre kurdu. Bu ayrıntıyı ilk sen söyledin; kayda geçti.'
        : 'Sorunun içindeki öneriden etkilenmedi.';
    case 'sue': {
      const bas = `Delili gösterdin: ${sonuc.delil.aciklama}`;
      if (sonuc.erkenGosterildi) return `${bas} Delili, o anlatmadan önce göstermiştin; anlatımını delile uydurdu ve çelişki çıkmadı.`;
      return sonuc.celiski ? `${bas} Delil, anlattıklarıyla çelişiyor.` : `${bas} Delil, anlattıklarıyla uyuşuyor.`;
    }
    case 'bilissel-yuk-ters-sira': {
      if (sonuc.celiskiler.length === 0) return 'Akşamı sondan başa anlattı; önceki anlatımıyla tutarlı kaldı.';
      const liste = sonuc.celiskiler.map((c) => `${saat(vaka, c.dilim)}: önce ${odaAdi(vaka, c.ilk ?? '')}, şimdi ${odaAdi(vaka, c.simdi ?? '')}`).join('; ');
      return `Akşamı sondan başa anlattı ve ${sonuc.celiskiler.length} yerde önceki anlatımıyla çelişti (${liste}).`;
    }
    case 'beklenmedik-soru': {
      if (sonuc.iddiaEdilenOda === null) return `${saat(vaka, sonuc.dilim)} için nerede olduğunu söyleyemedi; soru boşa gitti.`;
      const soru = `"${basHarfBuyut(bulunma(odaAdi(vaka, sonuc.iddiaEdilenOda)))} başka kim vardı?" diye sordun;`;
      if (sonuc.adiGecenler.length === 0) return `${soru} kimseyi hatırlamadı.`;
      return `${soru} şu adları saydı: ${sonuc.adiGecenler.map((a) => ilkAd(vaka, a)).join(', ')}.`;
    }
    case 'gizli-bilgi-testi':
      return sonuc.tepki === 'tanima'
        ? 'Olası yöntemleri tek tek saydın. Gerçek yöntem geçince belirgin bir tanıma tepkisi verdi: kısa bir duraksama, dikkatin kilitlenmesi.'
        : 'Olası yöntemleri tek tek saydın. Hiçbirinde ayırt edici bir tepki vermedi.';
    case 'zorunlu-iki-secenek':
      if (sonuc.skor === null) return 'Bu soruya zaten cevap vermişti; iki seçenekli test uygulanamaz.';
      return `${sonuc.n} iki seçenekli sorudan ${sonuc.skor} tanesini doğru bildi. ${sonuc.sansAlti ? 'Bu, şans düzeyinin belirgin biçimde altında.' : 'Bu, şans düzeyine yakın.'}`;
    case 'saskinlik-testi':
      return sonuc.sasirdi ? 'Bilgiyi açıkladığında belirgin biçimde şaşırdı.' : 'Bilgiyi açıkladığında şaşırmadı; sakin karşıladı.';
    case 'sahte-bilgi-yemi':
      return sonuc.onayladi ? `"${sonuc.uydurmaAd}" adını duyunca onayladı ve ayrıntı ekledi.` : `"${sonuc.uydurmaAd}" adını tanımadı.`;
    case 'seytanin-avukati':
      return `Uygulanamadı: ${sonuc.neden}`;
    case 'suclayici-ton':
      if (sonuc.sahteItiraf || sonuc.itiraf) return `Sesini yükseltip onu suçladın (baskı düzeyi ${ondalik(sonuc.stres)}). Çöktü: "Tamam… ben yaptım."`;
      return `Sesini yükseltip onu suçladın (baskı düzeyi ${ondalik(sonuc.stres)}). İçine kapandı; cevapları kısaldı, gerildi.`;
    // --- Diğer araçlar: kişilik ve sır okur; gizli tür/kategori burada yazılmaz ---
    case 'oda-okuma':
      return `Odasına baktın. ${sonuc.okuma.esyalar.map((e) => e.betimleme).join(' · ')} Her eşyayı sınıfla: kendini mi anlatıyor, bir alışkanlığın izi mi, yoksa göstermelik mi?`;
    case 'dijital-iz': {
      const p = sonuc.profil;
      const ton = p.kurbanaDairTon === 'yok' ? 'Kurban hakkında hiç paylaşımı yok.' : `Kurban hakkındaki son paylaşımı ${{ sicak: 'sıcak', notr: 'nötr', soguk: 'soğuk' }[p.kurbanaDairTon]} bir tonda.`;
      return `Sosyal medya profili: ${p.arkadas} arkadaş, haftada ${p.haftalikPaylasim} paylaşım, ${p.foto} fotoğraf, ${p.grup} grup. Beğendikleri: ${p.begeniler.join(', ')}. ${ton}`;
    }
    case 'ic-ses':
      if (sonuc.uygulanamaz) return `Uygulanamadı: ${sonuc.neden}`;
      return `Tahminini kaydettin: ${IC_SES_SECENEKLERI[sonuc.tahmin]} Gerçekte ne düşündüğünü vaka sonunda göreceksin. (Ickes 1990'da birbirini tanımayan insanlar karşısındakinin düşüncesini ortalama %22 isabetle tahmin etti.)`;
    case 'kayit-inceleme': {
      if (sonuc.uygulanamaz) return `Uygulanamadı: ${sonuc.neden}`;
      const bas = `Kaydı yavaşlatıp yeniden izledin ("${soruMetni(sonuc.soru, vaka, kisiId)}").`;
      if (!sonuc.temelCizgiVar) return `${bas} Temel çizgiyi kurmadığın için neyin onun normali olduğunu bilmiyorsun; ilk izlediğini "normal" sanma (sıra yanlılığı). Gözlemler aşağıda.`;
      const normali = sonuc.normali.length ? sonuc.normali.map((g) => g.betimleme).join(' ') : 'yok.';
      const sapma = sonuc.sapmalar.length ? sonuc.sapmalar.map((g) => g.betimleme).join(' ') : 'yok.';
      return `${bas} Temel çizgiyle karşılaştırdın. Onun normaline uyanlar: ${normali} Sapmalar: ${sapma} Sapma sorulacak bir konudur, kanıt değil; etkisi de küçüktür.`;
    }
    default:
      return 'Uygulandı.';
  }
}
