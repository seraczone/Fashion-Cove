insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'product-media',
    'product-media',
    true,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4']
  ),
  (
    'cms-media',
    'cms-media',
    true,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'application/pdf']
  ),
  (
    'admin-imports',
    'admin-imports',
    false,
    5242880,
    array['text/csv', 'application/vnd.ms-excel']
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read product media" on storage.objects;
create policy "Public can read product media"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'product-media');

drop policy if exists "Public can read cms media" on storage.objects;
create policy "Public can read cms media"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'cms-media');

drop policy if exists "Admins can manage product media" on storage.objects;
create policy "Admins can manage product media"
on storage.objects for all
to authenticated
using (bucket_id = 'product-media' and public.is_admin())
with check (bucket_id = 'product-media' and public.is_admin());

drop policy if exists "Admins can manage cms media" on storage.objects;
create policy "Admins can manage cms media"
on storage.objects for all
to authenticated
using (bucket_id = 'cms-media' and public.is_admin())
with check (bucket_id = 'cms-media' and public.is_admin());

drop policy if exists "Admins can manage import files" on storage.objects;
create policy "Admins can manage import files"
on storage.objects for all
to authenticated
using (bucket_id = 'admin-imports' and public.is_admin())
with check (bucket_id = 'admin-imports' and public.is_admin());

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'admin_users', 'categories', 'products', 'orders', 'order_items', 'roles',
    'permissions', 'admin_user_roles', 'brands', 'collections',
    'warehouses', 'suppliers', 'inventory_items', 'customers', 'returns',
    'refunds', 'payments', 'shipping_methods', 'reviews', 'coupons',
    'discounts', 'gift_cards', 'cms_pages', 'media_assets', 'advertisements',
    'homepage_sections', 'marketing_campaigns', 'notifications',
    'store_settings', 'audit_logs'
  ]
  loop
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = table_name
    ) then
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    end if;
  end loop;
end;
$$;
