import { SchemeRecord } from '../types/scheme';

export const DEFAULT_SCHEMES_DATABASE: SchemeRecord[] = [
  // 1. Education: NSP Central Sector Scholarship
  {
    id: 'SCH-EDU-001',
    name: 'Central Sector Scheme of Scholarship for College and University Students',
    description: 'Provides financial assistance to meritorious students from low-income families to meet day-to-day expenses while pursuing higher studies in recognized colleges and universities.',
    provider: 'Department of Higher Education, Ministry of Education',
    provider_type: 'central',
    government_level: 'Central',
    categories: ['Education & Scholarships'],
    states: ['All-India'],
    districts: [],
    beneficiary_groups: ['Students', 'Undergraduate Students', 'Postgraduate Students'],
    age_rules: {
      min_age: 17,
      max_age: 25,
      description: 'Candidate must be between 18 and 25 years old at the time of college admission.',
    },
    income_rules: {
      max_annual_income: 450000,
      min_annual_income: null,
      description: 'Gross parental/family annual income must not exceed ₹4,50,000 per annum from all sources.',
    },
    occupation_rules: {
      allowed_occupations: ['Student'],
      description: 'Applicant must not be engaged in full-time formal salaried employment.',
    },
    education_rules: {
      min_education_level: 'Higher Secondary (Class 12 Passed)',
      eligible_courses: ['Regular Degree Course', 'B.Tech', 'MBBS', 'BA', 'B.Sc', 'B.Com', 'MA', 'M.Sc', 'M.Tech'],
      current_student_required: true,
      description: 'Above 80th percentile in relevant stream in Class XII examination of the respective State/CBSE Board, enrolled in a recognized regular higher education program.',
    },
    gender_rules: {
      allowed_genders: ['any'],
      description: 'Open to all genders with 50% reservation for female students.',
    },
    category_rules: {
      allowed_social_categories: ['Any'],
      description: 'Open to all categories (General, OBC, SC, ST, EWS). Standard central reservation applies.',
    },
    geography_rules: {
      area_type: ['Any'],
      description: 'Pan-India coverage across all states and union territories.',
    },
    other_rules: {
      must_not_receive_other_scholarships: true,
      attendance_requirement: '75% minimum regular attendance',
    },
    benefits: [
      {
        type: 'Scholarship',
        amount_or_details: '₹12,000 per year for first 3 years of Graduation; ₹20,000 per year for Postgraduate courses',
        frequency: 'Annual Direct Benefit Transfer',
        description: 'Transferred directly to the beneficiary student Aadhaar-seeded bank account through PFMS.',
      },
    ],
    documents: [
      { name: 'Class 12th Marksheet', mandatory: true, description: 'Board verified marksheet indicating percentile' },
      { name: 'Income Certificate', mandatory: true, description: 'Issued by competent revenue authority (Tahsildar/SDM)' },
      { name: 'Aadhaar Card', mandatory: true, description: 'UIDAI Aadhaar card seeded with bank account' },
      { name: 'College Admission Fee Receipt / ID Card', mandatory: true, description: 'Proof of regular admission in recognized institution' },
      { name: 'Bank Account Passbook', mandatory: true, description: 'Bank passbook showing IFSC and Account Number' },
    ],
    application_steps: [
      'Register on National Scholarship Portal (NSP) with valid Aadhaar and mobile number.',
      'Select Central Sector Scholarship Scheme from the Ministry of Education list.',
      'Upload verified marksheet, income certificate, and institute bonafide certificate.',
      'Submit application for Level 1 Institution Verification and Level 2 District/State Nodal Officer verification.',
    ],
    application_url: 'https://scholarships.gov.in',
    source_url: 'https://www.education.gov.in/scholarships-education-loan-0',
    source_name: 'National Scholarship Portal (NSP), Ministry of Education, Govt of India',
    last_updated: '2024-08-15',
    status: 'Active',
    raw_record: {
      scheme_code: 'CSSS_HE_2024',
      ministry_id: 'MIN_EDU_01',
      annual_budget_cr: 250,
      nodal_agency: 'UGC / AICTE / State Education Boards',
      disbursement_mode: 'DBT via PFMS',
    },
  },

  // 2. Education: Post-Matric Scholarship for SC Students
  {
    id: 'SCH-EDU-002',
    name: 'Post-Matric Scholarship Scheme for SC Students',
    description: 'Centrally sponsored scheme providing complete financial support including compulsory fees and academic maintenance allowance to Scheduled Caste students studying beyond Class 10.',
    provider: 'Ministry of Social Justice and Empowerment',
    provider_type: 'central',
    government_level: 'Central',
    categories: ['Education & Scholarships'],
    states: ['All-India'],
    districts: [],
    beneficiary_groups: ['Students', 'SC Students', 'Youth'],
    age_rules: {
      min_age: 15,
      max_age: 35,
      description: 'Post-matriculation stage; generally 15 years and above.',
    },
    income_rules: {
      max_annual_income: 250000,
      min_annual_income: null,
      description: 'Total annual household income from all sources must not exceed ₹2,50,000.',
    },
    occupation_rules: {
      allowed_occupations: ['Student'],
      description: 'Full-time student enrolled in post-matric recognized course.',
    },
    education_rules: {
      min_education_level: 'Class 10 Passed (Matriculation)',
      eligible_courses: ['Class 11-12', 'ITI', 'Polytechnic Diploma', 'UG Degree', 'PG Degree', 'Professional Courses'],
      current_student_required: true,
      description: 'Enrolled in recognized post-secondary program in an approved institution.',
    },
    gender_rules: {
      allowed_genders: ['any'],
      description: 'Open to male, female, and transgender candidates.',
    },
    category_rules: {
      allowed_social_categories: ['SC'],
      description: 'Candidate must belong to Scheduled Caste (SC) community with valid caste certificate.',
    },
    geography_rules: {
      area_type: ['Any'],
      description: 'All Indian citizens belonging to notified Scheduled Castes.',
    },
    other_rules: {},
    benefits: [
      {
        type: 'Direct Benefit Transfer',
        amount_or_details: '100% reimbursement of non-refundable tuition fees plus monthly maintenance allowance up to ₹13,500/year (hosteller) or ₹7,000/year (day scholar)',
        frequency: 'Annual Direct Transfer',
        description: 'Comprehensive tuition and living/book allowance assistance.',
      },
    ],
    documents: [
      { name: 'Caste Certificate', mandatory: true, description: 'Digitally verifiable SC Caste Certificate issued by authorized revenue officer' },
      { name: 'Income Certificate', mandatory: true, description: 'Family income certificate not older than 1 year' },
      { name: 'Previous Academic Marksheet', mandatory: true, description: 'Marksheet of qualifying examination' },
      { name: 'College Admission Bonafide Certificate', mandatory: true, description: 'Fee breakdown structure on official college letterhead' },
      { name: 'Aadhaar Card', mandatory: true, description: 'Aadhaar with active DBT bank seeding' },
    ],
    application_steps: [
      'Visit State Scholarship Portal or National Scholarship Portal (NSP).',
      'Select Post Matric Scholarship for SC.',
      'Enter Aadhaar demographic and caste certificate verification number.',
      'Upload institute fee structure and income certificate.',
      'College nodally verifies fee details, followed by Social Welfare Dept DBT approval.',
    ],
    application_url: 'https://scholarships.gov.in',
    source_url: 'https://socialjustice.gov.in/schemes/post-matric-scholarship-sc',
    source_name: 'Ministry of Social Justice and Empowerment, Govt of India',
    last_updated: '2024-07-01',
    status: 'Active',
    raw_record: {
      scheme_shortcode: 'PMS-SC',
      fund_sharing_ratio: '60:40 Central:State',
      scholarship_type: 'Need-cum-Merit Social Security',
    },
  },

  // 3. Agriculture: PM-KISAN
  {
    id: 'SCH-AGR-001',
    name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    description: 'Provides income support to all landholding farmer families across the country to supplement their financial needs for procuring various agricultural inputs and domestic necessities.',
    provider: 'Department of Agriculture & Farmers Welfare, Ministry of Agriculture',
    provider_type: 'central',
    government_level: 'Central',
    categories: ['Agriculture & Rural'],
    states: ['All-India'],
    districts: [],
    beneficiary_groups: ['Farmers', 'Agricultural Landowners', 'Rural Households'],
    age_rules: {
      min_age: 18,
      max_age: null,
      description: 'Adult head or member of farmer landholding family.',
    },
    income_rules: {
      max_annual_income: null,
      description: 'No explicit income limit, but excludes institutional landholders, income tax payees of last assessment year, and serving/retired govt personnel with pension > ₹10,000.',
    },
    occupation_rules: {
      allowed_occupations: ['Farmer', 'Cultivator', 'Agriculture'],
      disallowed_occupations: ['Constitutional Post Holders', 'Ministers', 'Doctors', 'Engineers', 'Lawyers', 'Chartered Accountants', 'Govt Class A/B/C Regular Employees'],
      description: 'Must own cultivable agricultural land registered in state land revenue records.',
    },
    education_rules: null,
    gender_rules: {
      allowed_genders: ['any'],
      description: 'Open to both male and female registered landholders.',
    },
    category_rules: {
      allowed_social_categories: ['Any'],
      description: 'Open to all categories (General, OBC, SC, ST).',
    },
    geography_rules: {
      area_type: ['Rural', 'Semi-Urban', 'Any'],
      description: 'Agricultural land situated anywhere in India.',
    },
    other_rules: {
      must_have_land_records: true,
      eKYC_mandatory: true,
      land_seeding_required: true,
    },
    benefits: [
      {
        type: 'Direct Benefit Transfer',
        amount_or_details: '₹6,000 per year',
        frequency: 'Three equal installments of ₹2,000 every four months',
        description: 'Direct cash transfer into Aadhaar-seeded bank account through NPCI gateway.',
      },
    ],
    documents: [
      { name: 'Land Record Document (Khatauni / RoR / 7/12 / Patta)', mandatory: true, description: 'Certified extract proving ownership of cultivable agricultural land' },
      { name: 'Aadhaar Card', mandatory: true, description: 'Mandatory Aadhaar with OTP / biometric eKYC' },
      { name: 'Active Bank Passbook', mandatory: true, description: 'Bank account enabled with Aadhaar Payment Bridge (APB)' },
    ],
    application_steps: [
      'Open pmkisan.gov.in portal or visit local Common Service Centre (CSC) / Agriculture Office.',
      'Click "New Farmer Registration" and input Aadhaar number and state.',
      'Enter land details (District, Sub-District, Block, Village, Khata/Khasra Number).',
      'Complete biometric or OTP-based e-KYC on the portal.',
      'Revenue officer verifies land record against state digitised Bhulekh database.',
    ],
    application_url: 'https://pmkisan.gov.in',
    source_url: 'https://pmkisan.gov.in/Documents_New.aspx',
    source_name: 'Ministry of Agriculture and Farmers Welfare, Govt of India',
    last_updated: '2024-09-01',
    status: 'Active',
    raw_record: {
      launch_year: 2019,
      scheme_nature: 'Central Sector 100% funded',
      dbt_portal: 'PM-KISAN DBT Portal',
      exclusion_criteria: 'Income tax payer in last assessment year; pensions > 10000/mo',
    },
  },

  // 4. Agriculture & Equipment: SMAM
  {
    id: 'SCH-AGR-002',
    name: 'Sub-Mission on Agricultural Mechanization (SMAM)',
    description: 'Provides subsidy assistance up to 40%–50% to farmers and rural youth for the purchase of modern agricultural machinery, tractors, power tillers, harvesters, and establishment of Custom Hiring Centres (CHCs).',
    provider: 'Department of Agriculture & Farmers Welfare',
    provider_type: 'joint',
    government_level: 'Central',
    categories: ['Agriculture & Rural'],
    states: ['All-India'],
    districts: [],
    beneficiary_groups: ['Farmers', 'Small & Marginal Farmers', 'Rural Entrepreneurs', 'FPO Members'],
    age_rules: {
      min_age: 18,
      max_age: 65,
      description: 'Adult farmer or entrepreneur.',
    },
    income_rules: null,
    occupation_rules: {
      allowed_occupations: ['Farmer', 'Agricultural Worker', 'Rural Youth'],
      farmer_types: ['Small Farmer (<2 ha)', 'Marginal Farmer (<1 ha)', 'Women Farmer', 'SC/ST Farmer', 'Large Farmer'],
      description: 'Priority and higher subsidy (up to 50%) for Small, Marginal, Women, SC and ST farmers; 40% for General large farmers.',
    },
    education_rules: null,
    gender_rules: {
      allowed_genders: ['any'],
      description: 'Open to all; extra 10% subsidy bonus for women farmers in several implement categories.',
    },
    category_rules: {
      allowed_social_categories: ['Any'],
      description: 'Open to all categories; preferential quota for SC/ST/Small/Marginal.',
    },
    geography_rules: {
      area_type: ['Rural'],
      description: 'Agricultural farm land locations across Indian states.',
    },
    other_rules: {
      must_not_have_availed_similar_subsidy: 'In last 3 to 5 years for same implement',
    },
    benefits: [
      {
        type: 'Equipment / In-Kind',
        amount_or_details: 'Subsidy ranging from 40% to 50% on cost of farm equipment (up to ₹1.25 Lakh for implements, up to ₹10 Lakhs for Custom Hiring Centres)',
        frequency: 'One-time capital subsidy per implement',
        description: 'Subsidy credited directly to bank account upon purchase and physical verification.',
      },
    ],
    documents: [
      { name: 'Land Record (7/12, Khasra, Khatauni)', mandatory: true, description: 'Proof of landholding' },
      { name: 'Aadhaar Card', mandatory: true, description: 'Identity proof' },
      { name: 'Bank Passbook copy', mandatory: true, description: 'Account where subsidy is to be transferred' },
      { name: 'Quotation / Proforma Invoice of Machine', mandatory: true, description: 'From authorized agricultural machinery dealer' },
      { name: 'Caste Certificate (if SC/ST)', mandatory: false, description: 'Required only for enhanced SC/ST subsidy' },
    ],
    application_steps: [
      'Register on the Central Farm Machinery Portal (agrimachinery.nic.in) or State DBT Agriculture Portal.',
      'Select desired equipment/implement model from empaneled manufacturers.',
      'Upload land documents and dealer quotation.',
      'Upon lottery/approval by District Agriculture Engineer, receive Purchase Order.',
      'Buy machine, submit invoice and chassis number for GPS physical verification.',
    ],
    application_url: 'https://agrimachinery.nic.in',
    source_url: 'https://agricoop.nic.in/en/sub-mission-agricultural-mechanization-smam',
    source_name: 'Directorate of Farm Machinery, Ministry of Agriculture',
    last_updated: '2024-06-10',
    status: 'Active',
    raw_record: {
      subsidy_code: 'SMAM_MACH_2024',
      implement_types: 'Rotavator, Seed Drill, Power Tiller, Reaper, Combine, Tractor',
      monitoring_portal: 'Farmech Agricoop',
    },
  },

  // 5. Housing: PMAY-Gramin
  {
    id: 'SCH-HOU-001',
    name: 'Pradhan Mantri Awas Yojana - Gramin (PMAY-G)',
    description: 'Aims to provide a pucca house with basic amenities to all houseless households and those living in kutcha or dilapidated houses in rural areas.',
    provider: 'Ministry of Rural Development',
    provider_type: 'joint',
    government_level: 'Central',
    categories: ['Housing & Shelter'],
    states: ['All-India'],
    districts: [],
    beneficiary_groups: ['Rural Households', 'Houseless Families', 'Kutcha House Dwellers', 'BPL Families'],
    age_rules: {
      min_age: 18,
      max_age: null,
      description: 'Adult head of household (preference for female head or joint ownership).',
    },
    income_rules: {
      max_annual_income: 180000,
      description: 'Household must be identified through Socio-Economic Caste Census (SECC 2011) or Awaas+ survey list.',
    },
    occupation_rules: {
      disallowed_occupations: ['Regular Government Employees', 'Registered Enterprise Owners'],
      description: 'Must not own motorized 3/4-wheeler, mechanized 3/4-wheeler agricultural equipment, or 50,000+ credit limit kisan credit card.',
    },
    education_rules: null,
    gender_rules: {
      allowed_genders: ['any'],
      description: 'House is allotted either in sole name of female head or jointly with husband.',
    },
    category_rules: {
      allowed_social_categories: ['Any'],
      description: 'Priority to SC/ST/Minority and vulnerable groups in Gram Panchayat priority list.',
    },
    geography_rules: {
      area_type: ['Rural'],
      description: 'Strictly applicable to rural Gram Panchayat areas.',
    },
    other_rules: {
      must_not_own_pucca_house: true,
      minimum_house_size: '25 sq. metres including hygienic cooking space',
    },
    benefits: [
      {
        type: 'Direct Benefit Transfer',
        amount_or_details: '₹1,20,000 in plain areas; ₹1,30,000 in hilly/difficult/northeastern/IAP districts',
        frequency: 'Milestone-based (Foundation, Lintel, Roof, Completion)',
        description: 'Plus 90-95 person-days of unskilled labor under MGNREGS (approx ₹20,000) + ₹12,000 assistance for toilet under SBM-G.',
      },
    ],
    documents: [
      { name: 'Aadhaar Card of Family Members', mandatory: true, description: 'Consent for Aadhaar usage and SECC linkage' },
      { name: 'Bank Account Details', mandatory: true, description: 'Aadhaar linked single/joint bank account' },
      { name: 'MGNREGA Job Card Number', mandatory: true, description: 'Required to receive unskilled labor wages' },
      { name: 'Swachh Bharat Mission (SBM) Registration ID', mandatory: false, description: 'For additional toilet construction incentive' },
    ],
    application_steps: [
      'Beneficiary list generated from SECC/Awaas+ verified by Gram Sabha.',
      'Geo-tagged photo of existing kutcha house taken by Block Village Housing Officer via AwaasApp.',
      'Sanction letter issued; 1st installment released for foundation.',
      'Subsequent installments released after geo-tagged photo verification at plinth, window, and roof levels.',
    ],
    application_url: 'https://pmayg.nic.in',
    source_url: 'https://rural.nic.in/en/scheme/pradhan-mantri-awaas-yojana-gramin',
    source_name: 'Ministry of Rural Development, Govt of India',
    last_updated: '2024-08-01',
    status: 'Active',
    raw_record: {
      awaassoft_code: 'PMAY_G_V2',
      unit_size_sqm: 25,
      convergence: ['MGNREGS labor', 'SBM-G toilet', 'PM Ujjwala LPG', 'Saubhagya electricity'],
    },
  },

  // 6. Housing: PMAY-Urban
  {
    id: 'SCH-HOU-002',
    name: 'Pradhan Mantri Awas Yojana - Urban (PMAY-U 2.0)',
    description: 'Provides central assistance to urban families belonging to EWS, LIG, and Middle Income Groups (MIG) for all-weather pucca houses through Interest Subsidy (ISS), Beneficiary-Led Construction (BLC), and Affordable Housing in Partnership (AHP).',
    provider: 'Ministry of Housing and Urban Affairs',
    provider_type: 'central',
    government_level: 'Central',
    categories: ['Housing & Shelter'],
    states: ['All-India'],
    districts: [],
    beneficiary_groups: ['Urban Poor', 'EWS Families', 'LIG Families', 'Middle Class', 'Slum Dwellers'],
    age_rules: {
      min_age: 18,
      max_age: null,
      description: 'Adult applicant or married couple.',
    },
    income_rules: {
      max_annual_income: 900000,
      description: 'EWS: up to ₹3,00,000; LIG: ₹3,00,001 to ₹6,00,000; MIG: up to ₹9,00,000 per annum.',
    },
    occupation_rules: null,
    education_rules: null,
    gender_rules: {
      allowed_genders: ['any'],
      description: 'Mandatory female head ownership or co-ownership for EWS/LIG categories.',
    },
    category_rules: {
      allowed_social_categories: ['Any'],
      description: 'All social categories eligible based on income classification.',
    },
    geography_rules: {
      area_type: ['Urban'],
      description: 'Statutory towns, notified planning areas, and urban local bodies (ULBs).',
    },
    other_rules: {
      must_not_own_pucca_house_in_india: true,
    },
    benefits: [
      {
        type: 'Subsidized Loan',
        amount_or_details: 'Up to ₹2.67 Lakh interest subsidy on home loans (or direct grant of ₹1.5 Lakh under BLC vertical)',
        frequency: 'One-time subsidy credited upfront to loan principal',
        description: 'Substantially reduces monthly EMI and total interest payable on the home mortgage.',
      },
    ],
    documents: [
      { name: 'Aadhaar Card', mandatory: true, description: 'Self and all family members' },
      { name: 'Income Proof / Salary Slip / ITR / Self-Declaration', mandatory: true, description: 'Certifying family income bracket' },
      { name: 'Property Documents / Land Title (for BLC)', mandatory: false, description: 'Required if constructing on own plot' },
      { name: 'Home Loan Sanction Letter', mandatory: false, description: 'Required for Interest Subsidy Scheme (ISS) through bank' },
    ],
    application_steps: [
      'Apply online on pmaymis.gov.in or through Citizen Service Centres (CSC) / ULB municipality office.',
      'Select applicable vertical: Citizen Assessment for BLC / ISS / Affordable Housing.',
      'Bank processes interest subsidy claim through National Housing Bank (NHB) or HUDCO portal.',
      'Direct subsidy adjusted against principal loan amount.',
    ],
    application_url: 'https://pmaymis.gov.in',
    source_url: 'https://mohua.gov.in/schemes-pmay.php',
    source_name: 'Ministry of Housing and Urban Affairs, Govt of India',
    last_updated: '2024-09-12',
    status: 'Active',
    raw_record: {
      pmay_u_phase: 'PMAY-U 2.0',
      nodal_agencies: ['NHB', 'HUDCO', 'State Housing Boards'],
      carpet_area_sqm: 'EWS up to 30, LIG up to 60',
    },
  },

  // 7. Business & MSME: PMEGP
  {
    id: 'SCH-BUS-001',
    name: "Prime Minister's Employment Generation Programme (PMEGP)",
    description: 'Major credit-linked subsidy programme to generate self-employment opportunities through establishment of micro-enterprises in manufacturing and service sectors.',
    provider: 'Khadi and Village Industries Commission (KVIC), Ministry of MSME',
    provider_type: 'central',
    government_level: 'Central',
    categories: ['Business & MSME', 'Employment & Livelihood'],
    states: ['All-India'],
    districts: [],
    beneficiary_groups: ['Entrepreneurs', 'Unemployed Youth', 'Artisans', 'Self-Employed', 'SHG Members'],
    age_rules: {
      min_age: 18,
      max_age: null,
      description: 'Any individual above 18 years of age. No upper age ceiling.',
    },
    income_rules: {
      max_annual_income: null,
      description: 'No family income ceiling for setting up projects under PMEGP.',
    },
    occupation_rules: {
      allowed_occupations: ['Any', 'Unemployed', 'Artisan', 'Self Help Group'],
      description: 'Must set up a new micro-enterprise (manufacturing or service). Existing units not eligible.',
    },
    education_rules: {
      min_education_level: 'Class 8 Passed',
      description: 'At least VIII standard pass required for projects costing above ₹10 Lakh in manufacturing and above ₹5 Lakh in service sector.',
    },
    gender_rules: {
      allowed_genders: ['any'],
      description: 'Special subsidy rate (35% rural / 25% urban) for women, SC, ST, OBC, Minorities, and Ex-Servicemen.',
    },
    category_rules: {
      allowed_social_categories: ['Any'],
      description: 'General category gets 25% (rural) / 15% (urban); Special categories get 35% (rural) / 25% (urban) subsidy.',
    },
    geography_rules: {
      area_type: ['Any'],
      description: 'Both rural and urban areas covered, with higher subsidy rate in rural locations.',
    },
    other_rules: {
      max_project_cost_manufacturing: 5000000, // 50 Lakhs
      max_project_cost_services: 2000000,      // 20 Lakhs
      edp_training_mandatory: true,
    },
    benefits: [
      {
        type: 'Subsidized Loan',
        amount_or_details: '15% to 35% margin money government subsidy on bank loan for projects up to ₹50 Lakh (Manufacturing) and ₹20 Lakh (Service)',
        frequency: 'One-time capital subsidy kept in 3-year term deposit receipt',
        description: 'Own contribution is only 5% to 10% of total project cost; remainder financed by commercial bank loan.',
      },
    ],
    documents: [
      { name: 'Detailed Project Report (DPR)', mandatory: true, description: 'Business viability proposal and cashflow estimate' },
      { name: 'Aadhaar Card', mandatory: true, description: 'UIDAI identity document' },
      { name: 'Educational Qualification Certificate', mandatory: true, description: 'Class 8 or higher marksheet' },
      { name: 'Special Category / Caste Certificate', mandatory: false, description: 'Required for 35% special category subsidy rate' },
      { name: 'Rural Area Certificate', mandatory: false, description: 'Issued by Gram Panchayat for rural rate' },
    ],
    application_steps: [
      'Submit online application on KVIC PMEGP e-Portal (kviconline.gov.in).',
      'Select implementing agency: KVIC, KVIB, or District Industries Centre (DIC).',
      'Upload Detailed Project Report (DPR) and identity documents.',
      'Application forwarded electronically to applicant chosen financing bank.',
      'Bank conducts credit appraisal and sanctions loan; completes EDP training before subsidy release.',
    ],
    application_url: 'https://www.kviconline.gov.in/pmegp/pmegpweb/index.jsp',
    source_url: 'https://msme.gov.in/pmegp-prime-ministers-employment-generation-programme',
    source_name: 'Khadi & Village Industries Commission / Ministry of MSME',
    last_updated: '2024-08-20',
    status: 'Active',
    raw_record: {
      scheme_code: 'PMEGP_2024',
      implementing_bodies: ['KVIC', 'KVIB', 'DIC', 'Coir Board'],
      lock_in_period_years: 3,
    },
  },

  // 8. Business: PM Mudra Yojana
  {
    id: 'SCH-BUS-002',
    name: 'Pradhan Mantri MUDRA Yojana (PMMY)',
    description: 'Provides collateral-free institutional micro-credit up to ₹20 Lakhs to non-corporate, non-farm small/micro enterprises across Shishu, Kishore, and Tarun categories.',
    provider: 'Micro Units Development and Refinance Agency, Department of Financial Services',
    provider_type: 'central',
    government_level: 'Central',
    categories: ['Business & MSME', 'Employment & Livelihood'],
    states: ['All-India'],
    districts: [],
    beneficiary_groups: ['Small Business Owners', 'Shopkeepers', 'Fruit/Vegetable Vendors', 'Artisans', 'Micro-Entrepreneurs'],
    age_rules: {
      min_age: 18,
      max_age: 65,
      description: 'Adult Indian citizen with business establishment or viable business idea.',
    },
    income_rules: null,
    occupation_rules: {
      allowed_occupations: ['Small Business Owner', 'Trader', 'Manufacturer', 'Service Provider', 'Vendor'],
      disallowed_occupations: ['Direct Agricultural Crop Farming (Farming handled by KCC)'],
      description: 'Non-farm income generating micro activities, including allied agricultural activities like dairy/poultry.',
    },
    education_rules: null,
    gender_rules: {
      allowed_genders: ['any'],
      description: 'Open to all; women borrowers receive concession in lending interest rates in many banks.',
    },
    category_rules: {
      allowed_social_categories: ['Any'],
      description: 'Open to General, OBC, SC, ST without discrimination.',
    },
    geography_rules: {
      area_type: ['Any'],
      description: 'Available at all Public Sector, Private, Regional Rural, and Small Finance Banks across India.',
    },
    other_rules: {
      no_collateral_security: true,
      no_processing_fee_for_shishu: true,
    },
    benefits: [
      {
        type: 'Subsidized Loan',
        amount_or_details: 'Shishu (up to ₹50,000), Kishore (₹50,001 to ₹5 Lakh), Tarun (₹5 Lakh to ₹10 Lakh), Tarun Plus (up to ₹20 Lakh)',
        frequency: 'Repayable over 36 to 60 months with customized cash credit / term loan',
        description: 'Zero collateral security required; backed by Credit Guarantee Fund for Micro Units (CGFMU).',
      },
    ],
    documents: [
      { name: 'Aadhaar / Voter ID / PAN Card', mandatory: true, description: 'Proof of identity and address' },
      { name: 'Business Proof / Registration / Udyam Certificate', mandatory: false, description: 'Shop act or Udyam registration for Kishore & Tarun' },
      { name: 'Bank Statement of last 6 months', mandatory: false, description: 'Required for Kishore and Tarun loans' },
      { name: 'Quotation of Machinery / Items to be purchased', mandatory: true, description: 'For asset acquisition' },
    ],
    application_steps: [
      'Apply online on JanSamarth Portal (jansamarth.in) or visit any commercial bank branch.',
      'Fill Common Loan Application Form for MUDRA.',
      'Submit quotation for equipment or estimate for working capital.',
      'Bank sanctions loan and issues MUDRA RuPay Debit Card for working capital drawdowns.',
    ],
    application_url: 'https://www.jansamarth.in/home',
    source_url: 'https://www.mudra.org.in',
    source_name: 'MUDRA / Department of Financial Services, Ministry of Finance',
    last_updated: '2024-07-25',
    status: 'Active',
    raw_record: {
      portal_name: 'Jan Samarth',
      three_tiers: ['Shishu', 'Kishore', 'Tarun', 'Tarun Plus'],
      collateral_free: true,
    },
  },

  // 9. Street Vendors: PM SVANidhi
  {
    id: 'SCH-BUS-003',
    name: 'PM Street Vendor’s AtmaNirbhar Nidhi (PM SVANidhi)',
    description: 'Special micro-credit facility providing affordable collateral-free working capital loans to urban street vendors to resume and expand their livelihoods, with 7% interest subsidy and cashback on digital transactions.',
    provider: 'Ministry of Housing and Urban Affairs',
    provider_type: 'central',
    government_level: 'Central',
    categories: ['Business & MSME', 'Employment & Livelihood'],
    states: ['All-India'],
    districts: [],
    beneficiary_groups: ['Street Vendors', 'Hawkers', 'Thelawalas', 'Urban Informal Workers'],
    age_rules: {
      min_age: 18,
      max_age: null,
      description: 'Street vendors engaged in vending on or before March 2020 or having Vending Certificate.',
    },
    income_rules: null,
    occupation_rules: {
      allowed_occupations: ['Street Vendor', 'Hawker', 'Cart Operator', 'Pavement Seller'],
      description: 'Must possess Certificate of Vending (CoV) / ID Card issued by Urban Local Body (ULB) or Letter of Recommendation (LoR).',
    },
    education_rules: null,
    gender_rules: {
      allowed_genders: ['any'],
      description: 'Open to all street vendors irrespective of gender.',
    },
    category_rules: {
      allowed_social_categories: ['Any'],
      description: 'Open to all categories.',
    },
    geography_rules: {
      area_type: ['Urban', 'Semi-Urban'],
      description: 'Urban areas administered by Municipalities / Nagar Panchayats / Cantt Boards.',
    },
    other_rules: {
      digital_cashback: 'Up to ₹1,200 per year on QR code receipts',
      timely_repayment_escalation: true,
    },
    benefits: [
      {
        type: 'Subsidized Loan',
        amount_or_details: '1st tranche: ₹10,000; 2nd tranche: ₹20,000; 3rd tranche: ₹50,000 with 7% interest subsidy',
        frequency: '1 year tenure for 1st tranche; scalable upon timely repayment',
        description: 'Interest subsidy credited directly into bank account on quarterly basis.',
      },
    ],
    documents: [
      { name: 'Vending Certificate / Urban Local Body ID or Letter of Recommendation (LoR)', mandatory: true, description: 'Issued by Municipality' },
      { name: 'Aadhaar Card', mandatory: true, description: 'UIDAI Aadhaar linked to mobile number' },
      { name: 'Bank Account Passbook', mandatory: true, description: 'Active bank account details' },
    ],
    application_steps: [
      'Visit pmsvanidhi.mohua.gov.in portal or download PM SVANidhi mobile app.',
      'Check vending status using Aadhaar number.',
      'Select lending institution / bank branch and submit loan request.',
      'Lending bank processes sanction within 7 to 10 days.',
    ],
    application_url: 'https://pmsvanidhi.mohua.gov.in',
    source_url: 'https://mohua.gov.in/schemes-pmsvanidhi.php',
    source_name: 'Ministry of Housing and Urban Affairs, Govt of India',
    last_updated: '2024-06-15',
    status: 'Active',
    raw_record: {
      scheme_code: 'PMSVANIDHI_MOHUA',
      sidbi_partner: true,
      interest_subsidy_pct: 7.0,
    },
  },

  // 10. Healthcare: Ayushman Bharat PM-JAY
  {
    id: 'SCH-HEA-001',
    name: 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)',
    description: 'Worlds largest government-financed health insurance scheme providing health cover of ₹5 Lakh per family per year for secondary and tertiary care hospitalization to bottom 40% vulnerable population and all senior citizens aged 70+.',
    provider: 'National Health Authority (NHA), Ministry of Health and Family Welfare',
    provider_type: 'joint',
    government_level: 'Central',
    categories: ['Healthcare & Wellness', 'Social Security & Pension'],
    states: ['All-India'],
    districts: [],
    beneficiary_groups: ['Low-Income Families', 'BPL Families', 'Senior Citizens (70+)', 'Rural & Urban Vulnerable Workers'],
    age_rules: {
      min_age: null,
      max_age: null,
      description: 'No age limit for families covered under SECC/NFSA; Universal coverage for all individuals aged 70 and above irrespective of income.',
    },
    income_rules: {
      max_annual_income: 250000,
      description: 'Based on SECC 2011 deprivation criteria or state ration card priority list. (Income limit waived for senior citizens aged 70+).',
    },
    occupation_rules: null,
    education_rules: null,
    gender_rules: {
      allowed_genders: ['any'],
      description: 'Covers all members of the household without gender or family size restriction.',
    },
    category_rules: {
      allowed_social_categories: ['Any'],
      description: 'Open to all categories.',
    },
    geography_rules: {
      area_type: ['Any'],
      description: 'Empaneled government and private hospitals across participating states in India (portability enabled).',
    },
    other_rules: {
      pre_existing_conditions_covered: true,
      cashless_and_paperless: true,
    },
    benefits: [
      {
        type: 'Free Service / Treatment',
        amount_or_details: 'Cashless treatment coverage up to ₹5,00,000 per family per year (independent ₹5 Lakh top-up for seniors aged 70+)',
        frequency: 'Annual renewable health cover',
        description: 'Covers 1,949 medical and surgical procedures, room charges, ICU, diagnostic tests, and post-discharge medicines for 15 days.',
      },
    ],
    documents: [
      { name: 'Aadhaar Card', mandatory: true, description: 'Mandatory e-KYC document' },
      { name: 'Ration Card / NFSA Card / Family ID', mandatory: true, description: 'To establish family entitlement linkage' },
    ],
    application_steps: [
      'Check eligibility on beneficiary.nha.gov.in using Aadhaar number, Ration card, or PMJAY Family ID.',
      'Visit nearest Ayushman Arogya Mandir, CSC, or empaneled hospital Ayushman Mitra helpdesk.',
      'Complete Aadhaar biometric/face e-KYC.',
      'Download Ayushman PVC card instantly for cashless hospital admission.',
    ],
    application_url: 'https://beneficiary.nha.gov.in',
    source_url: 'https://nha.gov.in/PM-JAY',
    source_name: 'National Health Authority, Govt of India',
    last_updated: '2024-09-15',
    status: 'Active',
    raw_record: {
      package_count: 1949,
      hospital_network: 'Empaneled Public & Private Hospitals Pan-India',
      senior_citizen_expansion: 'Universal coverage for age 70+ approved in Sep 2024',
    },
  },

  // 11. Artisans: PM Vishwakarma
  {
    id: 'SCH-ART-001',
    name: 'PM Vishwakarma Scheme',
    description: 'Comprehensive end-to-end support for traditional artisans and craftspeople engaged in 18 notified trades, including recognition, skill upgradation, toolkit incentive of ₹15,000, and collateral-free enterprise credit at 5% concessional interest.',
    provider: 'Ministry of Micro, Small and Medium Enterprises',
    provider_type: 'central',
    government_level: 'Central',
    categories: ['Artisans & Skill Development', 'Business & MSME'],
    states: ['All-India'],
    districts: [],
    beneficiary_groups: ['Artisans', 'Craftspeople', 'Traditional Tradespersons', 'Carpenters', 'Blacksmiths', 'Potters', 'Masons', 'Tailors'],
    age_rules: {
      min_age: 18,
      max_age: null,
      description: 'Minimum 18 years on the date of application.',
    },
    income_rules: null,
    occupation_rules: {
      allowed_occupations: [
        'Carpenter (Suthar)', 'Boat Maker', 'Armourer', 'Blacksmith (Lohar)', 'Hammer and Tool Kit Maker',
        'Locksmith', 'Sculptor (Moortikar/Stone Carver)', 'Goldsmith (Sonar)', 'Potter (Kumhaar)',
        'Cobbler (Charmakar)', 'Mason (Rajmistri)', 'Basket/Mat/Broom Maker/Coir Weaver',
        'Doll & Toy Maker', 'Barber (Naai)', 'Garland Maker (Malakaar)', 'Washerman (Dhobi)',
        'Tailor (Darzi)', 'Fishing Net Maker'
      ],
      description: 'Must be actively practicing one of the 18 family-based traditional trades with hands and tools.',
    },
    education_rules: null,
    gender_rules: {
      allowed_genders: ['any'],
      description: 'Open to male, female, and transgender artisans.',
    },
    category_rules: {
      allowed_social_categories: ['Any'],
      description: 'All communities eligible.',
    },
    geography_rules: {
      area_type: ['Any'],
      description: 'Both rural and urban areas throughout India.',
    },
    other_rules: {
      one_member_per_family: true,
      no_regular_govt_servant: true,
    },
    benefits: [
      {
        type: 'Skill Training',
        amount_or_details: '₹500/day stipend during 5-7 days basic skill training + ₹15,000 e-voucher for modern toolkits',
        frequency: 'One-time incentive upon completing skill training',
        description: 'Includes formal PM Vishwakarma Certificate & ID card conferring master artisan recognition.',
      },
      {
        type: 'Subsidized Loan',
        amount_or_details: 'Tranche 1: ₹1,00,000 (18 months); Tranche 2: ₹2,00,000 (30 months) at 5% interest rate with 8% govt interest subvention',
        frequency: 'Credit facility through commercial banks',
        description: 'Collateral-free credit with guarantee coverage by Credit Guarantee Trust for Micro Units.',
      },
    ],
    documents: [
      { name: 'Aadhaar Card', mandatory: true, description: 'Mandatory Aadhaar with biometric auth' },
      { name: 'Active Bank Passbook', mandatory: true, description: 'Aadhaar-seeded bank account for stipend and toolkit voucher' },
      { name: 'Ration Card / Family Proof', mandatory: true, description: 'To enforce one member per family rule' },
    ],
    application_steps: [
      'Register free of cost at nearest Common Service Centre (CSC) with biometric authentication.',
      'Three-stage verification: Level 1 (Gram Panchayat / Urban Local Body Head), Level 2 (District Implementation Committee), Level 3 (Screening Committee).',
      'Receive digital PM Vishwakarma Certificate & ID.',
      'Attend 5-day basic training to unlock ₹15,000 digital toolkit voucher and loan eligibility.',
    ],
    application_url: 'https://pmvishwakarma.gov.in',
    source_url: 'https://msme.gov.in/pm-vishwakarma',
    source_name: 'Ministry of MSME / Ministry of Skill Development',
    last_updated: '2024-09-05',
    status: 'Active',
    raw_record: {
      total_trades_notified: 18,
      budget_outlay_cr: 13000,
      stipend_per_day: 500,
      toolkit_incentive: 15000,
    },
  },

  // 12. Social Security & Pension: Atal Pension Yojana
  {
    id: 'SCH-PEN-001',
    name: 'Atal Pension Yojana (APY)',
    description: 'Guaranteed monthly pension scheme for citizens working in the unorganized sector, ensuring financial security in old age with defined monthly pension ranging from ₹1,000 to ₹5,000 after 60 years of age.',
    provider: 'Pension Fund Regulatory and Development Authority (PFRDA), Ministry of Finance',
    provider_type: 'central',
    government_level: 'Central',
    categories: ['Social Security & Pension'],
    states: ['All-India'],
    districts: [],
    beneficiary_groups: ['Unorganized Sector Workers', 'Self-Employed', 'Daily Wage Earners', 'Domestic Workers'],
    age_rules: {
      min_age: 18,
      max_age: 40,
      description: 'Subscriber must be between 18 and 40 years of age at the time of joining.',
    },
    income_rules: {
      description: 'Subscriber must not be an income tax payer under the Income Tax Act.',
    },
    occupation_rules: {
      disallowed_occupations: ['Covered under statutory social security schemes (EPFO, NPS for govt employees)'],
      description: 'Focused primarily on workers in unorganized segments.',
    },
    education_rules: null,
    gender_rules: {
      allowed_genders: ['any'],
      description: 'Open to all genders.',
    },
    category_rules: {
      allowed_social_categories: ['Any'],
      description: 'Open to all.',
    },
    geography_rules: {
      area_type: ['Any'],
      description: 'All Indian citizens having a savings bank or post office account.',
    },
    other_rules: {
      spouse_pension_guaranteed: true,
      return_of_corpus_to_nominee: true,
    },
    benefits: [
      {
        type: 'Pension',
        amount_or_details: 'Guaranteed pension of ₹1,000, ₹2,000, ₹3,000, ₹4,000 or ₹5,000 per month starting at age 60 until death',
        frequency: 'Monthly credited pension',
        description: 'Pension guaranteed by Government of India; same pension continues to spouse after subscriber demise; accumulated corpus returned to nominee.',
      },
    ],
    documents: [
      { name: 'Savings Bank Account / Post Office Account', mandatory: true, description: 'Enabled for auto-debit of monthly contributions' },
      { name: 'Aadhaar Card', mandatory: true, description: 'Primary KYC document' },
      { name: 'Nominee Information', mandatory: true, description: 'Details of nominee and spouse' },
    ],
    application_steps: [
      'Visit your bank branch or use Internet Banking / Netbanking / YONO / Mobile Banking app.',
      'Fill APY registration form with auto-debit consent and chosen pension slab (₹1,000 to ₹5,000).',
      'Permanent Retirement Account Number (PRAN) generated instantly.',
      'Monthly contribution debited automatically until age 60.',
    ],
    application_url: 'https://enps.nsdl.com/eNPS/ApySubRegistration.html',
    source_url: 'https://pfrda.org.in/index1.cshtml?lsid=16',
    source_name: 'PFRDA, Ministry of Finance, Govt of India',
    last_updated: '2024-07-10',
    status: 'Active',
    raw_record: {
      pfrda_reg_code: 'APY_PFRDA_01',
      tax_payer_exclusion: 'Effective 1st Oct 2022, income tax payers cannot join APY',
      default_investment: 'Government Securities and Debt Portfolio',
    },
  },

  // 13. Women: Sukanya Samriddhi Yojana
  {
    id: 'SCH-WOM-001',
    name: 'Sukanya Samriddhi Yojana (SSY)',
    description: 'Government-backed high-yield small deposit savings scheme targeted at parents of girl children to build a dedicated education and marriage fund, offering the highest post office interest rate (8.2% p.a.) with complete triple tax exemption (EEE).',
    provider: 'Department of Economic Affairs, Ministry of Finance',
    provider_type: 'central',
    government_level: 'Central',
    categories: ['Women & Child Welfare', 'Education & Scholarships'],
    states: ['All-India'],
    districts: [],
    beneficiary_groups: ['Girl Children', 'Parents / Legal Guardians'],
    age_rules: {
      min_age: 0,
      max_age: 10,
      description: 'Girl child must be below 10 years of age at the time of account opening.',
    },
    income_rules: null,
    occupation_rules: null,
    education_rules: null,
    gender_rules: {
      allowed_genders: ['female'],
      description: 'Account opened strictly in the name of a girl child.',
    },
    category_rules: {
      allowed_social_categories: ['Any'],
      description: 'Open to all girl children in India.',
    },
    geography_rules: {
      area_type: ['Any'],
      description: 'Available at any post office or authorized commercial bank branch in India.',
    },
    other_rules: {
      maximum_two_girls_per_family: true, // exception for twins/triplets
      minimum_deposit_per_year: 250,
      maximum_deposit_per_year: 150000,
    },
    benefits: [
      {
        type: 'Direct Benefit Transfer',
        amount_or_details: '8.2% annual compounded interest rate with 100% tax exemption on deposit, accrued interest, and maturity withdrawal (EEE)',
        frequency: 'Matures 21 years from account opening or upon marriage after age 18',
        description: 'Partial withdrawal up to 50% permitted after age 18 for higher education purposes.',
      },
    ],
    documents: [
      { name: 'Birth Certificate of Girl Child', mandatory: true, description: 'Official municipal or hospital birth record' },
      { name: 'Aadhaar / ID Proof of Parent / Guardian', mandatory: true, description: 'KYC of opening guardian' },
      { name: 'Address Proof of Guardian', mandatory: true, description: 'Utility bill, passport, or Aadhaar' },
    ],
    application_steps: [
      'Visit any India Post office branch or designated commercial bank (SBI, PNB, BoB, Canara, etc.).',
      'Fill Sukanya Samriddhi Account Opening Form (SSA-1).',
      'Submit child birth certificate and parent KYC documents along with initial deposit (minimum ₹250).',
      'Collect physical SSY Passbook recording all deposits and interest credits.',
    ],
    application_url: 'https://www.ippbonline.com/web/ippb/sukanya-samriddhi-account',
    source_url: 'https://www.indiapost.gov.in/Financial/Pages/Content/Sukanya-Samriddhi-Account.aspx',
    source_name: 'India Post / Department of Posts, Ministry of Communications',
    last_updated: '2024-08-30',
    status: 'Active',
    raw_record: {
      interest_rate_pct: 8.2,
      tenure_years: 21,
      tax_status: 'Exempt-Exempt-Exempt (Section 80C)',
    },
  },

  // 14. Skill & Apprenticeship: NAPS
  {
    id: 'SCH-EMP-001',
    name: 'National Apprenticeship Promotion Scheme (NAPS)',
    description: 'Promotes apprenticeship training in industrial and service establishments by providing 25% stipend support directly into candidate bank accounts, enabling youth to gain hands-on industrial skills with assured stipend.',
    provider: 'Ministry of Skill Development and Entrepreneurship (MSDE)',
    provider_type: 'central',
    government_level: 'Central',
    categories: ['Employment & Livelihood', 'Artisans & Skill Development'],
    states: ['All-India'],
    districts: [],
    beneficiary_groups: ['Youth', 'Job Seekers', 'ITI Graduates', 'Diploma Holders', 'Fresh Graduates'],
    age_rules: {
      min_age: 18,
      max_age: 35,
      description: 'Candidate must be minimum 18 years of age (14 years for designated non-hazardous trades).',
    },
    income_rules: null,
    occupation_rules: {
      allowed_occupations: ['Unemployed', 'Trainee', 'Student'],
      description: 'Must not be currently engaged in permanent full-time employment.',
    },
    education_rules: {
      min_education_level: 'Class 8 Passed / Class 10 Passed / ITI / Diploma / Degree',
      eligible_courses: ['ITI', 'Diploma in Engineering', 'Graduate Apprentice', 'Technician Apprentice', 'Optional Trades'],
      description: 'Educational criteria vary from 8th pass to Graduate depending on the apprenticeship curriculum.',
    },
    gender_rules: {
      allowed_genders: ['any'],
      description: 'Open to all.',
    },
    category_rules: {
      allowed_social_categories: ['Any'],
      description: 'Open to all candidates.',
    },
    geography_rules: {
      area_type: ['Any'],
      description: 'Pan-India across MSMEs, large industrial corporations, and PSUs.',
    },
    other_rules: {},
    benefits: [
      {
        type: 'Skill Training',
        amount_or_details: 'Stipend ranging from ₹7,000 to ₹15,000 per month (Govt pays 25% directly via DBT up to ₹1,500/month; employer pays remainder)',
        frequency: 'Monthly DBT stipend credit',
        description: 'Includes National Apprenticeship Certificate (NAC) recognized across all government and private employers.',
      },
    ],
    documents: [
      { name: 'Aadhaar Card', mandatory: true, description: 'UIDAI Aadhaar with DBT linked bank account' },
      { name: 'Educational Marksheets (10th/12th/ITI/Diploma/Degree)', mandatory: true, description: 'Proof of qualification' },
      { name: 'Bank Account Passbook / Cancelled Cheque', mandatory: true, description: 'For direct stipend transfer' },
    ],
    application_steps: [
      'Register on Apprenticeship India Portal (apprenticeshipindia.gov.in).',
      'Complete e-KYC and fill candidate educational profile.',
      'Search apprenticeship opportunities by trade, location, or company.',
      'Sign digital Apprenticeship Contract online with employer.',
      'Begin training and receive monthly DBT stipend.',
    ],
    application_url: 'https://www.apprenticeshipindia.gov.in',
    source_url: 'https://msde.gov.in/schemes-initiatives/schemes-initiatives-apprenticeship-training',
    source_name: 'Ministry of Skill Development and Entrepreneurship',
    last_updated: '2024-06-28',
    status: 'Active',
    raw_record: {
      portal_name: 'Apprenticeship India Portal',
      dbt_stipend_cap: 1500,
      certificate_awarded: 'National Apprenticeship Certificate (NAC)',
    },
  },

  // 15. Disability & Inclusion: ADIP Scheme
  {
    id: 'SCH-DIS-001',
    name: 'Scheme of Assistance to Disabled Persons for Purchase/Fitting of Aids and Appliances (ADIP)',
    description: 'Provides free of cost modern, durable, and standard aids and assistive appliances (hearing aids, motorized tricycles, braille kits, prosthetics) to needy persons with disabilities to promote physical, social, and economic rehabilitation.',
    provider: 'Department of Empowerment of Persons with Disabilities, Ministry of Social Justice and Empowerment',
    provider_type: 'central',
    government_level: 'Central',
    categories: ['Disability & Inclusion', 'Healthcare & Wellness'],
    states: ['All-India'],
    districts: [],
    beneficiary_groups: ['Persons with Disabilities (PwD)', 'Divyangjan', 'Children with Special Needs'],
    age_rules: {
      min_age: null,
      max_age: null,
      description: 'Any age group. Special cochlear implant programme for children under 5 years.',
    },
    income_rules: {
      max_annual_income: 360000,
      description: '100% free aids for monthly family income up to ₹15,000 (₹1,80,000/yr); 50% subsidy for income between ₹15,001 and ₹30,000/month (up to ₹3,60,000/yr).',
    },
    occupation_rules: null,
    education_rules: null,
    gender_rules: {
      allowed_genders: ['any'],
      description: 'Open to all.',
    },
    category_rules: {
      allowed_social_categories: ['Any'],
      description: 'Open to all social categories.',
    },
    geography_rules: {
      area_type: ['Any'],
      description: 'Implemented through ALIMCO, District Disability Rehabilitation Centres (DDRCs), and State camps.',
    },
    other_rules: {
      minimum_disability_percentage: 40,
      gap_between_aid_distribution: '3 years for same appliance (1 year for children below 12)',
    },
    benefits: [
      {
        type: 'Equipment / In-Kind',
        amount_or_details: 'Free high-tech aids: Motorized Tricycles (up to ₹42,000), Smart Canes, Digital Hearing Aids, Battery operated Wheelchairs, Daisy Players, Prosthetic Limbs',
        frequency: 'Provided in-kind at free distribution assessment camps',
        description: 'Manufactured and certified by ALIMCO (Artificial Limbs Manufacturing Corporation of India).',
      },
    ],
    documents: [
      { name: 'Disability Certificate (UDID Card)', mandatory: true, description: 'Certifying 40% or more benchmark disability' },
      { name: 'Income Certificate', mandatory: true, description: 'Certifying family income below ₹30,000/month' },
      { name: 'Aadhaar Card', mandatory: true, description: 'Identity and address proof' },
      { name: 'Recent Passport Size Photograph showing disability', mandatory: true, description: 'Photograph' },
    ],
    application_steps: [
      'Register on the Unique Disability ID (UDID) portal (swavlambancard.gov.in) to get your UDID card.',
      'Apply at local District Disability Rehabilitation Centre (DDRC) or ALIMCO camp (alimco.in).',
      'Undergo medical assessment by specialist rehabilitation doctor.',
      'Receive fitted customized appliance at district distribution camp.',
    ],
    application_url: 'https://www.swavlambancard.gov.in',
    source_url: 'https://disabilityaffairs.gov.in/content/page/adip.php',
    source_name: 'Department of Empowerment of Persons with Disabilities, Govt of India',
    last_updated: '2024-05-18',
    status: 'Active',
    raw_record: {
      agency_name: 'ALIMCO',
      udid_linkage: 'Mandatory',
      appliance_catalog: 'Motorized Tricycle, BTE Hearing Aid, Braille Display, Prosthetics',
    },
  },

  // 16. State Specific: Yuva Nidhi Scheme (Karnataka)
  {
    id: 'SCH-STA-001',
    name: 'Karnataka Yuva Nidhi Scheme',
    description: 'State unemployment allowance scheme providing monthly financial support directly to educated unemployed degree and diploma holders in Karnataka while assisting with skill development training.',
    provider: 'Department of Skill Development, Entrepreneurship and Livelihood, Govt of Karnataka',
    provider_type: 'state',
    government_level: 'State',
    categories: ['Employment & Livelihood', 'Education & Scholarships'],
    states: ['Karnataka'],
    districts: [],
    beneficiary_groups: ['Unemployed Graduates', 'Diploma Holders', 'Youth of Karnataka'],
    age_rules: {
      min_age: 20,
      max_age: 30,
      description: 'Recent graduates who completed qualification in current or preceding academic year.',
    },
    income_rules: null,
    occupation_rules: {
      allowed_occupations: ['Unemployed'],
      disallowed_occupations: ['Employed in private/government sector', 'Self-employed / GST registered'],
      description: 'Applicant must not have secured employment within 6 months of degree/diploma completion.',
    },
    education_rules: {
      min_education_level: 'Polytechnic Diploma or Bachelor Degree',
      eligible_courses: ['Any recognized university degree or DTE polytechnic diploma'],
      description: 'Must have passed regular degree/diploma from an institution in Karnataka.',
    },
    gender_rules: {
      allowed_genders: ['any'],
      description: 'Open to all.',
    },
    category_rules: {
      allowed_social_categories: ['Any'],
      description: 'Open to all categories without caste discrimination.',
    },
    geography_rules: {
      area_type: ['Any'],
      states: ['Karnataka'],
      description: 'Must be a bona fide domicile resident of Karnataka for at least 6 years.',
    },
    other_rules: {
      domicile_karnataka_mandatory: true,
      max_duration_months: 24,
    },
    benefits: [
      {
        type: 'Direct Benefit Transfer',
        amount_or_details: '₹3,000 per month for Graduates; ₹1,500 per month for Diploma Holders',
        frequency: 'Monthly DBT for up to 2 years or until employment is secured',
        description: 'Direct credit into Aadhaar-seeded bank account through Seva Sindhu.',
      },
    ],
    documents: [
      { name: 'Karnataka Domicile / Domicile Certificate', mandatory: true, description: 'Proof of 6+ years residence in Karnataka' },
      { name: 'Degree or Diploma Passing Certificate', mandatory: true, description: 'Certifying completion year' },
      { name: 'Aadhaar Card', mandatory: true, description: 'Aadhaar linked to bank account' },
      { name: 'Self-declaration of Unemployment', mandatory: true, description: 'Digitally verified on portal' },
    ],
    application_steps: [
      'Log into Karnataka Seva Sindhu portal (sevasindhugs.karnataka.gov.in).',
      'Select Yuva Nidhi Scheme.',
      'Enter Aadhaar number and university registration number (NAD/DigiLocker integration).',
      'Submit self-declaration of unemployment status.',
      'Allowance credited monthly via DBT.',
    ],
    application_url: 'https://sevasindhugs.karnataka.gov.in',
    source_url: 'https://skilldevelopment.karnataka.gov.in',
    source_name: 'Government of Karnataka',
    last_updated: '2024-08-11',
    status: 'Active',
    raw_record: {
      state_code: 'KA',
      portal: 'Seva Sindhu Guarantee Schemes',
      graduate_monthly: 3000,
      diploma_monthly: 1500,
    },
  },

  // 17. State Specific: Mukhyamantri Kanya Sumangala Yojana (Uttar Pradesh)
  {
    id: 'SCH-STA-002',
    name: 'Mukhyamantri Kanya Sumangala Yojana (Uttar Pradesh)',
    description: 'Flagship conditional cash transfer scheme by Government of Uttar Pradesh to support girl children across six progressive milestones from birth, vaccination, school admission, to graduation.',
    provider: 'Department of Women and Child Development, Govt of Uttar Pradesh',
    provider_type: 'state',
    government_level: 'State',
    categories: ['Women & Child Welfare', 'Education & Scholarships'],
    states: ['Uttar Pradesh'],
    districts: [],
    beneficiary_groups: ['Girl Children', 'Students', 'Low-Income Families'],
    age_rules: {
      min_age: 0,
      max_age: 22,
      description: 'Phased stages from newborn up to undergraduate degree admission.',
    },
    income_rules: {
      max_annual_income: 300000,
      description: 'Maximum annual household income from all sources must not exceed ₹3,00,000.',
    },
    occupation_rules: null,
    education_rules: {
      min_education_level: 'Enrolled in School / College in UP',
      description: 'Stage-based: Class 1, Class 6, Class 9, and Degree/Diploma entry.',
    },
    gender_rules: {
      allowed_genders: ['female'],
      description: 'Strictly for girl children.',
    },
    category_rules: {
      allowed_social_categories: ['Any'],
      description: 'Open to all communities residing in UP.',
    },
    geography_rules: {
      area_type: ['Any'],
      states: ['Uttar Pradesh'],
      description: 'Must be a resident of Uttar Pradesh with permanent domicile.',
    },
    other_rules: {
      max_girls_per_family: 2,
    },
    benefits: [
      {
        type: 'Direct Benefit Transfer',
        amount_or_details: 'Total financial assistance of ₹25,000 disbursed across 6 stages (Birth: ₹5,000, Immunization: ₹2,000, Class 1: ₹3,000, Class 6: ₹3,000, Class 9: ₹5,000, Degree: ₹7,000)',
        frequency: 'Milestone-based DBT credits',
        description: 'Transferred directly to the mother/guardian/student bank account.',
      },
    ],
    documents: [
      { name: 'UP Domicile / Niwas Praman Patra', mandatory: true, description: 'Proof of permanent residence in Uttar Pradesh' },
      { name: 'Income Certificate', mandatory: true, description: 'Certifying family income below ₹3 Lakh' },
      { name: 'Birth Certificate of Girl Child', mandatory: true, description: 'Issued by hospital or municipal body' },
      { name: 'School / College Admission Certificate', mandatory: true, description: 'Required for educational stage tranches' },
      { name: 'Joint Bank Account Passbook (Child + Mother)', mandatory: true, description: 'Active bank account' },
    ],
    application_steps: [
      'Register on the official portal mksy.up.gov.in.',
      'Create Citizen Login using mobile number and Aadhaar.',
      'Select relevant stage (Stage 1 to 6) and upload required certificates.',
      'Block Development Officer (BDO) / SDM conducts digital inquiry and sanctions fund release.',
    ],
    application_url: 'https://mksy.up.gov.in',
    source_url: 'https://mksy.up.gov.in/women_welfare/index.php',
    source_name: 'Department of Women & Child Development, Govt of UP',
    last_updated: '2024-07-20',
    status: 'Active',
    raw_record: {
      state_code: 'UP',
      enhanced_amount_effective: 'April 2024 (increased from 15k to 25k)',
      stages: 6,
    },
  },

  // 18. Labour & Social Security: PM-SYM
  {
    id: 'SCH-LAB-001',
    name: 'Pradhan Mantri Shram Yogi Maan-dhan (PM-SYM)',
    description: 'Voluntary and contributory pension scheme for unorganized workers like street vendors, mid-day meal workers, head loaders, brick kiln workers, rag pickers, domestic workers, and agricultural laborers ensuring a minimum assured pension of ₹3,000 per month after age 60.',
    provider: 'Ministry of Labour and Employment',
    provider_type: 'central',
    government_level: 'Central',
    categories: ['Employment & Livelihood', 'Social Security & Pension'],
    states: ['All-India'],
    districts: [],
    beneficiary_groups: ['Unorganized Workers', 'Daily Wage Laborers', 'Construction Workers', 'Domestic Helpers'],
    age_rules: {
      min_age: 18,
      max_age: 40,
      description: 'Entry age is between 18 and 40 years.',
    },
    income_rules: {
      max_annual_income: 180000,
      description: 'Monthly income of the unorganized worker should not exceed ₹15,000 (₹1,80,000 per year).',
    },
    occupation_rules: {
      allowed_occupations: ['Unorganized Sector Worker', 'Construction Worker', 'Domestic Worker', 'Agricultural Laborer', 'Rickshaw Puller', 'Ragpicker'],
      disallowed_occupations: ['Members of EPFO, ESIC or NPS (Govt funded)', 'Income tax payees'],
      description: 'Must belong strictly to unorganized labor sector.',
    },
    education_rules: null,
    gender_rules: {
      allowed_genders: ['any'],
      description: 'Open to all.',
    },
    category_rules: {
      allowed_social_categories: ['Any'],
      description: 'Open to all.',
    },
    geography_rules: {
      area_type: ['Any'],
      description: 'Pan-India coverage.',
    },
    other_rules: {
      govt_50_pct_co_contribution: true,
    },
    benefits: [
      {
        type: 'Pension',
        amount_or_details: 'Assured monthly pension of ₹3,000 after attaining the age of 60 years',
        frequency: 'Monthly credited pension',
        description: '50% matching contribution deposited every month by Central Government into beneficiary pension account managed by LIC.',
      },
    ],
    documents: [
      { name: 'Aadhaar Card', mandatory: true, description: 'UIDAI Aadhaar' },
      { name: 'Savings Bank Account Passbook / Jan Dhan Account', mandatory: true, description: 'Enabled for auto-debit of ₹55 to ₹200/month based on entry age' },
    ],
    application_steps: [
      'Visit nearest Common Services Centre (CSC) with Aadhaar and bank passbook.',
      'CSC Village Level Entrepreneur (VLE) completes biometric authentication on maandhan.in.',
      'Initial monthly contribution (₹55 to ₹200) collected in cash and auto-debit mandate registered.',
      'Instant Shram Yogi Pension Card issued.',
    ],
    application_url: 'https://maandhan.in',
    source_url: 'https://labour.gov.in/pm-sym',
    source_name: 'Ministry of Labour & Employment / LIC of India',
    last_updated: '2024-06-12',
    status: 'Active',
    raw_record: {
      fund_manager: 'Life Insurance Corporation of India (LIC)',
      min_pension_amount: 3000,
      matching_contribution: '50% by Central Govt',
    },
  },
];
