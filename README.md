# Localizador de Revendedoras

Aplicação web que permite buscar as revendedoras mais próximas de um endereço
informado (CEP, rua/avenida, número e/ou bairro), com resultados ordenados por
distância, exibidos em mapa e com link para rota no Google Maps.

Teste técnico desenvolvido para processo seletivo.

## Sumário

- [Como rodar localmente](#como-rodar-localmente)
- [Como buscar (dados de exemplo)](#como-buscar-dados-de-exemplo)
- [Stack e decisões técnicas](#stack-e-decisões-técnicas)
- [Tratamento de dados e erros](#tratamento-de-dados-e-erros)
- [Testes](#testes)
- [Deploy](#deploy)
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

## Stack e decisões técnicas

| Camada | Escolha | Por quê |
|---|---|---|
| Framework | Next.js 16 (App Router) + TypeScript | Cobre front-end e back-end (Route Handlers em Node.js) em um único projeto, com deploy simples na Vercel |
| Estilo | Tailwind CSS | Componentização rápida e consistente, responsivo por padrão |
| Validação | Zod | Valida entrada do usuário e integridade dos dados de revendedoras em runtime |
| Mapa | Leaflet + react-leaflet + tiles OpenStreetMap | Gratuito, sem necessidade de API key — importante para que o avaliador rode o projeto sem configurar billing |
| Geocodificação | ViaCEP (CEP → endereço) + Nominatim/OSM (endereço → lat/long) | Também gratuitos e sem API key |
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

### Estrutura de pastas

```
app/
  page.tsx              → página principal (busca + resultados + mapa)
  api/search/route.ts    → endpoint de busca (POST)
components/
  SearchForm.tsx          → formulário de busca (CEP, rua, número, bairro)
  ResultsList.tsx           → lista de resultados
  ResellerCard.tsx            → card de cada revendedora (com link de rota)
  MapView.tsx                  → mapa Leaflet com marcadores
lib/
  types.ts                      → schemas Zod e tipos compartilhados
  distance.ts                    → cálculo de distância (Haversine)
  geocoding.ts                    → integração com ViaCEP e Nominatim
  resellers.ts                     → carrega/filtra/ordena as revendedoras
data/
  revendedoras-original.csv         → CSV original, como recebido
  revendedoras-raw.csv               → CSV com encoding corrigido
  revendedoras.json                   → dados geocodificados (usado em runtime)
scripts/
  fix-encoding.ts                      → corrige o encoding do CSV original
  geocode-seed.ts                       → gera revendedoras.json
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

Cobertura: cálculo de distância (Haversine), validação de entrada
(`SearchInputSchema`) e montagem da query de geocodificação
(`buildAddressQuery`) — a lógica de negócio central da aplicação.

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
