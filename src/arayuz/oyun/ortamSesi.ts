// Çevrimdışı ortam sesi: Web Audio ile yağmur, şehir uğultusu, kâğıt ve fincan dokuları.
// Kullanıcı açıkça başlatmadan AudioContext kurulmaz; kapatınca bütün kaynaklar bırakılır.
export type SesTuru = 'yagmur' | 'sehir' | 'kagit' | 'fincan';
export type Sesler = Record<SesTuru, number>;
export const SESLER: Sesler = { yagmur: 25, sehir: 12, kagit: 10, fincan: 10 };
export class OrtamSesi {
  private ctx: AudioContext | null = null;
  private kanallar = new Map<SesTuru, GainNode>();
  private donguler: AudioBufferSourceNode[] = [];
  private zamanlayici: ReturnType<typeof setInterval> | null = null;
  private gecikme: ReturnType<typeof setTimeout> | null = null;
  private gorunurluk = () => { if (document.hidden) void this.ctx?.suspend(); else void this.ctx?.resume().catch(() => {}); };
  async baslat(sesler: Sesler) {
    if (this.ctx) return;
    try {
      const ctx = new AudioContext(); this.ctx = ctx;
      for (const ad of Object.keys(SESLER) as SesTuru[]) {
        const gain = ctx.createGain(); gain.gain.value = sesler[ad] / 100 * .22; gain.connect(ctx.destination); this.kanallar.set(ad, gain);
      }
      for (const ad of ['yagmur', 'sehir'] as const) {
        const source = ctx.createBufferSource(); source.buffer = this.gurultu(4); source.loop = true;
        const filtre = ctx.createBiquadFilter(); filtre.type = 'lowpass'; filtre.frequency.value = ad === 'yagmur' ? 2400 : 170;
        source.connect(filtre).connect(this.kanallar.get(ad)!); source.start(); this.donguler.push(source);
      }
      this.zamanlayici = setInterval(() => { if (!document.hidden) { this.ornek('kagit'); this.gecikme = setTimeout(() => this.ornek('fincan'), 2200); } }, 18000);
      document.addEventListener('visibilitychange', this.gorunurluk);
      await ctx.resume();
    } catch (e) { this.durdur(); throw e; }
  }
  private gurultu(saniye: number) {
    const ctx = this.ctx!; const b = ctx.createBuffer(1, ctx.sampleRate * saniye, ctx.sampleRate);
    const data = b.getChannelData(0); for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return b;
  }
  ayarla(ad: SesTuru, deger: number) { const ctx = this.ctx; if (ctx) this.kanallar.get(ad)?.gain.setTargetAtTime(Math.max(0, Math.min(100, deger)) / 100 * .22, ctx.currentTime, .15); }
  /** Kısa sesler hem seyrek otomatik çalar hem de kullanıcı tarafından denenebilir. */
  ornek(ad: 'kagit' | 'fincan') {
    const ctx = this.ctx; if (!ctx || ctx.state !== 'running') return;
    const z = ctx.currentTime; const env = ctx.createGain(); env.connect(this.kanallar.get(ad)!);
    env.gain.setValueAtTime(.001, z); env.gain.exponentialRampToValueAtTime(ad === 'kagit' ? .4 : .24, z + .015); env.gain.exponentialRampToValueAtTime(.001, z + .8);
    if (ad === 'kagit') {
      const s = ctx.createBufferSource(); s.buffer = this.gurultu(1); const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1600; s.connect(f).connect(env); s.start(); s.stop(z + 1); s.onended = () => { s.disconnect(); f.disconnect(); env.disconnect(); };
    } else {
      const s = ctx.createOscillator(); s.type = 'sine'; s.frequency.value = 1850; s.connect(env); s.start(); s.stop(z + 1); s.onended = () => { s.disconnect(); env.disconnect(); };
    }
  }
  durdur() {
    if (this.gecikme) clearTimeout(this.gecikme); this.gecikme = null;
    if (this.zamanlayici) clearInterval(this.zamanlayici); this.zamanlayici = null;
    document.removeEventListener('visibilitychange', this.gorunurluk);
    this.donguler.forEach(s => { s.stop(); s.disconnect(); }); this.donguler = [];
    void this.ctx?.close(); this.ctx = null; this.kanallar.clear();
  }
}
