import type { GalleryItem, Project, SiteSettings, TeamMember } from '../core/models';

// Copy that changes rarely lives here; anything admins edit lives in Supabase.

export const ABOUT = {
  lead:
    'DevHub is a research and data consulting firm specialising in end-to-end field research management, data collection and analysis.',
  paragraphs: [
    'We provide expert services in research design, survey programming, digital and in-person data collection, focus group facilitation and secondary data sourcing. Our technical capabilities include developing research tools, recruiting and training field teams, and managing field logistics across complex project environments.',
    'We support organisations ranging from academic institutions and international development partners to policy agencies and private firms in generating high-quality, reliable data for programme design, impact evaluations and policy analysis.',
    'DevHub ensures excellence through strong project oversight, ethical research protocols, rigorous quality control and efficient resource management. Recent clients include academic and research institutions, government agencies and private planning firms.',
  ],
};

export const FOCUS_AREAS = ['Social', 'Economic', 'Environmental', 'Spatial', 'Health'];

export type IconName = 'academic' | 'market' | 'policy' | 'design' | 'data';

export interface Expertise {
  slug: string;
  title: string;
  icon: IconName;
  color: string;
  blurb: string;
  points: string[];
}

export const EXPERTISE: Expertise[] = [
  {
    slug: 'academic-research',
    title: 'Academic Research',
    icon: 'academic',
    color: '#300066',
    blurb: 'Field partners for faculty and doctoral researchers at universities in North America, Europe and Africa.',
    points: ['Survey and panel studies', 'Pilots, baselines and follow-ups', 'IRB-aligned ethical protocols'],
  },
  {
    slug: 'market-surveys',
    title: 'Market Surveys',
    icon: 'market',
    color: '#4f8db3',
    blurb: 'Reliable data on traders, consumers and supply chains in fast-moving urban markets.',
    points: ['Trader and enterprise surveys', 'Supply-chain mapping', 'Sampling in informal markets'],
  },
  {
    slug: 'policy-research',
    title: 'Policy Research',
    icon: 'policy',
    color: '#0a9fd8',
    blurb: 'Evidence for programme design, impact evaluation and urban policy.',
    points: ['Impact evaluation fieldwork', 'Urban governance studies', 'Stakeholder and focus group sessions'],
  },
  {
    slug: 'research-design',
    title: 'Research Design',
    icon: 'design',
    color: '#1e73be',
    blurb: 'From research question to field-ready instrument, built to survive real conditions.',
    points: ['Questionnaire and tool development', 'Survey programming (CAPI / CATI)', 'Sampling strategy'],
  },
  {
    slug: 'data-management',
    title: 'Data Management',
    icon: 'data',
    color: '#2b3990',
    blurb: 'Clean, documented and secure datasets, handled under Nigerian data-protection rules.',
    points: ['Real-time quality control', 'Cleaning, coding and documentation', 'Secondary data sourcing'],
  },
];

export const SERVICES = [
  { title: 'Research design', text: 'Framing questions, choosing methods and building sampling strategies that hold up in the field.' },
  { title: 'Survey programming', text: 'Digital instruments for tablet, phone and web collection, with logic checks built in.' },
  { title: 'Data collection', text: 'Digital and in-person collection by trained, ethically certified enumerators.' },
  { title: 'Focus group facilitation', text: 'Moderated discussions and key-informant interviews with careful documentation.' },
  { title: 'Secondary data sourcing', text: 'Locating, compiling and validating existing datasets and records.' },
  { title: 'Field team management', text: 'Recruiting, training and supervising field teams, plus logistics across complex environments.' },
];

export const PROCESS = [
  { step: '01', title: 'Design', text: 'Research questions, methods and sampling.' },
  { step: '02', title: 'Build', text: 'Instruments drafted, programmed and piloted.' },
  { step: '03', title: 'Train', text: 'Enumerators recruited, trained and certified.' },
  { step: '04', title: 'Collect', text: 'Digital and in-person fieldwork, supervised daily.' },
  { step: '05', title: 'Assure', text: 'Back-checks and real-time quality control.' },
  { step: '06', title: 'Deliver', text: 'Clean, documented data ready for analysis.' },
];

