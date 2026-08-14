-- Sincroniza unidades e disponibilidade com a planilha de gestão de contratos,
-- aba JUNHO-26, que é a fonte operacional mais recente da empresa.
--
-- Dela sai apenas a estrutura de unidades e a situação de cada uma. Locatário,
-- valor da locação, datas de contrato, dia de vencimento, e-mail e telefone
-- ficam fora do banco e fora do site, como combinado desde o início.
--
-- "Carência" não vira uma situação própria: é estado de contrato, não de
-- disponibilidade. Uma unidade em carência está locada, então entra como
-- ocupada.
--
-- Isto reverte duas mudanças do 0005, que seguiram o portfólio de obras: lá
-- Paraty tinha 14 unidades e Guarujá 21. A planilha, mais recente e
-- operacional, registra 13 e 20.

delete from unidades u
using empreendimentos e
where e.id = u.empreendimento_id
  and (e.slug, u.identificacao) in (
    ('residencial-paraty',  'Apartamento 14'),
    ('residencial-guaruja', 'Apartamento 21')
  );

update empreendimentos set
  descricao  = '13 kitnets de padrão médio. Executado entre dezembro de 2007 e julho de 2008.',
  updated_at = now()
where slug = 'residencial-paraty';

update empreendimentos set
  descricao  = '20 apartamentos de 30 m², construídos junto com o Centro Comercial Pátio Brasil.',
  updated_at = now()
where slug = 'residencial-guaruja';

-- A planilha é a fonte da verdade sobre disponibilidade: tudo volta a ocupado
-- e só o que ela lista como disponível é reaberto. Assim a migração pode rodar
-- de novo sem deixar resíduo de um estado anterior.
update unidades u set status = 'ocupado', updated_at = now()
from empreendimentos e
where e.id = u.empreendimento_id
  and u.status <> 'ocupado'
  and u.arquivado_em is null;

update unidades u set status = 'disponivel', updated_at = now()
from empreendimentos e
join (values
  ('centro-comercial-ana-dina',       'Loja 3'),
  ('centro-comercial-ana-dina',       'Loja 8'),
  ('centro-comercial-ana-dina',       'Loja 9'),
  ('centro-comercial-ana-dina',       'Loja 12'),
  ('centro-comercial-ana-dina',       'Loja 13'),
  ('centro-comercial-ana-dina',       'Loja 14'),
  ('centro-comercial-ana-dina',       'Loja 15'),
  ('centro-comercial-ana-dina',       'Loja 16'),
  ('centro-comercial-ana-dina',       'Pavimento Superior'),
  ('centro-comercial-patio-aririzal', 'Loja 4'),
  ('centro-comercial-patio-brasil',   'Loja 4'),
  ('residencial-angra-dos-reis',      'Apartamento 1'),
  ('residencial-angra-dos-reis',      'Apartamento 3'),
  ('residencial-angra-dos-reis',      'Apartamento 5'),
  ('residencial-buzios',              'Apartamento 9'),
  ('residencial-guaruja',             'Apartamento 1'),
  ('residencial-guaruja',             'Apartamento 7'),
  ('residencial-guaruja',             'Apartamento 9'),
  ('residencial-paraty',              'Apartamento 7')
) as d(slug, identificacao) on d.slug = e.slug
where e.id = u.empreendimento_id
  and u.identificacao = d.identificacao
  and u.arquivado_em is null;
