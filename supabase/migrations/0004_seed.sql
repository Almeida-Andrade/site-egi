-- Idempotente: limpa antes de inserir
delete from empreendimentos;

insert into empreendimentos (id, slug, nome, tipo, built_to_suit, cidade,
                             localizacao_aproximada, publicado, destaque, ordem) values
  (md5('mateus-maiobao')::uuid,'mateus-maiobao','Mateus Maiobão','galpao',true,'São Luís',true,true,true,1),
  (md5('mateus-pedreiras')::uuid,'mateus-pedreiras','Mateus Pedreiras','galpao',true,'Pedreiras',true,true,true,2),
  (md5('odt-beach')::uuid,'odt-beach','ODT Beach','misto',true,'São Luís',true,true,true,3),
  (md5('centro-comercial-ana-dina')::uuid,'centro-comercial-ana-dina','Centro Comercial Ana Dina','centro_comercial',false,'São Luís',true,true,true,10),
  (md5('centro-comercial-empresarial-galeria-a')::uuid,'centro-comercial-empresarial-galeria-a','Centro Comercial e Empresarial Galeria A','centro_comercial',false,'São Luís',true,true,false,11),
  (md5('centro-comercial-olgamerica')::uuid,'centro-comercial-olgamerica','Centro Comercial Olgamérica','centro_comercial',false,'São José de Ribamar',true,true,false,12),
  (md5('centro-comercial-patio-aririzal')::uuid,'centro-comercial-patio-aririzal','Centro Comercial Pátio Aririzal','centro_comercial',false,'São Luís',true,true,true,13),
  (md5('centro-comercial-patio-brasil')::uuid,'centro-comercial-patio-brasil','Centro Comercial Pátio Brasil','centro_comercial',false,'São Luís',true,true,false,14),
  (md5('residencial-angra-dos-reis')::uuid,'residencial-angra-dos-reis','Condomínio Residencial Angra dos Reis','residencial',false,'São Luís',true,true,false,20),
  (md5('residencial-buzios')::uuid,'residencial-buzios','Condomínio Residencial Búzios','residencial',false,'São Luís',true,true,false,21),
  (md5('residencial-guaruja')::uuid,'residencial-guaruja','Condomínio Residencial Guarujá','residencial',false,'São Luís',true,true,true,22),
  (md5('residencial-paraty')::uuid,'residencial-paraty','Condomínio Residencial Paraty','residencial',false,'São Luís',true,true,false,23),
  (md5('galpao-turu')::uuid,'galpao-turu','Galpão Turu','galpao',false,'São Luís',true,true,false,30),
  (md5('salas-1105-1106-century')::uuid,'salas-1105-1106-century','Salas 1105/1106 — Century','sala_avulsa',false,'São Luís',true,true,false,31),
  (md5('sala-603-jaracaty')::uuid,'sala-603-jaracaty','Sala 603 — Jaracaty','sala_avulsa',false,'São Luís',true,true,false,32),
  (md5('casa-calhau')::uuid,'casa-calhau','Casa Calhau','casa',false,'São Luís',true,true,false,33),
  (md5('casa-maiobao')::uuid,'casa-maiobao','Casa Maiobão','casa',false,'São Luís',true,true,false,34),
  (md5('apto-est-mar-134')::uuid,'apto-est-mar-134','Apto Est. Mar 134','apartamento',false,'São Luís',true,true,false,35),
  (md5('galpao-maracana-rascunho')::uuid,'galpao-maracana-rascunho','Galpão Maracanã (rascunho)','galpao',false,'São Luís',true,false,false,99);

-- Built to suit e avulsos: uma unidade cada, todas ocupadas
insert into unidades (empreendimento_id, identificacao, tipo, status, ordem)
select e.id, u.ident, u.tipo::text, 'ocupado', 1
from empreendimentos e
join (values
  ('mateus-maiobao','Loja âncora','loja'),
  ('mateus-pedreiras','Loja âncora','loja'),
  ('odt-beach','Empreendimento','area'),
  ('galpao-turu','Galpão','galpao'),
  ('sala-603-jaracaty','Sala 603','sala'),
  ('casa-calhau','Casa','casa'),
  ('casa-maiobao','Casa','casa'),
  ('apto-est-mar-134','Apartamento 134','apartamento')
) as u(slug, ident, tipo) on u.slug = e.slug;

-- Century: duas salas
insert into unidades (empreendimento_id, identificacao, tipo, status, ordem)
select e.id, x.ident, 'sala', 'ocupado', x.ordem
from empreendimentos e
join (values ('Sala 1105',1),('Sala 1106',2)) as x(ident, ordem) on true
where e.slug = 'salas-1105-1106-century';

