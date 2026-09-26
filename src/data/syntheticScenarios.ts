export interface TestScenario {
  id: string;
  title: string;
  category: string;
  query: string;
  description: string;
  expectedMatches: string[];
}

export const SYNTHETIC_TEST_SCENARIOS: TestScenario[] = [
  {
    id: 'scen_edu_ug',
    title: 'Merit College Student in Need of Tuition Assistance',
    category: 'Education & Scholarships',
    query: 'I am a 19 year old college student studying B.Tech 2nd year in Karnataka. My annual household family income is around 2.4 lakhs. I need scholarship support for my tuition fees.',
    description: 'Tests youth age (19), education course (B.Tech), state (Karnataka), and low income (₹2.4L) matching Central Sector Scholarship and state schemes.',
    expectedMatches: ['Central Sector Scheme of Scholarship for College and University Students', 'Karnataka Yuva Nidhi Scheme'],
  },
  {
    id: 'scen_edu_sc',
    title: 'Scheduled Caste Student Seeking Post-Matric Support',
    category: 'Education & Scholarships',
    query: 'I am an SC student aged 18 studying in college. My family income is 2 lakhs per year. Looking for government fee reimbursement and maintenance allowance.',
    description: 'Tests explicit SC category fact, post-matric education status, and income verification below ₹2.5L.',
    expectedMatches: ['Post-Matric Scholarship Scheme for SC Students', 'Central Sector Scheme of Scholarship for College and University Students'],
  },
  {
    id: 'scen_agr_farmer',
    title: 'Small Agricultural Landholder seeking Income & Input Support',
    category: 'Agriculture & Rural',
    query: 'I am a 38 year old farmer with 2 acres of cultivable agricultural land in Maharashtra. I need financial assistance to buy seeds, fertilizers, and farm equipment.',
    description: 'Tests farmer occupation, land ownership, and rural input support.',
    expectedMatches: ['Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)', 'Sub-Mission on Agricultural Mechanization (SMAM)'],
  },
  {
    id: 'scen_hou_rural',
    title: 'Rural Household Living in Dilapidated Kutcha House',
    category: 'Housing & Shelter',
    query: 'We are a rural family living in a broken mud kutcha house in Uttar Pradesh. Our family income is under 1.5 lakhs per year. We want government assistance to build a permanent pucca house.',
    description: 'Tests rural location, kutcha housing status, and low income bracket matching PMAY-G.',
    expectedMatches: ['Pradhan Mantri Awas Yojana - Gramin (PMAY-G)'],
  },
  {
    id: 'scen_hou_urban',
    title: 'Urban Resident Seeking Affordable Home Loan Subsidy',
    category: 'Housing & Shelter',
    query: 'I am a 32 year old private worker residing in an urban city. My family annual income is 4.5 lakhs. I do not own any permanent house and want home loan interest subsidy to buy a flat.',
    description: 'Tests urban geography, LIG income bracket (up to ₹6L), and first-time homeowner criterion for PMAY-Urban.',
    expectedMatches: ['Pradhan Mantri Awas Yojana - Urban (PMAY-U 2.0)'],
  },
  {
    id: 'scen_bus_startup',
    title: 'Unemployed Youth Launching Micro Manufacturing Enterprise',
    category: 'Business & MSME',
    query: 'I am 26 years old, passed 12th class, and want to start a food processing micro manufacturing business with a project cost of 15 lakhs. Looking for government credit subsidy.',
    description: 'Tests 18+ age, 8th+ educational qualification, and micro enterprise project cost under PMEGP.',
    expectedMatches: ["Prime Minister's Employment Generation Programme (PMEGP)", 'Pradhan Mantri MUDRA Yojana (PMMY)'],
  },
  {
    id: 'scen_bus_vendor',
    title: 'Urban Street Vendor Seeking Collateral-Free Working Capital',
    category: 'Business & MSME',
    query: 'I am a 35 year old street vendor running a tea and snacks cart on the pavement in Delhi. I need a small loan of 10,000 to restart and purchase stock without collateral.',
    description: 'Tests street vendor occupation, urban geography, and small working capital tranche.',
    expectedMatches: ['PM Street Vendor’s AtmaNirbhar Nidhi (PM SVANidhi)', 'Pradhan Mantri MUDRA Yojana (PMMY)'],
  },
  {
    id: 'scen_art_carpenter',
    title: 'Traditional Carpenter / Artisan Seeking Toolkits & Low Interest Loan',
    category: 'Artisans & Skill Development',
    query: 'I am a 42 year old traditional carpenter working with hand tools. I want skill upgrade training, toolkit financial assistance, and a low interest loan of 1 lakh to expand my workshop.',
    description: 'Tests 18 notified artisan trades (Carpenter / Suthar), basic toolkit support (₹15,000), and 5% concessional credit under PM Vishwakarma.',
    expectedMatches: ['PM Vishwakarma Scheme'],
  },
  {
    id: 'scen_hea_hospital',
    title: 'Low-Income Family Seeking Hospital Cashless Medical Cover',
    category: 'Healthcare & Wellness',
    query: 'We are a poor family with annual income under 2 lakhs. My parents need surgery in hospital and we cannot afford high private hospital bills. What medical assistance can we get?',
    description: 'Tests low-income secondary/tertiary hospitalization need matching Ayushman Bharat PM-JAY.',
    expectedMatches: ['Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)'],
  },
  {
    id: 'scen_pen_unorganized',
    title: 'Construction Daily Wage Worker Seeking Old-Age Pension',
    category: 'Social Security & Pension',
    query: 'I am a 28 year old construction daily wage laborer earning 12,000 per month. I do not have provident fund or government pension. I want guaranteed pension for when I turn 60.',
    description: 'Tests unorganized worker, monthly income under ₹15,000, age between 18-40, matching PM-SYM and APY.',
    expectedMatches: ['Pradhan Mantri Shram Yogi Maan-dhan (PM-SYM)', 'Atal Pension Yojana (APY)'],
  },
];
