-- DevHub CMS, part 3: a short bio for each team member, shown in the
-- pop-up card on the Team page.
-- Run once in Supabase: SQL Editor → New query → paste → Run. Safe to re-run.

alter table public.team_members
  add column if not exists bio text not null default '' check (char_length(bio) <= 1500);

-- Starter bio for the Principal Consultant, from the company profile deck.
update public.team_members
set bio = 'Urban planner, researcher and data specialist with over 15 years of experience in urban development, policy research and evidence-based planning. PhD candidate in Geography, Urban and Environmental Studies at Concordia University, Montreal. Leads research design, data coordination and urban analytics at DevHub.'
where id = '00000000-0000-4000-8000-000000000001' and bio = '';
