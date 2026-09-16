// İlişki notu: kişi kartında rolle uyumlu, herkesçe bilinen kısa cümle ("Üç yıldır davalarını yürütüyor.").
//
// Neden var: kart "Nazlı'nın avukatı" deyip kesince kişiler kâğıt gibi kalıyordu. Bir cümlelik somut bağ
// (süre, yakınlık derecesi) hem gerçekçilik katar hem de sorgulamada "ne zamandır tanışıyorsunuz?" türü
// doğal başlangıç noktası verir. Gizli bilgi taşımaz: sır, koruma, fail, sıcaklık burada geçmez.
//
// Kurallar:
//   - Sayılar yaşla çelişmez: evlilik yılı ≤ küçük eşin yaşı − 18; meslek süresi ≤ yaş − meslek alt yaşı;
//     kardeşte yaş farkı gerçek farktır (0 → ikiz).
//   - Ayrı RNG akışı (gerceklik.ts: seed + kişi id) → ana akışı ve regresyon seed'lerini kaydırmaz.
import type { Rastgele } from '@ortak/rastgele';
import { basHarfBuyut } from '@ortak/turkce';

/** 1–10 arası sayılar yazıyla ("üç yıldır"), üstü rakamla ("14 yıldır"). */
export function sayiSoz(n: number): string {
  const SOZ = ['bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz', 'on'];
  return n >= 1 && n <= 10 ? SOZ[n - 1]! : String(n);
}

type Kim = { yas: number; cinsiyet: 'kadin' | 'erkek'; rol: string };

/** Rolün çıplak hali: "Nazlı'nın iş ortağı" → "iş ortağı". */
function ciplakRol(rol: string): string {
  return rol.split(' ').slice(1).join(' ');
}

/** [1, ust] aralığında yıl; ust < 1 ise null (cümle sayısız kurulur). */
function yil(r: Rastgele, ust: number, tavan = 30): number | null {
  const u = Math.min(ust, tavan);
  return u >= 1 ? r.tamsayi(1, u) : null;
}