-- Ana Dina: 21 unidades, 9 disponíveis
insert into unidades (empreendimento_id, identificacao, tipo, status, piso, ordem)
select e.id, 'Térreo ' || n, 'loja', 'ocupado', 'Térreo', n
from empreendimentos e, generate_series(1,2) n
where e.slug = 'centro-comercial-ana-dina';

insert into unidades (empreendimento_id, identificacao, tipo, status, ordem)
select e.id, 'Loja ' || n, 'loja',
       case when n in (3,8,9,12,13,14,15,16) then 'disponivel' else 'ocupado' end,
       10 + n
from empreendimentos e, generate_series(1,16) n
where e.slug = 'centro-comercial-ana-dina';

insert into unidades (empreendimento_id, identificacao, tipo, status, ordem)
select e.id, x.ident, x.tipo, x.status, x.ordem
from empreendimentos e
join (values
  ('Área 3x3','area','ocupado',40),
  ('Container','container','ocupado',41),
  ('Pavimento Superior','area','disponivel',42)
) as x(ident, tipo, status, ordem) on true
where e.slug = 'centro-comercial-ana-dina';

-- Galeria A: 13 unidades, todas ocupadas
insert into unidades (empreendimento_id, identificacao, tipo, status, ordem)
select e.id, x.ident, x.tipo, 'ocupado', x.ordem
from empreendimentos e
join (values
  ('Loja 4','loja',1),('Loja 5','loja',2),('Loja 6','loja',3),
  ('Mezanino 01','mezanino',10),('Mezanino 02','mezanino',11),('Mezanino 03','mezanino',12),
  ('Vagas 08 e 09 — Subsolo','vaga',20),
  ('Sala 201','sala',30),('Sala 202','sala',31),('Sala 203','sala',32),
  ('Área 32,16 m²','area',40),
  ('Cobertura A','cobertura',50),('Cobertura B','cobertura',51)
) as x(ident, tipo, ordem) on true
where e.slug = 'centro-comercial-empresarial-galeria-a';

-- Olgamérica: 12 unidades, todas ocupadas
insert into unidades (empreendimento_id, identificacao, tipo, status, ordem)
select e.id, 'Loja ' || n, 'loja', 'ocupado', n
from empreendimentos e, generate_series(1,11) n
where e.slug = 'centro-comercial-olgamerica';

insert into unidades (empreendimento_id, identificacao, tipo, status, ordem)
select e.id, 'Agência térreo', 'loja', 'ocupado', 0
from empreendimentos e where e.slug = 'centro-comercial-olgamerica';

-- Pátio Aririzal: 20 lojas, loja 4 disponível
insert into unidades (empreendimento_id, identificacao, tipo, status, ordem)
select e.id, 'Loja ' || n, 'loja',
       case when n = 4 then 'disponivel' else 'ocupado' end, n
from empreendimentos e, generate_series(1,20) n
where e.slug = 'centro-comercial-patio-aririzal';

-- Pátio Brasil: 11 lojas, todas ocupadas
insert into unidades (empreendimento_id, identificacao, tipo, status, ordem)
select e.id, 'Loja ' || n, 'loja', 'ocupado', n
from empreendimentos e, generate_series(1,11) n
where e.slug = 'centro-comercial-patio-brasil';

-- Residenciais
insert into unidades (empreendimento_id, identificacao, tipo, status, ordem)
select e.id, 'Apartamento ' || n, 'apartamento', 'ocupado', n
from empreendimentos e, generate_series(1,16) n
where e.slug = 'residencial-angra-dos-reis';

insert into unidades (empreendimento_id, identificacao, tipo, status, ordem)
select e.id, 'Apartamento ' || n, 'apartamento', 'ocupado', n
from empreendimentos e, generate_series(1,12) n
where e.slug = 'residencial-buzios';

insert into unidades (empreendimento_id, identificacao, tipo, status, ordem)
select e.id, 'Apartamento ' || n, 'apartamento',
       case when n in (1,7,9) then 'disponivel' else 'ocupado' end, n
from empreendimentos e, generate_series(1,20) n
where e.slug = 'residencial-guaruja';

insert into unidades (empreendimento_id, identificacao, tipo, status, ordem)
select e.id, 'Apartamento ' || n, 'apartamento',
       case when n = 7 then 'disponivel' else 'ocupado' end, n
from empreendimentos e, generate_series(1,13) n
where e.slug = 'residencial-paraty';
