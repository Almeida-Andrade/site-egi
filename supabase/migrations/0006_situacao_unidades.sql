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
