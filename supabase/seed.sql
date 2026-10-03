-- DevHub starter content, taken from the company profile deck.
-- Run after schema.sql. Re-running it does not duplicate anything.

insert into public.projects
  (slug, title, client, client_detail, period_label, status, phases, summary, cover_url, featured, sort_order)
values
  ('supply-chains-project', 'Supply Chains Project',
   'Meredith Startz', 'Assistant Professor of Economics, Department of Economics, Dartmouth College, USA',
   'Summer 2026 – ongoing', 'ongoing', '{}',
   'Field research management and data collection for a study of supply chains, led by Professor Meredith Startz of Dartmouth College.',
   '/assets/photos/photo-06.jpeg', true, 1),

  ('boosting-livelihoods-female-owner-operators', 'Boosting Livelihoods of Female Owner-Operators',
   'Lagos Business School, KLEOS', '',
   'Fall 2025 – Summer 2026', 'completed', '{}',
   'Field research for a Lagos Business School (KLEOS) project on boosting the livelihoods of female business owner-operators.',
   '/assets/photos/photo-08.jpeg', true, 2),

  ('lagos-commuter-survey', 'Lagos Commuter Survey',
   'Jared Simon Kalow', 'Doctoral Candidate, Department of Political Science, Massachusetts Institute of Technology',
   'Fall 2024 – Winter 2025', 'completed',
   array['Pilot – baseline (Fall 2024)', 'Pilot – phone survey follow-up (Winter 2025)', 'Full launch (Summer 2025)', 'Accessory sample survey (Winter 2025)'],
   'A multi-phase survey of Lagos commuters for an MIT doctoral study, from pilot baseline and phone follow-up through full launch and an accessory sample.',
   '/assets/photos/photo-01.jpeg', true, 3),

  ('lagos-market-redevelopment-project', 'Lagos Market Redevelopment Project',
   'Hakeem Bishi', 'Doctoral Candidate, Department of Geography, Planning & Environment, Concordia University, Canada',
   'Spring 2025', 'completed', '{}',
   'Research on market redevelopment across Lagos, examining how redevelopment shapes traders and the informal economy.',
   '/assets/photos/photo-02.jpeg', true, 4),

  ('formas-sustainable-neighborhoods', 'Formas – Building Sustainable Neighborhoods in African Cities',
   'Professor Jeffery Paller', 'Professor, Department of Government, Uppsala University, Sweden',
   'Summer 2024', 'completed', '{}',
   'Field research for the Formas-funded "Sustainable Neighborhoods" study of how neighborhoods in African cities are built and sustained.',
   '/assets/photos/photo-11.jpeg', false, 5),

  ('kosofe-model-city-plan', 'Kosofe Model City Plan',
   'Urban Planning Smart Solutions', '',
   'Winter 2020 – Spring 2021', 'completed', '{}',
   'Survey design, data collection and implementation management services for the Kosofe Model City Plan.',
   '/assets/photos/photo-03.jpeg', false, 6)
on conflict (slug) do nothing;

insert into public.gallery_items (image_url, caption, sort_order)
select * from (values
  ('/assets/photos/photo-05.jpeg', 'The DevHub field team after training', 1),
  ('/assets/photos/photo-02.jpeg', 'Presenting the Lagos Market Redevelopment Project', 2),
  ('/assets/photos/photo-01.jpeg', 'Enumerator training on the survey instrument', 3),
  ('/assets/photos/photo-06.jpeg', 'Field coordination on site', 4),
  ('/assets/photos/photo-04.jpeg', 'Reviewing survey data with the research team', 5),
  ('/assets/photos/photo-11.jpeg', 'Management team working session', 6),
  ('/assets/photos/photo-08.jpeg', 'Enumerators practising digital data collection', 7),
  ('/assets/photos/photo-03.jpeg', 'Questionnaire review during field training', 8),
  ('/assets/photos/photo-10.jpeg', 'Project briefing: Lagos Market Redevelopment', 9),
  ('/assets/photos/photo-09.jpeg', 'Training participants during a research briefing', 10)
) as v(image_url, caption, sort_order)
where not exists (select 1 from public.gallery_items);

insert into public.site_settings (key, value) values
  ('contact', jsonb_build_object(
    'address', 'Blk 17, F7, Oshodi Road, Dolphin Estate, Ikoyi, Lagos, Nigeria',
    'email',   'devhubresearchlimited@gmail.com',
    'phone',   '+234 707 602 4342')),
  ('hero', jsonb_build_object(
    'eyebrow',  'Research & data consulting · Lagos',
    'title',    'Research is our forte.',
    'subtitle', 'End-to-end field research management, data collection and analysis for universities, development partners, policy agencies and private firms.')),
  ('stats', jsonb_build_array(
    jsonb_build_object('value', 15, 'suffix', '+', 'label', 'Years of research leadership'),
    jsonb_build_object('value', 6,  'suffix', '',  'label', 'Major field studies delivered'),
    jsonb_build_object('value', 30, 'suffix', '+', 'label', 'Trained field researchers'),
    jsonb_build_object('value', 4,  'suffix', '',  'label', 'Countries of partner institutions')))
on conflict (key) do nothing;

insert into public.posts (slug, title, excerpt, body, cover_url, tags, status, published_at)
values (
  'welcome-to-the-new-devhub',
  'Welcome to the new DevHub website',
  'A new home for our work: projects, field stories and research updates from the DevHub team.',
  '<p>We''re glad you''re here. This site is where DevHub Research Limited will share updates from the field, highlights from our projects and notes on how we design, collect and manage research data.</p><p>Have a study that needs reliable field data? <a href="/contact">Get in touch</a>.</p>',
  '/assets/photos/photo-05.jpeg',
  array['News'],
  'published',
  now()
)
on conflict (slug) do nothing;
