// @vitest-environment jsdom
// Arayüz duman testi: başlık → yeni vaka → kişi seç → soru sor → pano → suçlama → analiz → Kılavuz.
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { App } from '@arayuz/App';
import { depo, kaydiSil } from '@arayuz/oyun/kullan';

beforeEach(() => {
  cleanup();
  kaydiSil();
  depo.sifirla();
});

describe('App duman testi', () => {
  it('bir vaka baştan sona oynanabiliyor', () => {
    render(<App />);
    expect(screen.getAllByText('THE MENTALIST').length).toBeGreaterThan(0);

    fireEvent.change(screen.getByPlaceholderText(/Adını yaz/), { target: { value: 'Deniz' } });
    fireEvent.change(screen.getByPlaceholderText(/örn\./), { target: { value: 'duman-1' } });
    fireEvent.click(screen.getByText('Yeni vaka'));

    // İlk vakadan önce Forer dersi: sorular → profil → puan → ifşa
    expect(depo.durum.ekran).toBe('forer');
    fireEvent.click(screen.getByText('Analizimi hazırla'));
    expect(screen.getByText(/Kişilik analizin/)).toBeTruthy();
    fireEvent.click(screen.getByText('Puanla'));
    expect(screen.getByText('İfşa')).toBeTruthy();
    expect(depo.durum.forer.tamamlandi).toBe(true);
    fireEvent.click(screen.getByText('Anladım, dosyaya geç'));
    expect(depo.durum.ekran).toBe('vaka-acilis');

    // Vaka açılışı: brifing ve kişi kartları
    const vaka = depo.durum.sorgu!.durum.vaka;
    expect(screen.getAllByText(new RegExp(vaka.mekan.ad)).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Görüş').length).toBe(depo.gorusulebilirler().length);

    // Sorgu: ilk kişiyle görüş, saat düğmesine bas
    fireEvent.click(screen.getAllByText('Görüş')[0]!);
    expect(depo.durum.ekran).toBe('sorgu');
    const saat = vaka.dilimler[2]!.baslangic;
    const panel = screen.getByText('Neredeydin?').parentElement!;
    fireEvent.click(within(panel).getByRole('button', { name: saat }));
    const kisi = depo.durum.seciliKisi!;
    expect(depo.durum.konusmalar.get(kisi)!.length).toBe(1);
    expect(screen.getByText(new RegExp(`Sen: ${saat}`))).toBeTruthy();

    // Teknik: temel çizgi
    fireEvent.click(screen.getByText(/Sohbet \/ temel çizgi/));
    expect(depo.durum.konusmalar.get(kisi)!.length).toBe(2);
    expect(depo.durum.zaman).toBeGreaterThan(0);

    // Pano
    fireEvent.click(screen.getByRole('button', { name: 'Pano' }));
    const girdi = screen.getAllByPlaceholderText('ekle…')[0]!;
    fireEvent.change(girdi, { target: { value: 'Kapı zorlanmamış' } });
    fireEvent.keyDown(girdi, { key: 'Enter' });
    expect(depo.durum.pano.gozlem).toEqual(['Kapı zorlanmamış']);

    // Suçlama
    fireEvent.click(screen.getByRole('button', { name: 'Suçlama' }));
    fireEvent.click(screen.getByLabelText(/Suç yok/));
    fireEvent.click(screen.getByText('Suçlamayı ver'));
    expect(depo.durum.ekran).toBe('analiz');
    expect(depo.durum.puan).not.toBeNull();
    expect(screen.getByText('Aslında ne oldu')).toBeTruthy();

    // Kılavuz
    fireEvent.click(screen.getAllByRole('button', { name: 'Kılavuz' })[0]!);
    expect(screen.getByText('Mitler Müzesi')).toBeTruthy();
    fireEvent.click(screen.getByText(/Göze bakamayan yalancıdır/));
    expect(screen.getByText('Nasıl kullanılır')).toBeTruthy();
  });

  it('kayıt tarayıcı depolamasına yazılır ve yeniden yüklenir', () => {
    render(<App />);
    fireEvent.change(screen.getByPlaceholderText(/örn\./), { target: { value: 'duman-kayit' } });
    fireEvent.click(screen.getByText('Yeni vaka'));
    fireEvent.click(screen.getByText('Analizimi hazırla'));
    fireEvent.click(screen.getByText('Puanla'));
    fireEvent.click(screen.getByText('Anladım, dosyaya geç'));
    const seed = depo.durum.sorgu!.durum.vaka.seed;
    const json = localStorage.getItem('the-mentalist:kayit');
    expect(json).toBeTruthy();
    expect(JSON.parse(json!).seed).toBe(seed);
  });
});
