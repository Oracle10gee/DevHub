-- DevHub CMS, part 4: project funders and updated figures.
-- Run once in Supabase: SQL Editor → New query → paste → Run. Safe to re-run.

alter table public.projects add column if not exists funder text not null default '';

-- Known funders. Projects not listed here can be filled in under Admin → Projects.
update public.projects set funder = 'Private Enterprise Development in Low-Income Countries (PEDL) / Dartmouth College'
  where slug = 'supply-chains-project' and funder = '';
update public.projects set funder = 'J-PAL / MIT'
  where slug = 'lagos-commuter-survey' and funder = '';
update public.projects set funder = 'J-PAL / IGC'
  where slug = 'boosting-livelihoods-female-owner-operators' and funder = '';
update public.projects set funder = 'Fonds de recherche du Québec (FRQ) / Concordia University'
  where slug = 'lagos-market-redevelopment-project' and funder = '';

-- Home page figure: 30+ trained field researchers is now 55+.
update public.site_settings
set value = (
  select jsonb_agg(
    case when e ->> 'label' = 'Trained field researchers' and (e ->> 'value')::int = 30
         then jsonb_set(e, '{value}', '55'::jsonb)
         else e end
    order by ord)
  from jsonb_array_elements(value) with ordinality as t(e, ord)
)
where key = 'stats';
