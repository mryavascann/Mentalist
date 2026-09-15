// Uygulamanın kök bileşeni. Şimdilik yer tutucu; Aşama 2'de (dikey dilim) ekranlar buraya bağlanır.
import { surumMetni } from '@ortak/surum';

export function App() {
  return (
    <main>
      <h1>{surumMetni()}</h1>
      <p>Dosya henüz açılmadı. Kurulum aşaması.</p>
    </main>
  );
}
