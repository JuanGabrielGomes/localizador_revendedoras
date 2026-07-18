# Localizador de Revendedoras

Aplicação web que permite buscar as revendedoras mais próximas de um endereço
informado (CEP, rua/avenida, número e/ou bairro), com resultados ordenados por
distância, exibidos em mapa e com link para rota no Google Maps. A busca
acontece em uma tela (`/`) e os resultados abrem em uma segunda tela
(`/resultados`). Inclui também um app mobile (React Native/Expo, ver
[App mobile](#app-mobile-diferencial)) que reaproveita a mesma API — as duas
plataformas coexistem no mesmo repositório.

Teste técnico desenvolvido para processo seletivo — identidade visual (preto
e dourado) inspirada na Sorelly Joias.

## Sumário

- [Como rodar localmente](#como-rodar-localmente)
- [Como buscar (dados de exemplo)](#como-buscar-dados-de-exemplo)
- [Fluxo de telas](#fluxo-de-telas)
- [Design e identidade visual](#design-e-identidade-visual)
- [Stack e decisões técnicas](#stack-e-decisões-técnicas)
- [Tratamento de dados e erros](#tratamento-de-dados-e-erros)
- [Testes](#testes)
- [Deploy](#deploy)
- [App mobile (diferencial)](#app-mobile-diferencial)
- [Acessibilidade, responsividade e segurança](#acessibilidade-responsividade-e-segurança)
- [Escopo do teste e melhorias futuras](#escopo-do-teste-e-melhorias-futuras)
- [Uso de Inteligência Artificial](#uso-de-inteligência-artificial)

## Como rodar localmente

Pré-requisitos: Node.js 20+ e npm.

```bash
git clone <url-do-repositorio>
cd desafio_técnico
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

Não é necessária nenhuma variável de ambiente ou chave de API — a aplicação usa
apenas serviços públicos e gratuitos (ViaCEP e OpenStreetMap/Nominatim).

Os dados das revendedoras já vêm pré-geocodificados em `data/revendedoras.json`,
então a aplicação funciona imediatamente após `npm install`. Caso queira
regerar esse arquivo a partir do CSV original (ex: se os dados forem
atualizados), veja [Regerando os dados geocodificados](#regerando-os-dados-geocodificados).

### Outros comandos

```bash
npm run build   # build de produção
npm run start   # roda o build de produção
npm run lint    # ESLint
npm run test    # testes unitários (Vitest)
```

## Como buscar (dados de exemplo)

A base de revendedoras fornecida (`Base_200_Revendedoras_Fake (1).csv`) é
**sintética** — os CEPs nela não existem no cadastro real dos Correios/ViaCEP.
Isso não afeta o funcionamento da busca (que usa o endereço digitado pelo
usuário como ponto de partida, não o CEP das revendedoras), mas significa que
colar um CEP da planilha no campo de busca vai retornar "CEP não encontrado".

Para facilitar os testes, a tela inicial traz três exemplos clicáveis com
endereços reais das mesmas cidades da base (ex: CEP real de Curitiba, bairro
Centro/Curitiba, bairro Zona 01/Maringá). Também é possível buscar por
qualquer CEP, rua ou bairro real do Paraná (onde está concentrada a base).

## Fluxo de telas

1. **`/` (busca)** — landing com o formulário (CEP, rua, número, bairro). Ao
   enviar, a aplicação navega para `/resultados` passando os campos
   preenchidos como query string (ex: `/resultados?bairro=Centro&cidade=Curitiba`).
2. **`/resultados` (resultados)** — segunda tela. Lê os parâmetros da URL,
   chama a mesma API de busca (`POST /api/search`) e exibe o endereço
   resolvido, a lista de revendedoras ordenada por distância e o mapa. Tem
   link de volta ("← Nova busca") para a tela de busca.

Essa separação em duas rotas (em vez de mostrar tudo inline na mesma tela)
também torna o resultado de uma busca compartilhável por URL e navegável pelo
botão voltar do navegador.

## Design e identidade visual

A paleta (preto/onyx + dourado + creme) foi inspirada na estética da
[Sorelly Joias](https://sorellyjoias.com.br/), mas definida por conta própria
— não foram extraídos hex codes, fontes exatas nem nenhum asset (imagem,
logo) do site de referência; as ferramentas disponíveis não permitem inspecionar
CSS computado nem tirar screenshots, então a paleta abaixo é uma composição
própria dentro do mesmo espírito visual (joalheria de luxo), não uma cópia
pixel a pixel:

- `#0b0b0d` (onyx) — fundo principal
- `#17171b` (onyx suave) — cards e inputs sobre o fundo escuro
- `#d9a441` (dourado) — acentos, botões, bordas, ícone de coroa no logo

Tipografia: [Playfair Display](https://fonts.google.com/specimen/Playfair+Display)
(serifada) para logo/títulos, [Inter](https://fonts.google.com/specimen/Inter)
para corpo de texto e formulário — via `next/font/google` em `app/layout.tsx`.

A primeira versão usava cards de resultado em creme/branco — depois de ver a
aplicação publicada, o feedback foi que o branco destoava do resto do tema, e
que os "arabiscos" (linhas decorativas ao lado dos rótulos de seção) tinham
"cara de IA" e pouca identidade própria. Os cards passaram para o tema escuro
(consistente com o resto da tela) e as linhas decorativas foram removidas dos
rótulos.

Texto corrido usa branco/creme sobre preto (nunca dourado sobre preto em
blocos de texto) — decisão que também sustenta os contrastes corrigidos na
revisão de acessibilidade, ver [Acessibilidade, responsividade e
segurança](#acessibilidade-responsividade-e-segurança).

## Stack e decisões técnicas

| Camada | Escolha | Por quê |
|---|---|---|
| Framework | Next.js 16 (App Router) + TypeScript | Cobre front-end e back-end (Route Handlers em Node.js) em um único projeto, com deploy simples na Vercel |
| Estilo | Tailwind CSS | Componentização rápida e consistente, responsivo por padrão |
| Validação | Zod | Valida entrada do usuário e integridade dos dados de revendedoras em runtime |
| Mapa | Leaflet + react-leaflet + tiles OpenStreetMap | Gratuito, sem necessidade de API key — importante para que o avaliador rode o projeto sem configurar billing |
| Geocodificação | ViaCEP (CEP → endereço) + Nominatim/OSM, com fallback para Photon (endereço → lat/long) | Gratuitos, sem API key, e com um segundo provedor caso o principal falhe |
| Cálculo de distância | Fórmula de Haversine (distância em linha reta) | Suficiente para ordenar por proximidade sem depender de uma API de rotas paga |
| Link de rota | URL do Google Maps Directions (`/maps/dir/?api=1&destination=lat,lng`) | Não exige API key, atende ao requisito de "link para criação de rota" |
| Testes | Vitest | Cobre a lógica de negócio (distância, validação, montagem de queries de geocodificação) |
| Dados | JSON estático pré-geocodificado, sem banco de dados | 200 registros fixos, sem necessidade de CRUD — um banco seria complexidade desnecessária |

### Por que geocodificação em duas fases

O Nominatim tem uma política de uso que limita a 1 requisição por segundo. Se a
aplicação geocodificasse as 200 revendedoras a cada busca do usuário, cada
busca demoraria minutos e violaria essa política. Por isso:

1. **Build-time (uma vez):** `scripts/geocode-seed.ts` lê o CSV, geocodifica
   cada revendedora (respeitando o rate limit) e grava `data/revendedoras.json`
   com latitude/longitude. Esse arquivo já está commitado no repositório.
2. **Runtime (por busca):** só o endereço digitado pelo usuário é geocodificado
   (1 chamada ao ViaCEP + 1 ao Nominatim) — rápido e dentro da política de uso.

Cada revendedora geocodificada guarda um campo `geocodePrecision`
(`exact` | `approximate` | `failed`): `exact` quando o endereço completo
(rua + número + bairro) foi localizado; `approximate` quando o Nominatim não
achou o endereço exato e a busca recuou para bairro+cidade ou só cidade;
`failed` se nada foi encontrado (esses são excluídos dos resultados). Das 200
revendedoras, 156 foram geocodificadas com precisão exata e 44 de forma
aproximada; nenhuma falhou.

### Geocoder de fallback e cache (`lib/geocoding.ts`)

**Fallback**: a busca em tempo real (endereço digitado pelo usuário) tentava
só o Nominatim — se ele estivesse fora do ar, a busca inteira falhava. Agora,
se o Nominatim não responder (erro de rede/indisponibilidade) **ou** não
encontrar nada, a aplicação tenta o [Photon](https://photon.komoot.io/) (da
Komoot) como segundo provedor — também gratuito, sem API key, também
baseado em dados OpenStreetMap, mas com índice de busca independente do
Nominatim (por isso às vezes encontra o que o outro não encontra). Coberto
por testes que forçam os dois cenários (erro de rede e "sem resultados") via
mock de `fetch`.

**Cache em duas camadas**:
1. Um `Map` em memória do processo (`geocodeCache`) — atalho instantâneo
   para a mesma query repetida na mesma instância quente, inclusive cacheando
   o resultado "não encontrado" (o que a camada 2 sozinha não faria).
2. `fetch(..., { next: { revalidate: <30 dias> } })` nas chamadas ao ViaCEP,
   Nominatim e Photon — isso ativa o *Data Cache* do Next.js, que na Vercel
   é persistente entre invocações/cold starts (não é só memória do processo
   como o `Map`), sem precisar configurar nenhum serviço externo (Redis,
   KV, etc.). Endereço → coordenada não muda, então um TTL longo é seguro.
   Fora do runtime do Next (ex: `scripts/geocode-seed.ts`, rodado via `tsx`
   puro), essa opção é simplesmente ignorada pelo fetch nativo do Node —
   inofensivo.

### Estrutura de pastas

```
app/
  page.tsx              → tela de busca (landing + SearchForm)
  resultados/page.tsx    → segunda tela: lê query params, busca e exibe resultados + mapa
  api/search/route.ts     → endpoint de busca (POST)
components/
  BrandHeader.tsx           → cabeçalho/logo compartilhado entre as duas telas
  SearchForm.tsx             → formulário de busca (CEP, rua, número, bairro)
  ResultsList.tsx              → lista de resultados
  ResellerCard.tsx               → card de cada revendedora (com link de rota)
  MapView.tsx                     → mapa Leaflet com marcadores customizados
lib/
  types.ts                      → schemas Zod e tipos compartilhados
  distance.ts                    → cálculo de distância (Haversine)
  geocoding.ts                    → integração com ViaCEP, Nominatim e Photon (fallback), com cache
  resellers.ts                     → carrega/filtra/ordena as revendedoras
  rateLimit.ts                      → rate limit best-effort do endpoint de busca
data/
  revendedoras-original.csv         → CSV original, como recebido
  revendedoras-raw.csv               → CSV com encoding corrigido
  revendedoras.json                   → dados geocodificados (usado em runtime)
scripts/
  fix-encoding.ts                      → corrige o encoding do CSV original
  geocode-seed.ts                       → gera revendedoras.json
packages/shared/
  types.ts                              → tipos/schemas Zod compartilhados com o app mobile
mobile/                                  → app React Native/Expo (diferencial) — ver mobile/README.md
```

### Decisão de produto: filtro de status

O CSV traz revendedoras com status `Ativa`, `Inativa` ou `Em prospecção`. A
busca só retorna revendedoras `Ativa` — as demais são de controle interno e
não fazem sentido para um cliente final procurando onde comprar. Esse filtro
está em `lib/resellers.ts`.

## Tratamento de dados e erros

- **Encoding do CSV**: o arquivo original veio com mojibake (UTF-8 relido como
  Latin-1 em algum ponto da exportação, ex: "PatrÃ­cia" em vez de "Patrícia").
  `scripts/fix-encoding.ts` reverte isso de forma determinística
  (`Buffer.from(texto, "latin1").toString("utf-8")`) antes de qualquer
  processamento.
- **Validação de entrada**: toda busca é validada no back-end com Zod
  (`lib/types.ts`) — exige ao menos CEP, rua ou bairro preenchido — mesmo que o
  front-end já valide isso, o back-end nunca confia apenas no client.
- **CEP inexistente**: retorna erro 400 com mensagem amigável.
- **Endereço não geocodificável**: a busca tenta o endereço completo e, se o
  Nominatim não encontrar, recua para bairro+cidade antes de desistir (erro
  422 com sugestão de simplificar a busca).
- **Nenhuma revendedora ativa próxima**: tratado como estado vazio explícito na
  UI, não como erro.
- **Falha de rede**: erros de conexão do lado do cliente mostram mensagem
  clara em vez de travar a interface.

## Testes

```bash
npm run test
```

Cobertura (22 testes): cálculo de distância (Haversine), validação de entrada
(`SearchInputSchema`), montagem da query de geocodificação
(`buildAddressQuery`), o fallback Nominatim → Photon e o cache em memória
(mockando `fetch` para forçar erro de rede e "sem resultados"), e o rate
limiter (limite, expiração da janela, isolamento por IP).

## Regerando os dados geocodificados

Só necessário se o CSV de origem mudar.

```bash
npm run fix-encoding    # gera data/revendedoras-raw.csv corrigido
npm run geocode-seed    # gera data/revendedoras.json (leva ~4-5 min, respeita rate limit do Nominatim)
```

## Deploy

Aplicação publicada na Vercel: **https://localizador-revendedoras.vercel.app/**

Deploy automático a partir do repositório Git — sem variáveis de ambiente
necessárias.

## App mobile (diferencial)

O diferencial React Native/Expo citado no edital foi implementado em
[`mobile/`](mobile/) — **sem alterar em nada o funcionamento do app web**.
Documentação completa (como rodar, arquitetura, trade-offs) em
[`mobile/README.md`](mobile/README.md); resumo abaixo.

**Reuso, não duplicação**: o app mobile não reimplementa geocoding,
distância, filtro ou dados — ele é um cliente fino da mesma API já publicada
(`POST /api/search`). O único código de fato compartilhado entre web e
mobile são os tipos/schemas Zod, extraídos para `packages/shared/types.ts`
(`lib/types.ts` agora reexporta de lá — a única linha de código do app web
que mudou para isso acontecer, coberta pelos testes existentes).

**Coexistência garantida**: `mobile/` é um projeto Node/npm totalmente
independente (seu próprio `package.json`), fora de qualquer workspace do
repositório — `npm install`/`npm run build` na raiz (o que a Vercel executa)
nunca tocam nas dependências do Expo. `npm run build && npm run test` do
projeto web continuam 100% verdes depois da adição do mobile.

**Mapa via WebView, não `react-native-maps`**: para manter o mesmo princípio
de "zero API key" do web, o mapa do app mobile roda o mesmo Leaflet/OSM
dentro de uma `WebView`, em vez de `react-native-maps` (que exigiria API key
paga do Google Maps no Android). Trade-off documentado no README do mobile.

**Diferencial extra**: botão "usar minha localização atual" (`expo-location`
+ geocodificação reversa direto no app) — um recurso que só faz sentido no
mobile, não uma cópia do web.

## Acessibilidade, responsividade e segurança

### Acessibilidade

- **Contraste**: o tema escuro usava opacidade (`text-foreground/40`) para
  texto secundário em vários pontos (CEP no card, rodapé, subtítulo do
  header, placeholder). Calculado manualmente, `/40` sobre o fundo onyx dá
  contraste ~3.6:1 — abaixo do mínimo de 4.5:1 do WCAG AA para texto normal.
  Todos esses casos foram revistos para `/60`+ (~6.8:1), passando AA com
  folga.
- **Navegação por teclado**: `focus-visible` explícito (anel dourado) em
  todos os botões e links interativos — o outline padrão do navegador nem
  sempre é visível sobre o fundo escuro.
- **Skip link**: link "Pular para o conteúdo" (visível só ao focar via
  teclado) no `BrandHeader`, para pular a navegação do cabeçalho.
- **Landmarks e heading**: `<header>`/`<main>`/`<footer>` semânticos; a tela
  de resultados ganhou um `<h1>` próprio ("Resultados da busca"), que antes
  não existia.
- **Live regions**: o spinner de carregamento usa `role="status"
  aria-live="polite"` e a mensagem de erro usa `role="alert"`, para leitores
  de tela anunciarem mudanças de estado sem precisar de foco manual.
- **Lista ordenada**: os resultados usam `<ol>` (antes `<ul>`) — a ordem por
  distância é informação relevante, e leitores de tela anunciam a posição de
  cada item numa lista ordenada.
- **Links externos**: o botão "Ver rota" tem `aria-label` explicando que
  abre o Google Maps em nova aba.
- **Mapa**: como o Leaflet não é acessível por natureza (tiles/marcadores em
  canvas/DOM sem semântica), o card do mapa tem `role="region"` com
  `aria-label`, e a lista de resultados funciona de forma independente dele
  (nenhuma informação existe *só* no mapa).

### Responsividade

- Layout mobile-first já existia desde a primeira versão (grid de 1 coluna
  no formulário e nos resultados, 2 colunas a partir de `lg:`).
  Nesta revisão: `flex-wrap` no cabeçalho (evita overflow horizontal em
  telas muito estreitas) e alvos de toque maiores nos chips de exemplo e nas
  ações da lista (`py-1` → `py-1.5`, alinhado à recomendação de ~44px de
  área clicável em mobile).
- **Limitação**: sem ferramenta de browser/emulador neste ambiente, a
  responsividade foi verificada lendo o CSS gerado e testando os
  breakpoints do Tailwind, não visualmente em dispositivos reais.

### Segurança

- **Headers HTTP** (`next.config.ts`): `Content-Security-Policy`,
  `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`
  (bloqueia câmera/microfone/geolocalização, não usados pela aplicação) e
  `Strict-Transport-Security`.
- **CSP sem nonce**: a política segue o guia oficial do Next.js para
  aplicações sem *dynamic rendering*
  (`node_modules/next/dist/docs/.../content-security-policy.md`, seção
  "Without Nonces") — `script-src`/`style-src` incluem `'unsafe-inline'`
  porque o Leaflet aplica estilos inline via JS para posicionar
  tiles/marcadores, e o Next não teria como aplicar nonce sem forçar
  renderização dinâmica em `/` e `/resultados` (perdendo o pré-render
  estático). Uma CSP mais estrita com nonce é possível como endurecimento
  futuro, ao custo de desativar a otimização estática dessas páginas.
- **Rate limiting best-effort** (`lib/rateLimit.ts`): `/api/search` limita a
  20 requisições por minuto por IP (`x-forwarded-for`), em memória. Isso é
  *best-effort*, não uma solução distribuída — numa função serverless
  (Vercel) o contador não é compartilhado entre instâncias e zera a cada
  cold start. Suficiente para coibir abuso trivial de um único cliente
  (inclusive protegendo o ViaCEP/Nominatim, que são serviços gratuitos de
  terceiros); um rate limit robusto em produção real usaria um store
  compartilhado (ex: Upstash Redis).
- **CORS**: nenhum header de CORS foi adicionado de propósito — sem eles, o
  navegador aplica same-origin por padrão, e `/api/search` só é chamável
  pela própria aplicação. Adicionar CORS permissivo *reduziria* a segurança
  sem necessidade real (não há consumidores externos da API).
- **Validação e sanitização**: toda entrada do usuário passa por Zod no
  back-end (`lib/types.ts`); nenhum dado do usuário é injetado em HTML sem
  passar pelo escaping automático do JSX/React (sem `dangerouslySetInnerHTML`
  com conteúdo dinâmico em nenhum componente) nem em comandos de shell/SQL.
- **`npm audit`**: aponta uma vulnerabilidade moderada de XSS numa versão
  antiga do PostCSS, mas é uma dependência transitiva *interna* do próprio
  Next.js (`node_modules/next/node_modules/postcss`), usada só no pipeline
  de build do framework — não processa CSS vindo de usuários nesta aplicação,
  então não é explorável no nosso uso. A correção sugerida pelo
  `npm audit fix --force` rebaixaria o Next.js para a versão 9 (quebra
  completa do projeto) e foi descartada; a vulnerabilidade real só se
  resolve com uma atualização do próprio Next.js.

## Escopo do teste e melhorias futuras

Este projeto foi construído com um escopo deliberadamente limitado ao que o
teste técnico pede, num prazo curto. As lacunas abaixo são conscientes — não
foram "esquecidas", foram avaliadas e adiadas — e ficam documentadas aqui
para deixar claro o que mudaria numa aplicação real de produção.

### O que ficaria de fora de um MVP e foi deixado como melhoria futura

- **Mais resultados / paginação**: hoje a busca sempre retorna as 10
  revendedoras mais próximas (fixo). Um raio configurável ou "carregar
  mais" seria natural numa v2.
- **Testes de integração da API route**: os 22 testes automatizados cobrem
  `lib/` (distância, validação, geocoding, rate limit) isoladamente; o fluxo
  completo do `POST /api/search` foi validado manualmente via `curl`
  durante o desenvolvimento, não por um teste automatizado de ponta a ponta.
- **CSP com nonce**: a política atual usa `unsafe-inline` (ver
  [Segurança](#acessibilidade-responsividade-e-segurança)); uma CSP mais
  estrita exigiria abrir mão do pré-render estático de `/` e `/resultados`.
- **Observabilidade**: sem logging estruturado nem monitoramento de erro em
  produção (ex: Sentry) — hoje só `console.error` no servidor, visível nos
  logs da Vercel.
- **Validação visual real**: o ambiente de desenvolvimento usado não tem
  ferramenta de browser/emulador. Contraste, foco visível e responsividade
  foram validados por cálculo/leitura de CSS (ver seção anterior), não por
  inspeção visual em navegador ou leitor de tela real. Recomendo essa
  conferência manual antes de considerar a interface 100% validada.

### Riscos conhecidos, aceitos para o escopo de um teste técnico

Nenhum destes é um problema de "não pensei nisso" — são trade-offs
conscientes que fariam sentido revisitar numa aplicação real com dados de
clientes de verdade e tráfego de produção:

- **Rate limit não distribuído**: `lib/rateLimit.ts` é em memória por
  instância; um atacante distribuindo requisições entre múltiplas instâncias
  serverless (ou esperando um cold start) consegue passar do limite. Uma
  solução real usaria um store compartilhado (ex: Upstash Redis) — não
  incluído para não depender de infraestrutura paga/externa num teste.
- **Sem proteção contra scraping automatizado**: nada impede um script de
  varrer bairros sistematicamente via `/api/search` e reconstruir a base
  completa de revendedoras (nome, endereço, coordenadas). Para uma rede de
  revendedoras real, isso pode ser informação sensível de negócio
  (concorrentes mapeando a rede) — mitigaria com CAPTCHA/autenticação ou um
  rate limit bem mais agressivo.
- **`npm audit`**: uma vulnerabilidade moderada transitiva no PostCSS interno
  do próprio Next.js (não explorável no nosso uso — ver
  [Segurança](#acessibilidade-responsividade-e-segurança) para detalhe);
  resolve sozinha quando o Next.js atualizar essa dependência.
- **CSP com `unsafe-inline`**: enfraquece uma camada de defesa contra XSS
  (mitigado por padrão pelo React escapar JSX, mas é uma camada a menos).
- **HTTPS depende só da plataforma**: nenhum redirect HTTP→HTTPS customizado
  no código — depende inteiramente da Vercel forçar HTTPS por padrão.
- **Dados em texto plano no repositório público**: `data/revendedoras.json`
  (nomes, endereços, CEPs) está público no GitHub. Aceitável porque é a base
  fictícia (`Base_200_Revendedoras_Fake`) fornecida pelo próprio teste — mas
  numa aplicação real com dados de pessoas verdadeiras isso não deveria ser
  versionado em texto plano num repositório público, e sim vir de um banco
  privado.

O que **já não é** mais um risco em aberto, corrigido durante o
desenvolvimento: dependência de um único provedor de geocodificação (agora
tem fallback Photon, ver [Stack e decisões
técnicas](#stack-e-decisões-técnicas)), cache de geocodificação que não
sobrevivia a cold starts em serverless (agora usa o Data Cache do Next.js,
que persiste na Vercel), e o diferencial React Native/Expo, que não estava
no escopo inicial e foi adicionado depois (ver [App mobile
(diferencial)](#app-mobile-diferencial)) sem alterar o app web.

### Riscos específicos do app mobile

- **Não testado em dispositivo físico real** neste ambiente de
  desenvolvimento (sem Expo Go disponível aqui) — verificado via typecheck,
  lint, bundle sem erros e renderização real por Chromium headless
  (`--dump-dom`), mas recomenda-se validar via Expo Go antes de considerar
  100% pronto.
- **Alvo web do Expo (`expo start --web`) não funciona** por causa de CORS —
  `/api/search` não tem headers de CORS (decisão deliberada, ver
  [Segurança](#acessibilidade-responsividade-e-segurança)) e o navegador
  bloqueia a resposta. Isso não afeta o app nativo (Expo Go/build), que não
  passa pelo mecanismo de CORS do navegador — só o preview web, que nem é o
  alvo real desse diferencial. Detalhe completo em
  [`mobile/README.md`](mobile/README.md).

## Uso de Inteligência Artificial

Este projeto foi desenvolvido com apoio do **Claude Code** (Anthropic) do
início ao fim, de forma assistida — todas as decisões de arquitetura, escopo e
trade-offs foram discutidas e definidas em conjunto com o desenvolvedor antes
da implementação (ver plano de implementação alinhado no início do processo).

O que a IA gerou:

- Scaffolding do projeto (estrutura de pastas, configuração Next.js/Tailwind/Vitest).
- Script de correção de encoding do CSV e o script de geocodificação em lote.
- Código dos componentes React, da API route e das funções utilitárias
  (`distance.ts`, `geocoding.ts`, `resellers.ts`).
- Casos de teste unitários e o texto deste README.

O que foi revisado e validado manualmente:

- **Fórmula de distância**: os testes de `distance.ts` foram checados contra
  distâncias conhecidas (ex: Curitiba–Londrina, ~300 km em linha reta) para
  confirmar que o cálculo de Haversine está correto.
- **Qualidade da geocodificação**: após rodar o script de seed, as coordenadas
  resultantes foram conferidas manualmente contra as cidades reais do Paraná
  (Curitiba, Londrina, Maringá, Cascavel, Foz do Iguaçu, etc.) para garantir
  que caem na região geográfica correta.
- **Descoberta e correção de um bug de validação**: a regra inicial exigia
  rua + bairro preenchidos simultaneamente; ao testar manualmente a busca
  apenas por bairro (um dos requisitos do teste técnico), o formulário
  rejeitava a busca. A regra foi corrigida para aceitar CEP, rua **ou**
  bairro isoladamente, e um teste unitário foi adicionado para não regredir.
- **Investigação de um falso positivo**: durante os testes manuais via
  terminal, buscas com "Maringá" pareciam falhar. A causa raiz foi apurada e
  não era um bug da aplicação, e sim um problema de encoding do próprio
  terminal (Git Bash no Windows) ao passar acentos como argumento de linha de
  comando — confirmado testando a mesma chamada via arquivo UTF-8 em vez de
  argumento de shell. Fica registrado aqui para transparência sobre o
  processo de depuração.
- **Dados sintéticos do CEP**: foi identificado manualmente que os CEPs do CSV
  fornecido não existem no ViaCEP real (dataset é "fake"), o que motivou
  adicionar buscas de exemplo com endereços reais na interface.
- Toda a lógica de negócio (filtro de status, ordenação por distância, limite
  de resultados) foi lida e conferida linha a linha, não apenas gerada e
  aceita.
- **Redesign visual e rota `/resultados`**: a IA gerou a paleta de cores, a
  restilização dos componentes e a separação da busca em duas telas — mas a
  decisão de *não* tentar extrair cores/fontes exatas do site de referência
  (por falta de ferramenta adequada no ambiente) e de não reutilizar nenhum
  asset de terceiros foi explicitada e validada antes de implementar, para
  não passar a impressão de ser um clone do site real.
- **Erro de lint pego antes do commit**: a primeira versão da tela de
  resultados chamava `setState` de forma síncrona dentro de um `useEffect`
  (regra `react-hooks/set-state-in-effect`); o `npm run lint` acusou o
  problema, o efeito foi reestruturado para não depender desse `setState`
  redundante, e o lint voltou a passar limpo antes do commit.
- **Contraste calculado, não estimado**: os contrastes de texto citados na
  seção de acessibilidade foram calculados manualmente (fórmula de
  luminância relativa do WCAG) para cada combinação de opacidade usada no
  tema, não apenas "parecem legíveis" — isso é o que definiu quais classes
  precisavam mudar e para qual valor.
- **CSP verificada, não só escrita**: antes de fechar a política de
  segurança, foi consultada a documentação local do Next.js
  (`node_modules/next/dist/docs`) para confirmar a abordagem correta para
  este projeto (sem nonce, já que as páginas são estáticas) em vez de
  inventar uma CSP arbitrária — e a política foi testada rodando a
  aplicação e conferindo os headers de resposta reais via `curl`.
- **Rate limit testado de verdade**: depois de implementar, uma rajada real
  de 25 requisições foi disparada contra o servidor local para confirmar
  que o bloqueio (HTTP 429) realmente acontece após o limite, em vez de
  assumir que a lógica estava correta só pela leitura do código.
- **Limitação assumida, não escondida**: como o ambiente não tem ferramenta
  de browser, a validação de acessibilidade (foco visível, contraste) e
  responsividade foi feita por leitura de código/CSS e cálculo manual, não
  por teste visual real com leitor de tela ou dispositivo — isso está
  declarado explicitamente na seção acima em vez de apresentado como
  totalmente validado.
- **Mecanismo de cache verificado na documentação, não assumido**: antes de
  usar `fetch(..., { next: { revalidate } })` como cache persistente, foi
  necessário confirmar que o projeto *não* tem `cacheComponents` ativado
  (Next 16 muda o modelo de cache quando essa flag está ligada) — checado
  lendo `node_modules/next/dist/docs` — para garantir que a API de cache
  usada é a correta para este projeto específico, e não uma suposição
  baseada em versões anteriores do Next.js.
- **Fallback de geocoding testado com falha forçada, não só com o caminho
  feliz**: os testes de `geocodeAddress` mockam `fetch` para simular o
  Nominatim caindo (erro de rede) e o Nominatim respondendo "sem
  resultados" separadamente — as duas causas reais de fallback — em vez de
  só testar o cenário em que tudo funciona.
- **App mobile: reuso real verificado, não assumido**: depois de configurar
  o Metro para resolver `packages/shared` fora da pasta `mobile/`, o bundle
  web do Expo foi de fato gerado (960 módulos, zero erro) e a página
  renderizada com Chromium headless antes de considerar a integração
  funcionando — não bastou o `tsc` passar.
- **Falha investigada até a causa raiz, não só contornada**: ao testar o
  app mobile no alvo web e ver a busca falhar, a causa foi apurada (CORS,
  confirmado lendo o console do Chromium headless via `--enable-logging`)
  antes de decidir não mexer na API — evitando tanto "ignorar o erro" quanto
  "adicionar CORS permissivo sem necessidade" só para fazer o sintoma sumir.
- **Decisão de não adicionar `react-native-maps`**: avaliada e descartada
  deliberadamente por exigir API key paga do Google Maps no Android,
  quebrando o princípio de "zero API key" seguido no restante do projeto —
  WebView com o mesmo Leaflet do web foi a alternativa escolhida, com o
  trade-off documentado em vez de escondido.
