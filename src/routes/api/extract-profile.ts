import { createFileRoute } from '@tanstack/react-router';

// Rule-based fallback extractor (ported from the original Express server)
function extractProfileRuleBased(text: string) {
  const lower = text.toLowerCase();
  const facts: Array<{ field: string; value: any; confidence: number; source: string }> = [];

  const ageMatch =
    text.match(/\b(\d{1,2})\s*(?:years?\s*old|yr|yo|age\s*(?:is|of)?\s*(\d{1,2}))\b/i) ||
    text.match(/\bage[:\s]+(\d{1,2})\b/i);
  if (ageMatch) {
    const ageVal = parseInt(ageMatch[1] || ageMatch[2] || '', 10);
    if (!isNaN(ageVal) && ageVal > 0 && ageVal < 110) {
      facts.push({ field: 'age', value: ageVal, confidence: 0.95, source: ageMatch[0] });
    }
  }

  if (/student|studying|college|university|school|degree|b\.?tech|diploma|graduation|matric/i.test(lower)) {
    let eduLevel = 'Student';
    if (/b\.?tech|engineering|b\.?e\b/i.test(lower)) eduLevel = 'Undergraduate (Engineering/Tech)';
    else if (/undergrad|degree|college|b\.?a|b\.?sc|b\.?com/i.test(lower)) eduLevel = 'Undergraduate / College';
    else if (/postgrad|master|m\.?tech|m\.?sc|mba/i.test(lower)) eduLevel = 'Postgraduate';
    else if (/10th|12th|matric|high school/i.test(lower)) eduLevel = 'Secondary / Higher Secondary';

    facts.push({ field: 'education_status', value: 'Current Student', confidence: 0.9, source: 'Mentioned student status / course in text' });
    facts.push({ field: 'education_level', value: eduLevel, confidence: 0.85, source: 'Extracted from education terms' });
  }

  if (/farmer|farming|agriculture|crop|kisan|cultivator|tractor|landholder|agricultural/i.test(lower)) {
    facts.push({ field: 'occupation', value: 'Farmer / Agriculturalist', confidence: 0.95, source: 'Farmer / Agricultural terms mentioned' });
  }

  if (/business|startup|shopkeeper|vendor|entrepreneur|msme|store owner|enterprise|trader/i.test(lower)) {
    facts.push({ field: 'occupation', value: 'Small Business / Entrepreneur', confidence: 0.92, source: 'Business / vendor terms mentioned' });
  }

  if (/labour|labor|construction worker|daily wage|driver|electrician|plumber|carpenter|artisan|craftsman|weaver/i.test(lower)) {
    facts.push({ field: 'occupation', value: 'Artisan / Worker / Daily Wage', confidence: 0.9, source: 'Artisan/Labour terms mentioned' });
  }

  if (/house|housing|home|build.*house|kucha|homeless|slum|awas|shelter/i.test(lower)) {
    facts.push({ field: 'housing_status', value: 'Seeking Housing / Kutcha House', confidence: 0.88, source: 'Housing assistance mentioned' });
  }

  const incomeLakhMatch =
    text.match(/(?:income|earning|salary|household|family).{0,25}?(\d+(?:\.\d+)?)\s*(?:lakh|lac|lpa)/i) ||
    text.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac|lpa)\s*(?:per year|annual|family income)?/i);
  if (incomeLakhMatch) {
    const lakhs = parseFloat(incomeLakhMatch[1] ?? '');
    facts.push({ field: 'annual_household_income', value: lakhs * 100000, confidence: 0.88, source: incomeLakhMatch[0] ?? '' });
  }

  if (/\b(?:woman|female|girl|mother|widow|lady)\b/i.test(lower)) {
    facts.push({ field: 'gender', value: 'Female', confidence: 0.92, source: 'Gender indicator found in text' });
  } else if (/\b(?:man|male|boy|father|son)\b/i.test(lower)) {
    facts.push({ field: 'gender', value: 'Male', confidence: 0.85, source: 'Gender indicator found in text' });
  }

  if (/\b(?:sc|scheduled caste)\b/i.test(lower)) {
    facts.push({ field: 'social_category', value: 'SC', confidence: 0.95, source: 'SC mentioned' });
  } else if (/\b(?:st|scheduled tribe)\b/i.test(lower)) {
    facts.push({ field: 'social_category', value: 'ST', confidence: 0.95, source: 'ST mentioned' });
  } else if (/\b(?:obc|other backward)\b/i.test(lower)) {
    facts.push({ field: 'social_category', value: 'OBC', confidence: 0.95, source: 'OBC mentioned' });
  } else if (/\b(?:ews|economically weaker)\b/i.test(lower)) {
    facts.push({ field: 'social_category', value: 'EWS', confidence: 0.95, source: 'EWS mentioned' });
  } else if (/\b(?:general category|general)\b/i.test(lower)) {
    facts.push({ field: 'social_category', value: 'General', confidence: 0.8, source: 'General category mentioned' });
  }

  if (/disab|handicap|pwd|divyang|visually impaired|locomotor/i.test(lower)) {
    facts.push({ field: 'disability_status', value: 'Person with Disability (PwD)', confidence: 0.95, source: 'Disability reference in input' });
  }

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
    'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir', 'Ladakh',
  ];
  for (const s of states) {
    if (new RegExp(`\\b${s}\\b`, 'i').test(text)) {
      facts.push({ field: 'state', value: s, confidence: 0.98, source: s });
      break;
    }
  }

  const inferredCategories: string[] = [];
  if (/student|education|scholarship|college|fees|tuition|course/i.test(lower)) inferredCategories.push('Education & Scholarships');
  if (/farmer|agriculture|crop|kisan|seeds|tractor|fertilizer/i.test(lower)) inferredCategories.push('Agriculture & Rural');
  if (/house|housing|home|awas|shelter|slum/i.test(lower)) inferredCategories.push('Housing & Shelter');
  if (/job|employ|unemploy|career|work|training/i.test(lower)) inferredCategories.push('Employment & Livelihood');
  if (/business|shop|vendor|msme|startup|loan|capital/i.test(lower)) inferredCategories.push('Business & MSME');
  if (/health|hospital|treatment|medical|ayushman|illness/i.test(lower)) inferredCategories.push('Healthcare & Wellness');
  if (/woman|women|widow|girl|maternity/i.test(lower)) inferredCategories.push('Women & Child Welfare');
  if (/pension|senior citizen|old age|elderly/i.test(lower)) inferredCategories.push('Social Security & Pension');
  if (/artisan|vishwakarma|carpenter|craftsman|potter|blacksmith/i.test(lower)) inferredCategories.push('Artisans & Skill Development');
  if (/disab|pwd|divyang/i.test(lower)) inferredCategories.push('Disability & Inclusion');

  if (inferredCategories.length === 0) inferredCategories.push('General Welfare & Social Security');

  return {
    stated_need: text.trim(),
    facts,
    inferred_categories: inferredCategories,
    missing_high_value_fields: ['state', 'annual_household_income', 'age'].filter(
      (f) => !facts.some((fact) => fact.field === f)
    ),
    privacy_flags: {
      has_voluntarily_provided_sensitive_info: facts.some((f) =>
        ['social_category', 'disability_status'].includes(f.field)
      ),
    },
  };
}

