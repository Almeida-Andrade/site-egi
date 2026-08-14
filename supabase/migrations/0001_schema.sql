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

create index idx_emp_publicado on empreendimentos (publicado, ordem)
  where arquivado_em is null;
create index idx_emp_tipo on empreendimentos (tipo);
create index idx_uni_emp_status on unidades (empreendimento_id, status)
  where arquivado_em is null;
create index idx_img_emp on imagens (empreendimento_id, ordem);

create or replace function tocar_updated_at()
returns trigger language plpgsql
set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger trg_emp_updated before update on empreendimentos
  for each row execute function tocar_updated_at();
create trigger trg_uni_updated before update on unidades
  for each row execute function tocar_updated_at();

create or replace function bloquear_troca_slug()
returns trigger language plpgsql
set search_path = public as $$
begin
  if old.publicado and old.slug is distinct from new.slug then
    raise exception 'slug de empreendimento publicado nao pode ser alterado';
  end if;
  return new;
end $$;

create trigger trg_emp_slug before update on empreendimentos
  for each row execute function bloquear_troca_slug();
