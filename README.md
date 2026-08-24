# Site da E.G.I Empreendimentos

Site institucional e portfólio de locação da E.G.I Empreendimentos, de São Luís (MA). Mostra os imóveis próprios da empresa com a situação real de cada unidade e leva o interessado direto ao WhatsApp.

Next.js (App Router) · Supabase (Postgres, Auth e Storage) · CSS Modules.

## Rodando localmente

```bash
npm install
npm run dev
```

Abra <http://localhost:3000>. O painel fica em `/admin`.

Crie um `.env.local` na raiz:

```
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<chave anon>
NEXT_PUBLIC_WHATSAPP=5598984812793
```

## Como os dados são organizados

Dois níveis. Um **empreendimento** é o imóvel (um centro comercial, um galpão, um condomínio). Uma **unidade** é o que se aluga dentro dele (loja, sala, apartamento, mezanino, vaga). Um galpão inteiro é um empreendimento com uma unidade só; o Pátio Aririzal tem vinte. As duas formas passam pela mesma consulta.

Fotos são do empreendimento, não da unidade.

A localização tem dois graus: endereço exato ou só bairro e cidade, conforme `localizacao_aproximada`. Quando é aproximada, o site não monta link de mapa — a busca cairia no centro do bairro e passaria uma precisão que não existe.

### O que não entra no banco

Nome do locatário, valor do aluguel, datas de contrato, dia de vencimento, situação de pagamento e contato do inquilino. Nada disso é necessário para o site, e o site é público. O banco guarda apenas se a unidade está livre ou ocupada.

Unidade em carência aparece como ocupada. Carência é estado de contrato, não de disponibilidade.

## Segurança

Todo acesso público usa a chave anon com RLS ligada. As políticas expõem apenas empreendimentos publicados e não arquivados; rascunho devolve 404 mesmo com a URL certa.

O painel exige sessão do Supabase Auth. Contas são criadas à mão — não há cadastro aberto.

O middleware protege `/admin`, e `robots.txt` o desindexa.

## Banco

Migrações em `supabase/migrations/`, aplicadas em ordem.

| Arquivo | O que faz |
| --- | --- |
| `0001_schema.sql` | Tabelas `empreendimentos`, `unidades`, `imagens`, `perfis` |
| `0002_rls.sql` | Políticas de RLS |
| `0003_storage.sql` | Bucket `imoveis` e suas políticas |
| `0004_seed.sql` | Carga inicial do portfólio |
| `0005_enderecos.sql` | Endereços, áreas e datas de entrega |
| `0006_situacao_unidades.sql` | Disponibilidade conforme a relação de contratos |
| `0007_corrige_numero_sede.sql` | Corrige o número do prédio da sede (34 → 33) |

⚠️ **`0004_seed.sql` começa com `delete from empreendimentos`.** Reexecutá-lo apaga, por cascade, as linhas de `imagens` de cada empreendimento. As fotos reais só existem no Storage do Supabase — o script que as enviava (`scripts/upload-fotos-reais.ts`) e a pasta local (`seed/fotos-reais/`) foram removidos depois que todo o portfólio ficou com foto real cadastrada. Sem eles, reexecutar o seed exige reenviar cada foto à mão pelo painel. Foi por isso que endereços e disponibilidade entraram como migrações novas em vez de edição do seed.

## Testes

```bash
npm test          # unitários (Vitest)
npm run test:e2e  # ponta a ponta (Playwright)
```

Os testes evitam depender de contagens exatas do portfólio: número de unidades e de imóveis disponíveis muda a cada contrato assinado, e um teste preso ao total de hoje quebraria sem nada estar errado. Onde a contagem importa — como o imóvel 100% locado — o teste afirma o zero antes de checar o comportamento.

`tests/rls.test.ts` fala com o Supabase real e prova que a chave anon não lê rascunho nem altera unidade.

## Busca

Sitemap e `robots.txt` são gerados por `app/sitemap.ts` e `app/robots.ts`. Cada rota declara a própria canônica — a listagem aponta para `/empreendimentos` sem query, já que os filtros geram muitas URLs com o mesmo conteúdo recortado.

As fichas trazem JSON-LD de `Place` e de `BreadcrumbList`; a home, de `RealEstateAgent`. O cartão de compartilhamento de cada ficha usa a foto do próprio imóvel, o que importa porque o contato acontece por WhatsApp.

`URL_SITE`, em `lib/site.ts`, resolve para `NEXT_PUBLIC_URL_SITE`, senão para o domínio de produção da Vercel, senão para `localhost`.

## Deploy

Vercel. Registre `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` nas variáveis do projeto. Com domínio próprio, defina também `NEXT_PUBLIC_URL_SITE`.

As páginas públicas usam ISR. O painel chama `revalidatePath` ao salvar, então uma alteração aparece no site logo em seguida, sem esperar o cache expirar.
