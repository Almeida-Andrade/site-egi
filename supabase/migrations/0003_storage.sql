insert into storage.buckets (id, name, public)
values ('imoveis', 'imoveis', true)
on conflict (id) do nothing;

create policy imoveis_leitura on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'imoveis');

create policy imoveis_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'imoveis');

create policy imoveis_update on storage.objects
  for update to authenticated
  using (bucket_id = 'imoveis');

create policy imoveis_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'imoveis');