/** Rolle uyumlu not üretir. Kurban için çağrılmaz. */
export function iliskiNotuUret(r: Rastgele, kisi: Kim, kurban: { yas: number }): string {
  const rol = ciplakRol(kisi.rol);
  const fark = kisi.yas - kurban.yas;
  const sec = (...secenekler: string[]) => r.sec(secenekler);
  let not: string;
  switch (rol) {
    case 'annesi':
    case 'babası':
      not = sec('Aynı evde yaşıyorlar.', 'Ayrı şehirde yaşıyor; o akşam ziyarete gelmişti.', 'Haftada bir görüşürler; aile yemeği o akşamdı.');
      break;
    case 'kardeşi':
      not = fark === 0 ? 'İkizler.' : `Aralarında ${sayiSoz(Math.abs(fark))} yaş var; ${fark > 0 ? 'büyük' : 'küçük'} olan o.`;
      break;
    case 'yeğeni':
      not = sec('Çocukluğundan beri sık görüşürler.', 'Aile toplantılarında görüşürler; çok yakın sayılmazlar.', 'Son bir yıldır işlerine yardım ediyor.');
      break;
    case 'kuzeni':
      not = sec('Aynı mahallede büyümüşler.', 'Yılda birkaç kez görüşürler.', 'Son yıllarda iş nedeniyle sık görüşür olmuşlar.');
      break;
    case 'üvey çocuğu': {
      const n = yil(r, kisi.yas - 16, 12);
      not = n ? `${basHarfBuyut(sayiSoz(n))} yıldır aynı evde.` : 'Yeni bir aile; henüz alışıyorlar.';
      break;
    }
    case 'eşi': {
      const n = yil(r, Math.min(kisi.yas, kurban.yas) - 18, 40);
      not = n ? `${basHarfBuyut(sayiSoz(n))} yıllık evli.` : 'Yeni evli.';
      break;
    }
    case 'sevgilisi':
      not = `${basHarfBuyut(sayiSoz(r.tamsayi(2, 30)))} aydır birlikte.`;
      break;
    case 'eski sevgilisi': {
      const n = yil(r, kisi.yas - 18, 10);
      not = n ? `${basHarfBuyut(sayiSoz(n))} yıl önce ayrılmışlar.` : 'Kısa süre önce ayrılmışlar.';
      break;
    }
    case 'iş ortağı': {
      const n = yil(r, kisi.yas - 22, 20);
      not = n ? `${basHarfBuyut(sayiSoz(n))} yıldır ortaklar.` : 'Ortaklık yeni kurulmuş.';
      break;
    }
    case 'çalışanı': {
      const n = yil(r, kisi.yas - 18, 25);
      not = n ? `${basHarfBuyut(sayiSoz(n))} yıldır yanında çalışıyor.` : 'Yeni işe başlamış.';
      break;
    }
    case 'muhasebecisi': {
      const n = yil(r, kisi.yas - 26, 20);
      not = n ? `${basHarfBuyut(sayiSoz(n))} yıldır hesaplarına bakıyor.` : 'Hesaplarına yeni bakmaya başlamış.';
      break;
    }
    case 'avukatı': {
      const n = yil(r, kisi.yas - 26, 20);
      not = n ? `${basHarfBuyut(sayiSoz(n))} yıldır davalarını yürütüyor.` : 'Davalarını yeni devralmış.';
      break;
    }
    case 'terapisti':
      not = `${basHarfBuyut(sayiSoz(r.tamsayi(3, 36)))} aydır haftada bir seans yapıyorlar.`;
      break;
    case 'asistanı':
      not = `${basHarfBuyut(sayiSoz(r.tamsayi(2, 36)))} aydır asistanı.`;
      break;
    case 'yakın arkadaşı': {
      const n = yil(r, Math.min(kisi.yas, kurban.yas) - 16, 30);
      not = n && n >= 2 ? `${basHarfBuyut(sayiSoz(n))} yıllık arkadaşlar.` : 'Yakın zamanda tanışıp hızla yakınlaşmışlar.';
      break;
    }
    case 'çocukluk arkadaşı':
      not = sec('Aynı sokakta büyümüşler.', 'İlkokuldan beri tanışıyorlar.', 'Aynı mahallede büyümüşler; yolları ayrılıp yeniden kesişmiş.');
      break;
    case 'komşusu': {
      const n = yil(r, kisi.yas - 18, 20);
      not = n ? `${basHarfBuyut(sayiSoz(n))} yıldır kapı komşusu.` : 'Yeni taşınmış.';
      break;
    }
    case 'iş rakibi':
      not = sec('Aynı sektörde; aynı ihalelere giriyorlar.', 'Yıllardır aynı müşteriler için yarışıyorlar.', 'Sektörde herkes rekabetlerini bilir.');
      break;
    case 'eski ortağı': {
      const n = yil(r, kisi.yas - 24, 10);
      not = n ? `${basHarfBuyut(sayiSoz(n))} yıl önce ortaklık bitmiş.` : 'Ortaklık kısa süre önce bitmiş.';
      break;
    }
    case 'davalısı':
      not = `Aralarında ${sayiSoz(r.tamsayi(2, 24))} aydır süren bir dava var.`;
      break;
    case 'misafiri':
      not = sec('O akşam ilk kez gelmiş.', 'Sık gelen bir misafir.', 'Ortak bir tanıdık aracılığıyla davet edilmiş.');
      break;
    case 'kiracısı': {
      const n = yil(r, kisi.yas - 18, 15);
      not = n ? `${basHarfBuyut(sayiSoz(n))} yıldır kiracısı.` : 'Yeni taşınmış.';
      break;
    }
    case 'bahçıvanı': {
      const n = yil(r, kisi.yas - 16, 30);
      not = n ? `${basHarfBuyut(sayiSoz(n))} yıldır bahçeye bakıyor.` : 'Bahçeye yeni bakmaya başlamış.';
      break;
    }
    case 'şoförü': {
      const n = yil(r, kisi.yas - 18, 25);
      not = n ? `${basHarfBuyut(sayiSoz(n))} yıldır şoförlüğünü yapıyor.` : 'Şoförlüğe yeni başlamış.';
      break;
    }
    case 'yakını':
      not = sec('Uzaktan akraba; ailede yakın sayılır.', 'Aile dostu; herkes onu yakından tanır.', 'Eski bir aile bağı; ayrıntısını kimse tam bilmiyor.');
      break;
    default:
      not = 'Yakın çevresinden.';
  }
  return not;
}