const PROFILE_SCHEMA = {
  type: 'object',
  properties: {
    stated_need: { type: 'string', description: 'A clean summary of what the user is requesting assistance for' },
    facts: {
      type: 'array',
      description: 'List of extracted facts with confidence and exact textual source',
      items: {
        type: 'object',
        properties: {
          field: { type: 'string', description: 'Field name: age, state, district, gender, occupation, education_level, education_status, annual_household_income, social_category, disability_status, housing_status' },
          value: { type: 'string', description: 'Extracted value as a string (numbers as numeric strings e.g. "250000" or "21")' },
          confidence: { type: 'number', description: 'Confidence score from 0.0 to 1.0' },
          source: { type: 'string', description: 'Verbatim substring from the user input confirming this fact' },
        },
        required: ['field', 'value', 'confidence', 'source'],
      },
    },
    inferred_categories: { type: 'array', items: { type: 'string' } },
    missing_high_value_fields: { type: 'array', items: { type: 'string' } },
  },
  required: ['stated_need', 'facts', 'inferred_categories', 'missing_high_value_fields'],
};

export const Route = createFileRoute('/api/extract-profile')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let text = '';
        try {
          const body = await request.json();
          text = typeof body?.text === 'string' ? body.text : '';
        } catch {
          return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
        }
        if (!text) {
          return Response.json({ error: 'Missing or invalid input text' }, { status: 400 });
        }

        const apiKey = process.env['LOVABLE_API_KEY'];
        if (!apiKey) {
          return Response.json({ profile: extractProfileRuleBased(text), source: 'heuristic-engine' });
        }

        try {
          const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash',
              messages: [
                {
                  role: 'system',
                  content:
                    'You are the lead AI information extraction engine for SchemeSaar, an official scheme discovery platform in India. Analyze the user\'s natural language requirement. Extract only explicitly stated facts or safe, conservative inferences (e.g., student, age, farmer, housing situation, state, income). Do NOT invent any facts or assumptions not directly substantiated by the query.',
                },
                { role: 'user', content: `User Query: "${text}"` },
              ],
              response_format: {
                type: 'json_schema',
                json_schema: { name: 'profile_extraction', schema: PROFILE_SCHEMA, strict: true },
              },
            }),
          });

          if (!aiRes.ok) throw new Error(`AI gateway error: ${aiRes.status}`);

          const aiData = await aiRes.json();
          const content = aiData?.choices?.[0]?.message?.content;
          const parsed = JSON.parse(typeof content === 'string' ? content : '{}');

          if (!parsed.facts || !Array.isArray(parsed.facts)) {
            return Response.json({ profile: extractProfileRuleBased(text), source: 'heuristic-engine-fallback' });
          }

          parsed.facts = parsed.facts.map((f: any) => {
            if (['age', 'annual_household_income'].includes(f.field)) {
              const num = Number(f.value);
              if (!isNaN(num)) return { ...f, value: num };
            }
            return f;
          });

          return Response.json({ profile: parsed, source: 'gemini-2.5-flash' });
        } catch (error: any) {
          console.warn('AI extraction error, falling back to heuristic engine:', error?.message);
          return Response.json({ profile: extractProfileRuleBased(text), source: 'heuristic-engine-fallback' });
        }
      },
    },
  },
});
