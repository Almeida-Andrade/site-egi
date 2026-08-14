-- Endereços, áreas e datas vindos do portfólio de obras do Grupo Almeida Andrade.
--
-- Quando os dois portfólios da empresa divergem, vale o de obras. É o que
-- corrige aqui a cidade de Ana Diná, Olgamérica e Mateus Maiobão, e a contagem
-- de unidades de Paraty e Guarujá.
--
-- Escrito como UPDATE em vez de alteração do 0004_seed.sql porque aquele
-- arquivo começa com `delete from empreendimentos`, e reexecutá-lo levaria
-- junto, por cascade, as linhas de `imagens` das fotos reais.

update empreendimentos as e set
  endereco               = d.endereco,
  bairro                 = d.bairro,
  cidade                 = d.cidade,
  localizacao_aproximada = false,
  descricao              = coalesce(d.descricao, e.descricao),
  updated_at             = now()
from (values
  ('centro-comercial-empresarial-galeria-a',
   'Av. dos Sambaquis, 34', 'Calhau', 'São Luís',
   '6 lojas térreas e coberturas corporativas, somando 3.305,77 m² de área construída. Entregue em outubro de 2021. A sede da EGI fica na cobertura.'),

  ('centro-comercial-patio-brasil',
   'Av. Brasil', 'Olho d''Água', 'São Luís',
   '11 lojas térreas de 40 m² cada, em uma das principais avenidas da região.'),

  ('centro-comercial-patio-aririzal',
   'Rua do Aririzal', 'Turu', 'São Luís',
   null),

  ('centro-comercial-ana-dina',
   'Rua Glicero Martins Pinto, 43', 'Outeiro', 'São José de Ribamar',
   '13 lojas: 11 térreas e duas de 600 m², no primeiro e no segundo pavimento. 2.635,35 m² de área construída, entregue em junho de 2013.'),

  ('centro-comercial-olgamerica',
   'Av. dos Portugueses, 100', 'Anjo da Guarda', 'São Luís',
   '1.516,77 m² de área construída, entregue em junho de 2013. Construído para receber a Caixa Econômica Federal e órgãos públicos municipais.'),

  ('mateus-maiobao',
   'Rodovia MA-53', 'Tijupá Queimado', 'São José de Ribamar',
   'Empreendimento comercial atacadista e varejista com 12.000 m² de área construída. Entregue em outubro de 2010.'),

  ('residencial-buzios',
   'Rua Salvador de Oliveira, 07', 'Sítio Leal / Filipinho', 'São Luís',
   '12 apartamentos de 50 m². Entregue em junho de 2017.'),

  ('residencial-paraty',
   'Rua Salvador de Oliveira, 05', 'Sítio Leal / Filipinho', 'São Luís',
   '14 kitnets de padrão médio. Executado entre dezembro de 2007 e julho de 2008.'),

  ('residencial-angra-dos-reis',
   'Rua Salvador de Oliveira', 'Sítio Leal / Filipinho', 'São Luís',
   '16 kitnets de padrão médio. Executado entre novembro de 2007 e junho de 2008.'),

  ('residencial-guaruja',
   'Av. Brasil', 'Olho d''Água', 'São Luís',
   '21 apartamentos de 30 m², construídos junto com o Centro Comercial Pátio Brasil.')
) as d(slug, endereco, bairro, cidade, descricao)
where e.slug = d.slug;

-- Pedreiras: o portfólio não traz o endereço, só a cidade e os números.
update empreendimentos set
  descricao  = 'Salão de vendas e depósito com 12.000 m², em terreno de 23.000 m². Entregue em abril de 2018.',
  updated_at = now()
where slug = 'mateus-pedreiras';

-- Áreas por unidade, onde o portfólio de obras informa
update unidades u set area_m2 = 40, updated_at = now()
from empreendimentos e
where e.id = u.empreendimento_id and e.slug = 'centro-comercial-patio-brasil'
  and u.tipo = 'loja' and u.area_m2 is null;

update unidades u set area_m2 = 50, updated_at = now()
from empreendimentos e
where e.id = u.empreendimento_id and e.slug = 'residencial-buzios'
  and u.area_m2 is null;

update unidades u set area_m2 = 30, updated_at = now()
from empreendimentos e
where e.id = u.empreendimento_id and e.slug = 'residencial-guaruja'
  and u.area_m2 is null;

-- Paraty tem 14 unidades, não 13. Guarujá tem 21, não 20.
-- A situação das novas entra como ocupada: o portfólio não informa, e anunciar
-- como livre um imóvel que não está seria pior do que o inverso.
insert into unidades (empreendimento_id, identificacao, tipo, status, area_m2, ordem)
select e.id, d.identificacao, 'apartamento', 'ocupado', d.area_m2, d.ordem
from empreendimentos e
join (values
  ('residencial-paraty',  'Apartamento 14', null::numeric, 14),
  ('residencial-guaruja', 'Apartamento 21', 30::numeric,   21)
) as d(slug, identificacao, area_m2, ordem) on d.slug = e.slug
where not exists (
  select 1 from unidades u
  where u.empreendimento_id = e.id and u.identificacao = d.identificacao
);
