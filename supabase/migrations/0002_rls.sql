alter table empreendimentos enable row level security;
alter table unidades        enable row level security;
alter table imagens         enable row level security;
alter table perfis          enable row level security;

-- Leitura pública: só o que está publicado e não arquivado
create policy emp_leitura_publica on empreendimentos
  for select to anon
  using (publicado = true and arquivado_em is null);

create policy uni_leitura_publica on unidades
  for select to anon
  using (
    arquivado_em is null
    and exists (
      select 1 from empreendimentos e
      where e.id = unidades.empreendimento_id
        and e.publicado = true
        and e.arquivado_em is null
    )
  );

create policy img_leitura_publica on imagens
  for select to anon
  using (
    exists (
      select 1 from empreendimentos e
      where e.id = imagens.empreendimento_id
        and e.publicado = true
        and e.arquivado_em is null
    )
  );

-- Autenticado enxerga e altera tudo
create policy emp_admin on empreendimentos for all to authenticated
  using (true) with check (true);
create policy uni_admin on unidades for all to authenticated
  using (true) with check (true);
create policy img_admin on imagens for all to authenticated
  using (true) with check (true);

-- Perfil: cada um vê e edita o próprio
create policy perfil_proprio on perfis for all to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);
