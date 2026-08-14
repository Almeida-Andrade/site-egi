# Site E.G.I Empreendimentos — Design

Data: 2026-08-14
Status: aprovado para planejamento

## 1. Contexto

A E.G.I Empreendimentos administra e aluga imóveis próprios em São Luís (MA). O
portfólio é misto e vai de galpões logísticos de grande porte — o padrão dos
Supermercados Mateus — até kitnets, passando por galerias com salas e lojas.

Hoje a empresa existe online apenas no Instagram
([@egi.empreendimentos](https://www.instagram.com/egi.empreendimentos/)), com
contato por telefone (98) 3235-5008 e WhatsApp (98) 98481-2793. O link da bio
aponta para `grupoaandrade.com.br`, que serve uma página em branco. Não há site,
catálogo público nem qualquer registro indexado do portfólio.

O objetivo é um site que sirva a três propósitos, nesta ordem de importância:

1. **Impressionar à primeira vista.** O site precisa passar porte e seriedade nos
   primeiros segundos — é o critério declarado de aceitação.
2. **Responder "o que está disponível?"** sem depender de ligação. Hoje toda
   consulta vira uma conversa no WhatsApp.
3. **Dar à EGI controle sobre o próprio conteúdo,** sem depender de programador
   para marcar uma sala como alugada.

## 2. Escopo

**Dentro:**

- Site público com portfólio navegável e filtros
- Banco de dados Supabase com empreendimentos, unidades e status
- Painel administrativo com autenticação, CRUD, upload de imagens
- Localização por Google Maps embutido
- Contato via WhatsApp com mensagem pré-preenchida
- Páginas institucionais: A EGI, Contato

**Fora:**

- Portal de terceiros (a EGI anuncia só imóveis próprios)
- Venda de imóveis (o negócio é locação)
- Área do inquilino, boletos, contratos, financeiro
- Blog
- Preço público de aluguel
- Cadastro público de usuários

## 3. Decisões tomadas

| Tema | Decisão |
|---|---|
| Escopo do negócio | Locação de imóveis próprios, portfólio misto |
| Preço | Fora do sistema. Não aparece no site nem é guardado no banco |
| Stack | Next.js (App Router) + CSS Modules + Supabase + Vercel |
| Contato | WhatsApp direto, sem formulário |
| Autenticação | Supabase Auth, contas criadas manualmente |
| Unidades ocupadas | Aparecem no site, marcadas "Ocupado", sem botão de contato |
| Mapa | Iframe do Google Maps, sem API key |
| Fotos | Por empreendimento apenas, não por unidade |
| Localização | Dois níveis: endereço exato ou apenas região/bairro |
| Direção visual | Home escura editorial + listagens em grade clara |

### Por que "ocupado" aparece

Mostrar um galpão de 8.400 m² locado para operação de varejo alimentar prova
porte melhor do que qualquer texto institucional. A unidade ocupada aparece na
listagem interna do empreendimento, sem CTA. Nas buscas com filtro de
disponibilidade, ela some.

### Por que preço não aparece

Galpão e sala corporativa se negociam caso a caso. O valor não entra no sistema —
nem no site, nem no banco. Não é dado escondido, é dado ausente, o que elimina
qualquer risco de exposição acidental e simplifica a camada de segurança.

### Localização em dois níveis

A relação real de imóveis da EGI mistura duas coisas: prédios com endereço exato
e várias unidades dentro, e conjuntos identificados apenas por região — kitnets
espalhadas por um bairro, por exemplo. Forçar endereço único nos dois casos
produziria endereço inventado ou mapa quebrado.

A coluna `localizacao_aproximada` distingue os casos. Quando verdadeira, a ficha
exibe bairro e cidade no lugar do endereço, e o mapa centraliza na região sem
marcar um ponto específico.

## 4. Direção visual

O critério negativo é tão importante quanto o positivo: o site não pode parecer
gerado por template. Ficam proibidos gradiente roxo-azul, hero centralizado com
subtítulo genérico, trio de cards arredondados com ícone, sombra difusa em todo
elemento, emoji como ícone de seção e ilustração vetorial genérica.

### Paleta

Extraída por amostragem de pixel do arquivo `EGI_LOGO.png`:

| Token | Hex | Uso |
|---|---|---|
| `--navy` | `#070E31` | Fundo da home, texto principal, botões primários |
| `--steel` | `#3B58A5` | Rótulos, links, chips de status disponível |
| `--pure` | `#0000FE` | Apenas detalhe: filete, foco de teclado, hover |
| `--off` | `#F7FAFA` | Fundo das páginas claras |

O azul `#0000FE` é 100% saturado. Em área grande ele vibra na tela e cansa a
vista — é justamente o que dá aparência de template. Fica restrito a elementos de
poucos pixels.

### Estilos

CSS Modules, sem framework de utilitários. A direção é editorial e específica —
tipografia serifada grande, grade assimétrica, tabela densa — ou seja, muito
estilo próprio por componente e pouca repetição de utilitário, que é onde um
framework como Tailwind rende menos e polui o JSX. Tokens globais em
`app/tokens.css`, estilos de componente em arquivos `.module.css` ao lado do
componente.

### Tipografia

- **Instrument Serif** — títulos da home e números grandes. Dá o tom editorial.
- **Archivo** — títulos de seção, dados numéricos (com `font-variant-numeric:
  tabular-nums`, para que áreas em m² alinhem em coluna).
- **Inter** — corpo de texto.

### Layout por página

- **Home:** fundo navy, foto full-bleed com gradiente, título serifado grande,
  faixa de números (empreendimentos, m² administrados, anos de mercado, unidades
  livres).
- **Listagem e fichas:** fundo off-white, grade assimétrica, dados alinhados em
  ficha técnica, muito espaço em branco.

O contraste entre as duas é intencional: a home vende, as internas informam.

## 5. Modelo de dados

Duas tabelas centrais, não uma. Um empreendimento é o prédio, a galeria ou o
terreno; a unidade é o que se aluga. Um galpão avulso é um empreendimento com uma
única unidade — assim a consulta é uniforme e o contador "4 de 18 disponíveis"
sai de graça.

```sql
create table empreendimentos (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  nome          text not null,
  descricao     text,
  tipo          text not null check (tipo in
                  ('centro_comercial','galpao','residencial','casa','sala_avulsa',
                   'apartamento','misto','terreno')),
  built_to_suit boolean not null default false,
  endereco      text,
  bairro        text,
  cidade        text not null default 'São Luís',
  uf            char(2) not null default 'MA',
  cep           text,
  localizacao_aproximada boolean not null default false,
  maps_embed_url text,
  maps_link      text,
  publicado     boolean not null default false,
  destaque      boolean not null default false,
  ordem         integer not null default 0,
  arquivado_em  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table unidades (
  id                uuid primary key default gen_random_uuid(),
  empreendimento_id uuid not null references empreendimentos(id) on delete cascade,
  identificacao     text not null,
  tipo              text not null check (tipo in
                      ('loja','sala','mezanino','cobertura','galpao','apartamento',
                       'casa','vaga','container','area','terreno')),
  area_m2           numeric(10,2),
  piso              text,
  status            text not null default 'disponivel'
                      check (status in ('disponivel','ocupado','reservado','manutencao')),
  disponivel_em     date,
  descricao         text,
  caracteristicas   text[] not null default '{}',
  ordem             integer not null default 0,
  arquivado_em      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table imagens (
  id                uuid primary key default gen_random_uuid(),
  empreendimento_id uuid not null references empreendimentos(id) on delete cascade,
  storage_path      text not null,
  alt               text,
  capa              boolean not null default false,
  ordem             integer not null default 0,
  created_at        timestamptz not null default now()
);

create table perfis (
  id         uuid primary key references auth.users(id) on delete cascade,
  nome       text,
  created_at timestamptz not null default now()
);
```

Índices em `empreendimentos(slug)`, `empreendimentos(publicado, ordem)`,
`unidades(empreendimento_id, status)` e `unidades(tipo, status)`.

Escolhi `text` com `check` em vez de `enum` do Postgres: adicionar um tipo de
imóvel novo vira uma alteração de constraint, sem `ALTER TYPE`.

### Slug imutável

Trigger que bloqueia alteração de `slug` quando `publicado = true`. Link de
empreendimento circula no Instagram; se o slug mudar, o link quebra e não há como
saber quantas pessoas caíram no 404.

### Exclusão

Soft delete via `arquivado_em`. Nada sai do banco por clique errado no painel.
Todas as consultas públicas filtram `arquivado_em is null`.

## 6. Segurança

RLS ligada em todas as tabelas. Regras:

- **Anônimo lê** `empreendimentos` apenas com `publicado = true and arquivado_em
  is null`; lê `unidades` e `imagens` apenas de empreendimento que satisfaça essa
  condição.
- **Escrita** em qualquer tabela: somente `authenticated`.
- **`perfis`**: cada usuário lê e edita apenas a própria linha.

### Sem dado sensível por coluna

RLS controla linha, não coluna. Enquanto o valor do aluguel estava previsto no
modelo, era preciso uma view para impedir que a coluna viajasse até o navegador
mesmo sem ser renderizada. Com o valor fora do sistema, nenhuma coluna de
`unidades` é sensível: tudo que está lá é justamente o que o site exibe. O site
consulta a tabela direto e a RLS de linha basta.

Se algum dia entrar um campo interno em `unidades` — anotação de contrato, nome
do inquilino —, a view volta a ser necessária. Registrado aqui para que a decisão
seja revisitada em vez de esquecida.

### Chaves

A chave `anon` é publicável por definição e vive em `.env.local` como
`NEXT_PUBLIC_*`. A `service_role` não entra no projeto — não há caso de uso que a
exija, já que toda escrita passa por sessão autenticada de usuário real.

## 7. Storage

Bucket `imoveis`, público para leitura, escrita restrita a autenticado. Caminho
`empreendimentos/{empreendimento_id}/{uuid}.webp`.

Bucket público, e não URL assinada, por dois motivos: URL assinada expira e
quebra o cache do Google Imagens, e foto de imóvel anunciado é conteúdo público
por natureza.

O upload comprime no navegador antes de enviar: `canvas` redimensiona para no
máximo 1600px no lado maior e converte para WebP com qualidade 0,82. Uma foto de
celular de 8 MB chega ao bucket com cerca de 300 KB.

Estimativa de consumo: 38 empreendimentos × 10 fotos × 300 KB ≈ 115 MB, contra 1
GB do plano free. O limite que aperta primeiro é tráfego (5 GB/mês), mitigado
pelo cache de borda do `next/image`, que busca cada imagem no Supabase uma vez só.

## 8. Rotas

```
/                        Home escura — hero, destaques, números, CTA
/empreendimentos         Listagem clara — filtros de tipo, bairro, status, área
/empreendimentos/[slug]  Ficha — tabela de unidades, mapa, WhatsApp
/sobre                   A EGI
/contato                 Telefone, WhatsApp, endereço, mapa
/admin                   Login
/admin/empreendimentos   Lista + criar/editar
/admin/empreendimentos/[id]  Formulário, imagens, tabela de unidades
/sitemap.xml
/robots.txt
```

Não existe rota por unidade. Sem foto própria, uma página de unidade seria uma
linha de tabela isolada — conteúdo fino que o Google penaliza e que não ajuda o
visitante. A âncora `#unidade-{id}` na ficha do empreendimento resolve o
compartilhamento de uma sala específica.

Renderização com ISR: as páginas públicas são estáticas com `revalidate`, e o
painel dispara `revalidatePath` ao salvar. O Google indexa HTML pronto e a
mudança de status aparece em segundos.

## 9. Ficha do empreendimento

A página que recebe os cliques vindos do Instagram. Estrutura:

- Cabeçalho: nome, localização e contador de disponibilidade. A localização mostra
  o endereço completo ou, quando `localizacao_aproximada` está marcada, apenas
  bairro e cidade
- Galeria de fotos do empreendimento
- **Tabela de unidades** com filtro por status (Todas / Disponíveis / Ocupadas /
  Reservadas). Colunas: identificação, tipo, área, piso, situação.
- Coluna lateral: mapa embutido, botão de WhatsApp, ficha resumida

A tabela é o formato certo aqui porque precisa acomodar tanto o galpão de uma
unidade quanto a galeria de quarenta salas, e porque números alinhados em coluna
tornam a comparação de área imediata.

## 10. Painel administrativo

Projetado para pessoa leiga, não para desenvolvedor.

- **Login:** e-mail e senha. Contas criadas manualmente no painel Supabase. Sem
  tela de cadastro, sem recuperação de senha caseira.
- **Empreendimento:** formulário único com nome, tipo, descrição, endereço e
  campo de mapa. O campo de mapa aceita tanto o link curto do Google Maps quanto
  o `<iframe>` inteiro colado — o código extrai a URL de dentro. Exigir que o
  usuário saiba o que é um iframe seria um erro de projeto.
- **Fotos:** arrastar e soltar múltiplas, compressão automática, reordenar
  arrastando, marcar capa.
- **Unidades:** tabela editável dentro da ficha. Trocar status é um clique, sem
  abrir formulário. É a operação mais frequente do dia a dia: "a sala 203
  alugou".
- **Excluir:** soft delete, com desfazer.

## 11. Contato

Botão de WhatsApp abre `wa.me/5598984812793` com mensagem pré-preenchida citando
o empreendimento e, quando aplicável, a unidade:

> Olá! Tenho interesse na Sala 203 do Center Valley (31,2 m²). Vi no site.

Sem formulário e sem tabela de leads. Formulário no Brasil converte pior que
WhatsApp e criaria uma caixa de entrada que ninguém se comprometeu a monitorar. A
mensagem pré-preenchida já identifica a origem.

## 12. SEO

O site é a única presença indexável da empresa, então isso não é detalhe.

- Metadata por empreendimento: título, descrição, Open Graph com a foto de capa
- JSON-LD `RealEstateListing` por empreendimento e `Organization` na home
- Sitemap gerado do banco
- Slug legível: `/empreendimentos/center-valley`
- `alt` obrigatório nas imagens, preenchido no painel

## 13. Estados vazios e erros

- Empreendimento sem foto: bloco navy com o nome em tipografia grande, nunca
  ícone de imagem quebrada
- Empreendimento sem unidade disponível: ficha mostra tudo ocupado e um CTA de
  "avise-me quando vagar" que abre o WhatsApp
- Filtro sem resultado: sugestão de limpar filtros, com a contagem total
- Falha de upload: erro por arquivo, mantendo os que subiram
- Slug inexistente: 404 com link para a listagem

## 14. Testes

- Unitários: extração de URL do campo de mapa (link curto, link longo, iframe
  colado, texto inválido), geração de slug, compressão de imagem
- Integração: policies de RLS — anônimo não lê rascunho, anônimo não escreve,
  anônimo não lê unidade de empreendimento despublicado
- End-to-end: fluxo de trocar status de unidade no painel e ver refletido no site

O teste de RLS é o mais importante: é a única barreira entre o banco e a
internet, e uma policy errada não dá erro — ela simplesmente vaza.

## 15. Portfólio real e dados de seed

O relatório de contratos de 03/08/2026 fornecido pela empresa dá a estrutura
real: **18 empreendimentos, cerca de 148 unidades, 14 disponíveis** — ocupação de
aproximadamente 91%.

| Empreendimento | Tipo | Unidades | Disponíveis |
|---|---|---|---|
| Mateus Maiobão | galpao · built to suit | 1 | 0 |
| Mateus Pedreiras | galpao · built to suit | 1 | 0 |
| ODT Beach | misto · built to suit | 1 | 0 |
| Galpão Turu | galpao | 1 | 0 |
| Salas 1105/1106 Century | sala_avulsa | 2 | 0 |
| Sala 603 Jaracaty | sala_avulsa | 1 | 0 |
| Casa Calhau | casa | 1 | 0 |
| Casa Maiobão | casa | 1 | 0 |
| Apto Est. Mar 134 | apartamento | 1 | 0 |
| Centro Comercial Ana Dina | centro_comercial | 21 | 9 |
| Centro Comercial e Empresarial Galeria A | centro_comercial | 13 | 0 |
| Centro Comercial Olgamérica | centro_comercial | 12 | 0 |
| Centro Comercial Pátio Aririzal | centro_comercial | 20 | 1 |
| Centro Comercial Pátio Brasil | centro_comercial | 11 | 0 |
| Condomínio Residencial Angra dos Reis | residencial | 16 | 0 |
| Condomínio Residencial Búzios | residencial | 12 | 0 |
| Condomínio Residencial Guarujá | residencial | 20 | 3 |
| Condomínio Residencial Paraty | residencial | 13 | 1 |

Abrangência geográfica: São Luís, São José de Ribamar (as lojas 04 a 11 da
Olgamérica estão locadas a secretarias da prefeitura) e Pedreiras.

### O que NÃO entra no banco

O relatório de origem é um documento de contratos. Contém nome completo de
locatários pessoa física, valor de cada aluguel, datas de vigência e situação de
pagamento. **Nada disso entra no Supabase.** A base fica exposta na internet e a
chave anon é pública por design; dado que não existe no banco não vaza.

Do relatório, migram exatamente três informações: nome do empreendimento,
identificação da unidade e disponibilidade. A anotação "(50%)" que aparece em
Pátio Aririzal e Búzios é participação societária e também fica de fora.

### Built to suit

Mateus Maiobão, Mateus Pedreiras e ODT Beach nunca estarão disponíveis para
locação — são imóveis construídos sob medida para o locatário. Ainda assim são o
ativo de imagem mais forte da empresa. Ganham `built_to_suit = true` e aparecem
na home como seção de cases, com o Grupo Mateus nomeado, em vez de linha em
tabela de disponibilidade.

### Seed

O seed usa a estrutura real acima — nomes de empreendimentos, identificação de
unidades e status verdadeiros. Apenas as fotos são de terceiros (Unsplash),
escolhidas por coerência de tipo, e ficam num diretório `seed/fotos/`. São
enviadas ao bucket pelo próprio script, e não referenciadas por URL externa, para
que o caminho de upload seja exercitado de verdade desde o começo.

Os endereços entram vazios com `localizacao_aproximada = true`, exibindo apenas
cidade, até que a conferência manual no Google Maps seja feita.

O seed é idempotente e reversível: um comando popula, outro limpa.

O seed inclui um 19º registro despublicado, `Galpão Maracanã (rascunho)`, que
existe apenas para o teste de RLS verificar que conteúdo não publicado é
invisível ao público.

## 16. Pendências

- **Endereços:** o relatório de contratos deu os nomes e a estrutura de unidades,
  mas não os endereços. Cada um dos 18 empreendimentos precisará ser localizado
  manualmente no Google Maps para obter o embed — inclusive decidindo, caso a
  caso, quais ficam como região em vez de endereço exato. Trabalho previsto para
  depois da implementação.
- **Logo:** arquivo `EGI_LOGO.png` já disponível em
  `C:\Users\victo\Downloads\EGI_LOGO.png`. Falta versão vetorial, se existir.
- **Fotos reais:** os mockups usam imagens do Unsplash. A qualidade da direção
  escura depende diretamente da qualidade das fotos dos imóveis.
- **Domínio:** a definir. `grupoaandrade.com.br` existe e está vazio.
- **Números institucionais:** a home tem faixa de estatísticas. Empreendimentos
  (18), unidades (~148) e taxa de ocupação (~91%) saem do próprio banco. Faltam
  metros quadrados administrados e ano de fundação, que precisam vir da empresa.

- **Áreas em m²:** o relatório de contratos não traz área das unidades. A coluna
  `area_m2` fica nula no seed, e a tabela da ficha omite a coluna quando nenhuma
  unidade do empreendimento tem área preenchida.