export const COMPLIANCE = [
  { title: 'Data protection registered', text: 'Registered under Nigerian data protection regulation.' },
  { title: 'Data protection policies', text: 'Operational policies governing how data is collected, stored and shared.' },
  { title: 'Ethically certified enumerators', text: 'Every enumerator completes research ethics certification.' },
  { title: 'PENCOM registered', text: 'Registered with the National Pension Commission.' },
  { title: 'Staff pensions', text: 'Pension contributions maintained for our team.' },
];

export const EXPECTATIONS = ['Professionalism', 'Honesty', 'Timeliness', 'Teamwork', 'Respect', 'Accountability', 'Initiative'];

export const CODES = [
  'Research ethics',
  'Confidentiality',
  'Respect for respondents',
  'Anti-bribery',
  'Data privacy',
  'Use of company equipment',
];

export const PARTNERS = [
  'Massachusetts Institute of Technology',
  'Dartmouth College',
  'Stanford University',
  'Concordia University',
  'Uppsala University',
  'Lagos Business School',
  'Lagos State Government',
];

export const CEO = {
  name: 'Hakeem Bishi',
  role: 'Principal Consultant / CEO',
  photo: '/assets/photos/photo-02.jpeg',
  bio: [
    'Hakeem Bishi is an urban planner, researcher and data specialist with over 15 years of experience in urban development, policy research and evidence-based planning. He is a PhD candidate in Geography, Urban and Environmental Studies at Concordia University, Montreal, and leads research design, data coordination and urban analytics at DevHub for development-focused projects across Nigeria.',
    'Hakeem combines academic depth with hands-on field experience. He has led high-impact studies such as the Lagos Trader Project, contributed to strategic urban initiatives like the Kosofe Model City Plan, and collaborated with MIT, Dartmouth, Stanford and the Lagos State Government on urban governance, market redevelopment and the dynamics of informal economies in African cities.',
  ],
};

// ─── Fallbacks: shown only if the database cannot be reached ───────────────

// Mirrors the starter chart in supabase/002_team_and_notifications.sql.
export const FALLBACK_TEAM: TeamMember[] = (
  [
    ['1', 'Hakeem Bishi', 'Principal Consultant', 'management', null],
    ['2', 'Sodiq Onigbokun', 'Business / Research Operations Manager', 'management', '1'],
    ['3', 'Omowunmi Folajimi-Senjobi', 'Research Manager', 'management', '1'],
    ['4', 'Yusuf Akinkunmi', 'Field Supervisor', 'management', '2'],
    ['5', 'Anibijuwon Beatrice', 'Field Manager', 'management', '2'],
    ['6', 'Omotayo Kehinde', 'Field Supervisor', 'management', '2'],
    ['7', 'Ekene Isichei', 'Team Lead', 'leads', null],
    ['8', 'Susandorcas Obalade', 'Team Lead', 'leads', null],
    ['9', 'Opeyemi Balogun', 'Team Lead', 'leads', null],
    ['10', 'Kehinde Mukaila', 'Team Lead', 'leads', null],
  ] as const
).map(([id, name, role, team, parent_id], i) => ({ id, name, role, bio: '', team, parent_id, photo_url: null, sort_order: i }));

export const DEFAULT_SETTINGS: SiteSettings = {
  contact: {
    address: 'Blk 17, F7, Oshodi Road, Dolphin Estate, Ikoyi, Lagos, Nigeria',
    email: 'devhubresearchlimited@gmail.com',
    phone: '+234 707 602 4342',
  },
  hero: {
    eyebrow: 'Research & data consulting · Lagos',
    title: 'Research is our forte.',
    subtitle:
      'End-to-end field research management, data collection and analysis for universities, development partners, policy agencies and private firms.',
  },
  stats: [
    { value: 15, suffix: '+', label: 'Years of research leadership' },
    { value: 6, suffix: '', label: 'Major field studies delivered' },
    { value: 30, suffix: '+', label: 'Trained field researchers' },
    { value: 4, suffix: '', label: 'Countries of partner institutions' },
  ],
};

function project(p: Partial<Project> & Pick<Project, 'slug' | 'title'>): Project {
  return {
    id: p.slug,
    client: '',
    client_detail: '',
    period_label: '',
    status: 'completed',
    phases: [],
    summary: '',
    body: '',
    cover_url: null,
    featured: false,
    published: true,
    sort_order: 0,
    created_at: '',
    updated_at: '',
    ...p,
  };
}

