# USLUP.md — Türkçe üslup kılavuzu ve terim sözlüğü

> Oyundaki her Türkçe metin bu dosyaya göre yazılır ve düzeltilir. Yeni içerik (Kılavuz maddesi, şablon, etiket) eklerken önce buraya bak; yeni bir terim karara bağlanırsa tabloya ekle. İlk sürüm: 2026-09-18 (K-018, MTPE turu).

## 1. İlke

Metin, İngilizceden çevrilmiş gibi değil, baştan Türkçe yazılmış gibi okunmalı. Anlam ve bilimsel iddia aynı kalır; sayılar, kaynaklar ve kanıt düzeyleri değişmez. Bir ifade Türkçede yapay duruyorsa, sırf mevcut metne sadık kalmak için korunmaz.

- Anlamı değiştirme, bilgi ekleme, iddiayı güçlendirme ya da zayıflatma.
- Davranışı kesin sonuç gibi sunma: davranış "sorulacak konu"dur, kanıt delille gelir.
- İngilizce kaynak, anlam ve terim doğrulamak için kullanılır; metin baştan çevrilmez.

## 2. Katmanlara göre ses

| Katman | Nerede | Ses |
|---|---|---|
| Kılavuz | `kilavuz.json`, `teknikler.json`, `ipuclari.json` (`not`), `ifade_turleri.json` | Açık, sade, öğretici, güvenilir. Tam cümle. Oyuncuya "sen". Bilimsel ayrıntı korunur ama cümle içinde anlatılır. |
| Arayüz ve geri bildirim | ekranlar, `metinler.ts`, `puan.ts`, `hata_etiketleri.json`, Analiz | Kısa, net, yargılamayan. Oyuncuya "sen". "Başarısız oldun" değil, "şunu öğrendin" (Dweck). |
| Vaka ve sorgu anlatısı | brifing, delil, oda eşyası, davranış betimlemeleri | Kısa, somut, gerektiğinde atmosferik. Anlatıcı oyuncuya "sen" der ("sana bakıyordu"). |
| Karakter diyalogları | `dil.ts` şablonları, iç ses, itiraf | Konuşma dili. Kişiler dedektife "siz" der; kısa cümle, eksiltili yapı serbest. |
| Takım | `takim.ts`, `takim_hikaye.ts` | Her üyenin kendi sesi: lider ölçülü, sorgucu kısa, analist yumuşak, saha ajanı rahat. Oyuncuya "sen". |

## 3. Biçim kuralları

1. **Sembol yok:** düz metinde `=`, `→`, `≠`, `vs`, `×` kullanılmaz; yerine sözcük ("demektir", "sonra", "değildir", "karşı", "ile"). Sayısal formül gerekiyorsa (Linda, taban oranı) kısa ve tek başına.
2. **İki nokta zinciri yok:** bir cümlede en fazla bir iki nokta. Arayüzde bir etiketin ardından iki noktalı bir başlık geliyorsa cümleyi yeniden kur ("Bu konuyu Kılavuz'daki … maddesinde çalışabilirsin.").
3. **Etiket adları kavram adıdır:** hata etiketleri ve sınıf adları isim öbeği olur ("Tanığı yönlendirme", "Gözden kaçan ipucu"); açıklamalar ikinci tekil geçmiş zamanla yazılır ("…kanıt saydın").
4. **Sayılar:** gündelik ondalıkta virgül ("5 üzerinden 4,26"); istatistik katsayıları APA yazımıyla ve yalnızca Kılavuz'da ("r = .39", "d = .25"). Yüzde "%54".
5. **İngilizce terim:** yalnızca bilinen bir kavramın arama adıysa ve yalnızca Kılavuz'da, ilk geçtiği yerde parantez içinde ("sıcak okuma (hot reading)"). Arayüz etiketlerinde İngilizce yok.
6. **Kısaltmalar:** SUE ve CIT Kılavuz'da açılır; arayüzde Türkçe ad kullanılır ("Gizli bilgi testi").
7. **Kaynak adları** (`"Vrij 2010 PSPI"` gibi) kütük anahtarıdır, çevrilmez (K-004).
8. **Süre:** teknik maliyeti "sa" ile gösterilir ("1 sa", "0,5 sa"); "s" saniye diye okunur.

## 4. Terim sözlüğü

