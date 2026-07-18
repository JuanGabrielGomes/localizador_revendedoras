# Localizador de Revendedoras — App Mobile (Expo)

Diferencial mobile do teste técnico: mesma busca de revendedoras do app web,
como app React Native/Expo. **Não substitui o web — os dois coexistem** no
mesmo repositório, sem nenhuma dependência um do outro em tempo de execução.

## Como rodar

Pré-requisitos: Node.js 20+ e o app [Expo Go](https://expo.dev/go) no celular
(Android ou iOS) — não é necessário build nativo nem conta de desenvolvedor
para testar.

```bash
cd mobile
npm install
npx expo start
```

Escaneie o QR code exibido no terminal com o Expo Go (Android: dentro do
app; iOS: pela câmera). Também é possível rodar num emulador
(`npx expo start --android` / `--ios`, exige Android Studio/Xcode) ou no
navegador (`npx expo start --web` — ver limitação de CORS abaixo).

Celular e computador precisam estar na mesma rede Wi-Fi. Se isso não for
possível (redes separadas/corporativas), use `npx expo start --tunnel` — a
conexão passa pelos servidores da Expo em vez da rede local.

> **Nota sobre versão do SDK**: o projeto está fixado na Expo SDK 56
> (`expo": "^56.0.0"`) de propósito, mesmo já existindo SDK 57 no npm. O app
> Expo Go publicado nas lojas segue sempre **uma única versão de SDK por
> vez**, e normalmente há uma defasagem entre o SDK mais novo publicado no
> npm e o que já chegou na loja — instalar `npx create-expo-app@latest` pega
> o mais novo do npm, que pode ainda não ser compatível com o Expo Go que
> você acabou de baixar. Se aparecer o erro "Project is incompatible with
> this version of Expo Go", o projeto provavelmente precisa ser alinhado à
> versão de SDK que o Expo Go da loja realmente suporta no momento
> (`npx expo install expo@<versão> && npx expo install --fix` dentro de
> `mobile/`).

Por padrão, o app consome a API já publicada em
`https://localizador-revendedoras.vercel.app`. Para apontar para uma API
rodando localmente durante o desenvolvimento, defina antes de iniciar:

```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000 npx expo start
```

## O que é reaproveitado do app web (e o que não é)

Este app **não duplica** nenhuma lógica de negócio — ele é um cliente fino
da mesma API do projeto web (`app/api/search/route.ts` na raiz do
repositório), já testada com 22 testes automatizados lá.

| Camada | Reaproveitada? |
|---|---|
| Distância (Haversine), geocoding + fallback, filtro/ordenação, dados das 200 revendedoras, rate limiting | Sim — tudo isso roda no back-end já publicado; o app mobile só consome `POST /api/search` |
| Tipos (`SearchInput`, `SearchResponse`, `RevendedoraComDistancia`) | Sim — importados de `../packages/shared/types.ts`, a mesma fonte de verdade usada pelo app web (`lib/types.ts` lá reexporta de lá) |
| Paleta de cores e tipografia | Reaproveitada como conceito — os mesmos tokens (`onyx`, `gold`, Playfair Display + Inter) foram recriados em `src/theme/tokens.ts`, já que React Native não usa CSS/Tailwind |
| Componentes de UI | Reconstruídos com primitivas do React Native (`View`, `TextInput`, `FlatList`, `Pressable`) — HTML/Tailwind não existem nesse ambiente |
| Mapa | Reaproveitado de fato — ver abaixo |

## Arquitetura

```
mobile/
  src/
    app/
      _layout.tsx        → Stack navigator (Expo Router), carrega as fontes
      index.tsx            → tela de busca
      resultados.tsx         → tela de resultados (lê os params da URL)
    components/
      BrandHeader.tsx        → logo/cabeçalho (equivalente ao do web)
      SearchForm.tsx           → formulário + botão "usar minha localização"
      ResultsList.tsx            → FlatList dos resultados
      ResellerCard.tsx             → card de cada revendedora
      MapView.tsx                   → mapa via WebView (ver abaixo)
    lib/
      api.ts                          → cliente HTTP para a API do web
    theme/
      tokens.ts                         → paleta de cores replicada do web
  metro.config.js                         → ensina o Metro a enxergar packages/shared
```

O `metro.config.js` adiciona `../packages/shared` aos `watchFolders` do
Metro e faz um alias de `@localizador/shared` para essa pasta — sem isso, o
bundler do React Native não resolveria um import fora da raiz do projeto
`mobile/`. Essa é a única "mágica" de monorepo aqui: não há workspace do npm
configurado na raiz do repositório (de propósito, para não arriscar nada no
deploy do app web na Vercel — ver decisão abaixo).

## Mapa: WebView + Leaflet, não `react-native-maps`

O app web usa Leaflet com tiles do OpenStreetMap — gratuito, sem API key.
`react-native-maps` (a opção "nativa" mais comum em React Native) usa Apple
Maps de graça no iOS, mas **exige uma API key do Google Maps no Android**
(conta no Google Cloud, billing habilitado) — quebraria o princípio de "zero
API key/billing para quem for avaliar" seguido no projeto inteiro.

A solução adotada: `components/MapView.tsx` renderiza uma `WebView`
(`react-native-webview`) carregando um HTML mínimo que usa o mesmo
Leaflet/OpenStreetMap do app web, com os mesmos ícones de marcador
(SVG dourado para revendedora, ponto preto/dourado para o usuário). Zero API
key, mesmo comportamento visual do web.

**Trade-off consciente**: gestos de pinch-to-zoom/pan dentro de uma WebView
são um pouco menos fluidos que um mapa nativo de verdade. Numa v2 com mais
tempo/orçamento, `react-native-maps` com uma API key própria seria a escolha
mais "profissional" — mas exigiria pedir ao avaliador para configurar
billing no Google Cloud só para testar o app, o que não parecia um bom
trade-off para um teste técnico.

## Diferencial: usar localização atual

Algo que não existe (nem faz muito sentido) no app web: um botão "Usar
minha localização atual" (`expo-location`) que pega as coordenadas do GPS
do aparelho, faz uma geocodificação **reversa** (lat/lng → bairro/cidade)
direto contra o Nominatim a partir do próprio app, e então dispara a mesma
busca de sempre — sem precisar de nenhuma mudança na API do web. O usuário
não digita nada, só autoriza o acesso à localização.

## Limitação conhecida: CORS no alvo web do Expo

Expo permite rodar o mesmo código como site (`npx expo start --web`) além
de app nativo. Isso foi testado durante o desenvolvimento (via Chromium
headless) e a busca falha nesse modo específico — `/api/search` não tem
headers de CORS (decisão deliberada documentada no README do projeto
principal: sem consumidores externos conhecidos, então CORS permissivo só
reduziria segurança à toa). Fetch nativo do React Native (rodando como app
de verdade — Expo Go, ou build iOS/Android) **não é afetado por CORS**, já
que essa é uma restrição imposta pelo navegador, não pela API. Ou seja: o
alvo real deste diferencial (app nativo) funciona normalmente; só o preview
web do Expo (um bônus do bônus, não solicitado no teste) tem essa limitação
conhecida.

## Verificação feita

- `npx tsc --noEmit` e `npx expo lint` limpos.
- Bundle web (`expo start --web`) gerado sem erros (960 módulos), incluindo
  a resolução do pacote compartilhado via Metro.
- Renderização real conferida via Chromium headless (`--dump-dom`): tela de
  busca renderiza corretamente com o texto/identidade esperados.
- **Não testado em dispositivo físico real** neste ambiente de
  desenvolvimento (sem Expo Go disponível aqui) — recomenda-se validar via
  `npx expo start` + Expo Go antes de considerar 100% validado.