export const FALLBACK_PROJECTS: Project[] = [
  project({
    slug: 'supply-chains-project',
    title: 'Supply Chains Project',
    client: 'Meredith Startz',
    client_detail: 'Assistant Professor of Economics, Department of Economics, Dartmouth College, USA',
    period_label: 'Summer 2026 – ongoing',
    status: 'ongoing',
    summary: 'Field research management and data collection for a study of supply chains, led by Professor Meredith Startz of Dartmouth College.',
    cover_url: '/assets/photos/photo-06.jpeg',
    featured: true,
    sort_order: 1,
  }),
  project({
    slug: 'boosting-livelihoods-female-owner-operators',
    title: 'Boosting Livelihoods of Female Owner-Operators',
    client: 'Lagos Business School, KLEOS',
    period_label: 'Fall 2025 – Summer 2026',
    summary: 'Field research for a Lagos Business School (KLEOS) project on boosting the livelihoods of female business owner-operators.',
    cover_url: '/assets/photos/photo-08.jpeg',
    featured: true,
    sort_order: 2,
  }),
  project({
    slug: 'lagos-commuter-survey',
    title: 'Lagos Commuter Survey',
    client: 'Jared Simon Kalow',
    client_detail: 'Doctoral Candidate, Department of Political Science, Massachusetts Institute of Technology',
    period_label: 'Fall 2024 – Winter 2025',
    phases: [
      'Pilot – baseline (Fall 2024)',
      'Pilot – phone survey follow-up (Winter 2025)',
      'Full launch (Summer 2025)',
      'Accessory sample survey (Winter 2025)',
    ],
    summary: 'A multi-phase survey of Lagos commuters for an MIT doctoral study, from pilot baseline and phone follow-up through full launch and an accessory sample.',
    cover_url: '/assets/photos/photo-01.jpeg',
    featured: true,
    sort_order: 3,
  }),
  project({
    slug: 'lagos-market-redevelopment-project',
    title: 'Lagos Market Redevelopment Project',
    client: 'Hakeem Bishi',
    client_detail: 'Doctoral Candidate, Department of Geography, Planning & Environment, Concordia University, Canada',
    period_label: 'Spring 2025',
    summary: 'Research on market redevelopment across Lagos, examining how redevelopment shapes traders and the informal economy.',
    cover_url: '/assets/photos/photo-02.jpeg',
    featured: true,
    sort_order: 4,
  }),
  project({
    slug: 'formas-sustainable-neighborhoods',
    title: 'Formas – Building Sustainable Neighborhoods in African Cities',
    client: 'Professor Jeffery Paller',
    client_detail: 'Professor, Department of Government, Uppsala University, Sweden',
    period_label: 'Summer 2024',
    summary: 'Field research for the Formas-funded "Sustainable Neighborhoods" study of how neighborhoods in African cities are built and sustained.',
    cover_url: '/assets/photos/photo-11.jpeg',
    sort_order: 5,
  }),
  project({
    slug: 'kosofe-model-city-plan',
    title: 'Kosofe Model City Plan',
    client: 'Urban Planning Smart Solutions',
    period_label: 'Winter 2020 – Spring 2021',
    summary: 'Survey design, data collection and implementation management services for the Kosofe Model City Plan.',
    cover_url: '/assets/photos/photo-03.jpeg',
    sort_order: 6,
  }),
];

export const FALLBACK_GALLERY: GalleryItem[] = [
  ['05', 'The DevHub field team after training'],
  ['02', 'Presenting the Lagos Market Redevelopment Project'],
  ['01', 'Enumerator training on the survey instrument'],
  ['06', 'Field coordination on site'],
  ['04', 'Reviewing survey data with the research team'],
  ['11', 'Management team working session'],
  ['08', 'Enumerators practising digital data collection'],
  ['03', 'Questionnaire review during field training'],
  ['10', 'Project briefing: Lagos Market Redevelopment'],
  ['09', 'Training participants during a research briefing'],
].map(([n, caption], i) => ({ id: n, image_url: `/assets/photos/photo-${n}.jpeg`, caption, sort_order: i + 1 }));