| Kullan | Kaynak terim | Kullanma / not |
|---|---|---|
| temel çizgi (kişinin normali) | baseline | "baseline" yazma; ilk geçişte "kişinin normali" ile açıkla |
| stratejik delil kullanımı (SUE) | Strategic Use of Evidence | arayüzde yalnızca Türkçe |
| gizli bilgi testi | Concealed Information Test (CIT/GKT) | "CIT/GKT" arayüzde yok |
| iki seçenekli test | Symptom Validity Test | "Symptom Validity Test", "zorunlu iki seçenek" |
| sondan başa anlattırma (bilişsel yük) | reverse-order recall | "ters sırayla anlattırma" da olur; başlıkta bu |
| serbest anlatım | free recall | "açık uçlu serbest anlatım" (tekrar) |
| sahte bilgi yemi | psychic baiting | İngilizcesi yalnızca Kılavuz'da |
| sıcak okuma | hot reading | "hot reading" |
| soğuk okuma | cold reading | — |
| kendi yeteneğine inanan medyum | shut-eye | "shut-eye" arayüzde yok |
| üstüne gidilecek nokta | hotspot | "hotspot" |
| görünüş yanlılığı | demeanor bias | — |
| gevşeme anı | off-beat | başlıkta bir kez "(off-beat)" |
| kimlik mesajı: kendine / başkalarına verdiği mesaj | identity claim (self-/other-directed) | "kimlik iddiası" |
| davranış izi: odadaki alışkanlık izi / dışarıdaki hayatının izi | behavioral residue (interior / exterior) | "davranış kalıntısı", "iç/dış kalıntı" |
| göstermelik düzen | staged (izlenim için düzenlenmiş oda) | oda için "sahnelenmiş" yok; "sahnelenmiş" yalnızca suç/delil sahnesi için |
| öz-izleme | self-monitoring | — |
| çıpalama etkisi | anchoring | "çapalama" |
| doğrulama yanlılığı | confirmation bias | — |
| doğruluk yanlılığı / yalan yanlılığı | truth bias / lie bias | — |
| hale etkisi | halo effect | — |
| tipik suçlu yanılgısı (temsil edicilik) | representativeness | etiket adında "Temsil edicilik (tipik suçlu)" yok |
| birleşim yanılgısı | conjunction fallacy | — |
| taban oranı | base rate | — |
| kısayol (zihinsel kısayol) | heuristic | "heuristik", "heuristiği" |
| içimizdeki hikâyeci | the interpreter (Gazzaniga; Konnikova) | "iç masalcı" |
| tepkisellik | reactance | "reaktans" |
| konfabulasyon | confabulation | ilk geçişte "dürüst ama uydurma açıklama" |
| bellek uyumu | memory conformity | — |
| tanığı yönlendirme / anıyı kirletme | witness contamination | etiket adı "Tanığı yönlendirme"; "tanık kirletme" yok |
| yanlış bilgi etkisi | misinformation effect | — |
| dikkatsizlik körlüğü | inattentional blindness | — |
| seçim körlüğü | choice blindness | — |
| yanlış yönlendirme | misdirection | — |
| ince dilim | thin slice | — |
| empatik doğruluk | empathic accuracy | — |
| refrakter dönem | refractory period | ilk geçişte açıkla |
| gösterim kuralları | display rules | — |
| Funder'ın dört aşaması: ilgililik, erişim, fark etme, yorumlama | RAM: relevance, availability, detection, utilization | "RAM 2. halka", "dört halka" |
| kaçamak cevap | equivocation / technically true | "Kaçamak / teknik olarak doğru" |
| gömülü yalan | embedded lie | — |
| koruma yalanı | protective lie | — |
| alakasız sır | unrelated secret | — |
| sahte itiraf | false confession | — |

## 5. Kod tarafında metin düzeltirken

- **Havuz boyutu sabit:** şablon/betimleme dizilerine eleman ekleme ya da çıkarma; yalnızca metni değiştir. Aksi hâlde seedli seçimler kayar ve regresyon anlık görüntüleri bozulur.
- **Kimlikler değişmez:** `id`, `kilavuzMaddesi`, `tur` gibi alanlar çevrilmez; yalnızca `ad`, `baslik`, `aciklama` vb. görünen alanlar düzeltilir.
- **Mantıkta kullanılan dizeler:** `teknik.ts` özetleri (`'erken gösterildi'`, `'çelişki'`) `puan.ts`'de karşılaştırılır; dokunma.
- **Gizli bilgi sızmaz:** oyun sırasında gösterilen metne ifade türü, eşya türü, iç ses gerçeği yazılmaz. Sızma testleri (`araclarDepo`, `cila3`, `takim`) yeni terimlerle güncel tutulur.
- **Temel çizgi betimlemeleri** soru/cevap/hikâye sözcüklerini içermez (`temelCizgiBetimleme.test.ts`).
