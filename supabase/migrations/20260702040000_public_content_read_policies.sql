grant select on public.cms_pages to anon, authenticated;
grant select on public.homepage_sections to anon, authenticated;
grant select on public.media_assets to anon, authenticated;
grant select on public.advertisements to anon, authenticated;
grant select on public.store_settings to anon, authenticated;

drop policy if exists "Public can read published CMS pages" on public.cms_pages;
create policy "Public can read published CMS pages"
on public.cms_pages for select
to anon, authenticated
using (status = 'published');

drop policy if exists "Public can read published homepage sections" on public.homepage_sections;
create policy "Public can read published homepage sections"
on public.homepage_sections for select
to anon, authenticated
using (status = 'published');

drop policy if exists "Public can read media assets" on public.media_assets;
create policy "Public can read media assets"
on public.media_assets for select
to anon, authenticated
using (true);

drop policy if exists "Public can read active advertisements" on public.advertisements;
create policy "Public can read active advertisements"
on public.advertisements for select
to anon, authenticated
using (
  status = 'active'
  and (starts_at is null or starts_at <= now())
  and (ends_at is null or ends_at >= now())
);

drop policy if exists "Public can read public store settings" on public.store_settings;
create policy "Public can read public store settings"
on public.store_settings for select
to anon, authenticated
using (key like 'public_%');
