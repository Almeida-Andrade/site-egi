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
| Preço | Não aparece no site. "Consulte valores" com botão de contato |
| Stack | Next.js (App Router) + Supabase + Vercel |
| Contato | WhatsApp direto, sem formulário |
| Autenticação | Supabase Auth, contas criadas manualmente |
| Unidades ocupadas | Aparecem no site, marcadas "Ocupado", sem botão de contato |
| Mapa | Iframe do Google Maps, sem API key |
| Fotos | Por empreendimento apenas, não por unidade |
| Direção visual | Home escura editorial + listagens em grade clara |

### Por que "ocupado" aparece

Mostrar um galpão de 8.400 m² locado para operação de varejo alimentar prova
porte melhor do que qualquer texto institucional. A unidade ocupada aparece na
listagem interna do empreendimento, sem CTA. Nas buscas com filtro de
disponibilidade, ela some.

### Por que preço não aparece

Galpão e sala corporativa se negociam caso a caso. O valor fica gravado no banco
para controle interno e nunca é exposto ao público — a proteção é estrutural,
não cosmética (ver seção 6).

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
                  ('galeria','predio_comercial','galpao','residencial','misto','terreno')),
  endereco      text,
  bairro        text,
  cidade        text not null default 'São Luís',
  uf            char(2) not null default 'MA',
  cep           text,
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
                      ('sala','loja','galpao','kitnet','apartamento','terreno')),
  area_m2           numeric(10,2),
  piso              text,
  status            text not null default 'disponivel'
                      check (status in ('disponivel','ocupado','reservado','manutencao')),
  valor_aluguel     numeric(12,2),
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

### O valor do aluguel

RLS controla linha, não coluna. Se o site consultasse `unidades` direto, a coluna
`valor_aluguel` viajaria para o navegador mesmo sem ser renderizada — bastaria
abrir o DevTools para ver. A solução é uma view:

```sql
create view unidades_publicas
with (security_invoker = true) as
select id, empreendimento_id, identificacao, tipo, area_m2, piso,
       status, disponivel_em, descricao, caracteristicas, ordem
from unidades
where arquivado_em is null;
```

O site público consulta `unidades_publicas`. O painel, autenticado, consulta
`unidades`. A coluna de valor não tem caminho até o cliente anônimo.

`security_invoker = true` é obrigatório: sem ele a view roda com as permissões de
quem a criou e passa por cima da RLS da tabela base.

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

- Cabeçalho: nome, endereço, contador de disponibilidade
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
  `valor_aluguel` não aparece em `unidades_publicas`
- End-to-end: fluxo de trocar status de unidade no painel e ver refletido no site

O teste de RLS é o mais importante: é a única barreira entre o banco e a
internet, e uma policy errada não dá erro — ela simplesmente vaza.

## 15. Pendências

- **Relação de empreendimentos:** o usuário vai enviar a lista completa com
  localizações. Os endereços precisarão ser conferidos manualmente no Google Maps
  para obter o embed correto de cada um. Trabalho previsto para depois da
  implementação.
- **Logo:** arquivo `EGI_LOGO.png` já disponível em
  `C:\Users\victo\Downloads\EGI_LOGO.png`. Falta versão vetorial, se existir.
- **Fotos reais:** os mockups usam imagens do Unsplash. A qualidade da direção
  escura depende diretamente da qualidade das fotos dos imóveis.
- **Domínio:** a definir. `grupoaandrade.com.br` existe e está vazio.
- **Números institucionais:** a home tem faixa de estatísticas (m² administrados,
  anos de mercado). Os valores reais precisam vir da empresa.
