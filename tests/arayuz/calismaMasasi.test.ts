import { expect, it } from 'vitest';
import { OyunDeposu } from '@arayuz/oyun/depo';

it('kaynaklı defter ve zaman çizelgesi kayıtta taşınır, yeni vakada temizlenir', () => {
  const d = new OyunDeposu(); d.yeniVaka('masa-1');
  d.notEkle('Kapı kapalıydı', 'Tanık ifadesi', 'ifade');
  const not = d.durum.masa.notlar[0]!;
  d.cizelgeEkle(not.id, 2);
  const b = new OyunDeposu(); expect(b.iceAktar(d.disaAktar())).toBe(true);
  expect(b.durum.masa.notlar[0]!.metin).toBe('Kapı kapalıydı');
  expect(b.durum.masa.cizelge[0]!.dilim).toBe(2);
  expect(b.durum.masa.cizelge[0]!.dayanak).toBe('');
  b.yeniVaka('masa-2'); expect(b.durum.masa.notlar).toEqual([]);
});

it('tamamlanan dosyanın notları ve kararı arşivde kalır', () => {
  const d = new OyunDeposu(); d.yeniVaka('arsiv-1'); d.notEkle('Notum', 'Dedektif', 'not');
  d.suclamaYap({ fail: null, guven: .7, gerekce: [] });
  const eski = d.durum.gecmis[0]!.dosya!;
  expect(eski.notlar[0]!.metin).toBe('Notum');
  expect(eski.karar).toBe('Suç yok'); expect(eski.gercek).toBeTruthy();
  d.yeniVaka('arsiv-2'); expect(d.durum.gecmis[0]!.dosya).toEqual(eski);
});

it('eski kayıtlar boş defterle açılır; not silme çizelge bağını temizler', () => {
  const d = new OyunDeposu(); d.yeniVaka('eski-masa');
  const kayit = JSON.parse(d.disaAktar()); delete kayit.masa;
  expect(d.iceAktar(JSON.stringify(kayit))).toBe(true); expect(d.durum.masa.notlar).toEqual([]);
  d.notEkle('Deneme', 'Dedektif', 'not'); const id = d.durum.masa.notlar[0]!.id;
  d.cizelgeEkle(id, 0); d.notSil(id); expect(d.durum.masa.cizelge).toEqual([]);
});

it('doğrulama oyuncunun dayanağıdır; arşiv kopyası sonradan değişmez', () => {
  const d = new OyunDeposu(); d.yeniVaka('masa-dayanak');
  d.notEkle('İfade', 'Tanık', 'ifade'); d.cizelgeEkle(d.durum.masa.notlar[0]!.id, 0);
  const c = d.durum.masa.cizelge[0]!;
  d.cizelgeDuzenle(c.id, 1, 'Bağımsız kayıt');
  d.suclamaYap({ fail: null, guven: .7, gerekce: [] });
  d.cizelgeDuzenle(c.id, 2, 'Değiştirilmiş not');
  expect(d.durum.gecmis[0]!.dosya!.cizelge[0]!.dayanak).toBe('Bağımsız kayıt');
});

it('vakasız içe aktarım eski açık dosyayı bırakmaz; bozuk kayıt mevcut oyunu bozmaz', () => {
  const d = new OyunDeposu(); d.yeniVaka('aktif-dosya');
  const onceki = d.disaAktar();
  const hatali = JSON.parse(onceki); hatali.sorgu.defter = 5;
  expect(d.iceAktar(JSON.stringify(hatali))).toBe(false);
  expect(d.disaAktar()).toBe(onceki);
  const bos = new OyunDeposu();
  expect(d.iceAktar(bos.disaAktar())).toBe(true);
  expect(d.durum.sorgu).toBeNull(); expect(d.durum.masa.notlar).toEqual([]);
});
