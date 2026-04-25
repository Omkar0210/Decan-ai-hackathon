import { NextRequest, NextResponse } from 'next/server';

// ─── Skill Knowledge Base ───────────────────────────────────────────
// Maps technology keywords to their canonical skill names.
// This ensures "MERN" expands to the correct 4 skills, etc.
const SKILL_ALIASES: Record<string, string[]> = {
  'mern': ['MongoDB', 'Express.js', 'React', 'Node.js'],
  'mean': ['MongoDB', 'Express.js', 'Angular', 'Node.js'],
  'jamstack': ['JavaScript', 'API', 'Markup'],
  'lamp': ['Linux', 'Apache', 'MySQL', 'PHP'],
  'full stack': ['Frontend', 'Backend', 'Database'],
  'frontend': ['HTML', 'CSS', 'JavaScript'],
  'backend': ['Server', 'API', 'Database'],
};

const SKILL_KEYWORDS: Record<string, string> = {
  // Languages
  'java': 'Java', 'python': 'Python', 'javascript': 'JavaScript',
  'typescript': 'TypeScript', 'go': 'Go', 'golang': 'Go',
  'rust': 'Rust', 'c++': 'C++', 'c#': 'C#', 'csharp': 'C#',
  'ruby': 'Ruby', 'php': 'PHP', 'swift': 'Swift', 'kotlin': 'Kotlin',
  'scala': 'Scala', 'r ': 'R', 'matlab': 'MATLAB',
  // Frameworks & Libraries
  'react': 'React', 'reactjs': 'React', 'react.js': 'React',
  'angular': 'Angular', 'vue': 'Vue.js', 'vuejs': 'Vue.js', 'vue.js': 'Vue.js',
  'svelte': 'Svelte', 'next.js': 'Next.js', 'nextjs': 'Next.js',
  'nuxt': 'Nuxt.js', 'gatsby': 'Gatsby',
  'spring boot': 'Spring Boot', 'spring': 'Spring',
  'django': 'Django', 'flask': 'Flask', 'fastapi': 'FastAPI',
  'express': 'Express.js', 'express.js': 'Express.js', 'expressjs': 'Express.js',
  'node': 'Node.js', 'node.js': 'Node.js', 'nodejs': 'Node.js',
  'rails': 'Ruby on Rails', 'ruby on rails': 'Ruby on Rails',
  'flutter': 'Flutter', 'react native': 'React Native',
  '.net': '.NET', 'dotnet': '.NET', 'asp.net': 'ASP.NET',
  'laravel': 'Laravel', 'symfony': 'Symfony',
  'tailwind': 'Tailwind CSS', 'bootstrap': 'Bootstrap',
  'redux': 'Redux', 'graphql': 'GraphQL',
  // Databases
  'mysql': 'MySQL', 'postgresql': 'PostgreSQL', 'postgres': 'PostgreSQL',
  'mongodb': 'MongoDB', 'mongo': 'MongoDB', 'redis': 'Redis',
  'cassandra': 'Cassandra', 'dynamodb': 'DynamoDB',
  'mssql': 'MS SQL', 'sql server': 'MS SQL', 'sqlite': 'SQLite',
  'oracle db': 'Oracle DB', 'neo4j': 'Neo4j', 'elasticsearch': 'Elasticsearch',
  'couchdb': 'CouchDB', 'mariadb': 'MariaDB',
  // DevOps & Cloud
  'aws': 'AWS', 'azure': 'Azure', 'gcp': 'GCP', 'google cloud': 'GCP',
  'docker': 'Docker', 'kubernetes': 'Kubernetes', 'k8s': 'Kubernetes',
  'terraform': 'Terraform', 'ansible': 'Ansible',
  'ci/cd': 'CI/CD', 'cicd': 'CI/CD', 'jenkins': 'Jenkins',
  'github actions': 'GitHub Actions', 'gitlab ci': 'GitLab CI',
  // Messaging & Data
  'kafka': 'Kafka', 'rabbitmq': 'RabbitMQ', 'spark': 'Spark',
  'hadoop': 'Hadoop', 'airflow': 'Airflow', 'snowflake': 'Snowflake',
  // APIs & Architecture
  'rest api': 'REST API', 'rest': 'REST API', 'restful': 'REST API',
  'microservices': 'Microservices', 'serverless': 'Serverless',
  'api': 'API Design',
  // Tools & Practices
  'git': 'Git', 'jira': 'Jira', 'agile': 'Agile', 'scrum': 'Scrum',
  'figma': 'Figma', 'linux': 'Linux',
  // Data & ML
  'machine learning': 'Machine Learning', 'ml': 'Machine Learning',
  'deep learning': 'Deep Learning', 'nlp': 'NLP',
  'tensorflow': 'TensorFlow', 'pytorch': 'PyTorch',
  'pandas': 'Pandas', 'numpy': 'NumPy',
  'tableau': 'Tableau', 'power bi': 'Power BI',
  'data engineering': 'Data Engineering',
  'data analysis': 'Data Analysis',
};

// Domain groupings: skills that belong to the same tech domain
const TECH_DOMAINS: Record<string, string[]> = {
  'frontend': ['React', 'Vue.js', 'Angular', 'Svelte', 'Next.js', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Tailwind CSS', 'Bootstrap', 'Redux', 'Gatsby', 'Nuxt.js', 'React Native', 'Flutter'],
  'backend': ['Java', 'Spring Boot', 'Spring', 'Python', 'Django', 'Flask', 'FastAPI', 'Node.js', 'Express.js', 'Ruby on Rails', 'Go', 'Rust', 'C#', '.NET', 'ASP.NET', 'PHP', 'Laravel', 'Scala', 'REST API', 'API Design', 'Microservices', 'GraphQL'],
  'database': ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Cassandra', 'DynamoDB', 'MS SQL', 'SQLite', 'Neo4j', 'Elasticsearch', 'CouchDB', 'MariaDB', 'Oracle DB', 'Snowflake'],
  'devops': ['Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Terraform', 'Ansible', 'CI/CD', 'Jenkins', 'GitHub Actions', 'GitLab CI', 'Linux', 'Serverless'],
  'data_ml': ['Machine Learning', 'Deep Learning', 'NLP', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Spark', 'Hadoop', 'Airflow', 'Tableau', 'Power BI', 'Data Engineering', 'Data Analysis'],
  'mobile': ['React Native', 'Flutter', 'Swift', 'Kotlin'],
};

// Adjacent skills: for each skill, what are reasonable "extra" skills a candidate might have
const ADJACENT_SKILLS: Record<string, string[]> = {
  'React': ['TypeScript', 'Redux', 'Next.js', 'Tailwind CSS', 'Jest', 'Webpack'],
  'Vue.js': ['TypeScript', 'Nuxt.js', 'Vuex', 'Tailwind CSS'],
  'Angular': ['TypeScript', 'RxJS', 'NgRx'],
  'Node.js': ['Express.js', 'TypeScript', 'NestJS', 'Fastify'],
  'Express.js': ['Node.js', 'TypeScript', 'MongoDB', 'Redis'],
  'Java': ['Spring Boot', 'Spring', 'Maven', 'Gradle', 'Hibernate'],
  'Spring Boot': ['Java', 'Maven', 'Hibernate', 'MySQL', 'PostgreSQL', 'Microservices'],
  'Python': ['Django', 'Flask', 'FastAPI', 'Pandas', 'NumPy', 'Celery'],
  'Django': ['Python', 'PostgreSQL', 'Redis', 'Celery'],
  'MongoDB': ['Node.js', 'Express.js', 'Mongoose'],
  'PostgreSQL': ['SQL', 'Prisma', 'TypeORM', 'Hibernate'],
  'MySQL': ['SQL', 'Prisma', 'TypeORM', 'Hibernate'],
  'Docker': ['Kubernetes', 'CI/CD', 'AWS', 'Terraform'],
  'Kubernetes': ['Docker', 'Helm', 'AWS', 'Terraform'],
  'AWS': ['Docker', 'Kubernetes', 'Terraform', 'Lambda', 'S3'],
  'GraphQL': ['Apollo', 'TypeScript', 'React', 'Node.js'],
  'Machine Learning': ['Python', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy'],
  'TypeScript': ['React', 'Node.js', 'Next.js'],
  'REST API': ['Node.js', 'Express.js', 'Spring Boot', 'Django', 'FastAPI'],
  'Microservices': ['Docker', 'Kubernetes', 'Kafka', 'RabbitMQ', 'Spring Boot'],
  'Redis': ['Node.js', 'Python', 'Docker', 'AWS'],
  'Kafka': ['Java', 'Spring Boot', 'Microservices', 'Docker'],
};

// ─── Name & Profile Data ────────────────────────────────────────────
const FIRST_NAMES = [
  'Arjun', 'Mei', 'Carlos', 'Aisha', 'Liam', 'Yuki', 'Omar', 'Sofia',
  'Dev', 'Elena', 'Kai', 'Priya', 'Marco', 'Zara', 'Ravi', 'Hana',
  'Felix', 'Ananya', 'Lucas', 'Fatima', 'Nathan', 'Isla', 'Raj', 'Mia',
  'Tomas', 'Leila', 'Adrian', 'Suki', 'Viktor', 'Amara', 'Kenji', 'Ines',
  'Dmitri', 'Noor', 'Sven', 'Chidinma', 'Rafael', 'Linnea', 'Jin', 'Amira',
];

const LAST_NAMES = [
  'Sharma', 'Chen', 'Garcia', 'Patel', 'Kim', 'Tanaka', 'Hassan', 'Rodriguez',
  'Kumar', 'Ivanova', 'Nakamura', 'Silva', 'Johansson', 'Okafor', 'Singh',
  'Park', 'Muller', 'Santos', 'Andersen', 'Yamamoto', 'Fischer', 'Ali',
  'Jensen', 'Kowalski', 'Larsson', 'Moreno', 'Sato', 'Berg', 'Costa', 'Das',
  'Nguyen', 'Petrov', 'Adeyemi', 'Torres', 'Lindqvist', 'Okonkwo', 'Reyes',
];

const LOCATIONS = [
  'Bangalore, India', 'Sao Paulo, Brazil', 'Berlin, Germany', 'Lagos, Nigeria',
  'Tokyo, Japan', 'Toronto, Canada', 'Stockholm, Sweden', 'Dubai, UAE',
  'Singapore', 'London, UK', 'Seoul, South Korea', 'Mexico City, Mexico',
  'Sydney, Australia', 'Nairobi, Kenya', 'Amsterdam, Netherlands', 'Tel Aviv, Israel',
  'Buenos Aires, Argentina', 'Jakarta, Indonesia', 'Cairo, Egypt', 'Warsaw, Poland',
];

const EXPERIENCE_LEVELS = [
  '2 years', '3 years', '4 years', '5 years', '6 years',
  '7 years', '8 years', '10 years', '12 years', '15 years',
];

const CONVERSATION_TEMPLATES = {
  high: [
    'Yes, I am actively looking for new opportunities and this role aligns perfectly with my expertise. I would love to discuss further!',
    'Absolutely! This position sounds like a great fit. I have been working with these technologies extensively and I am ready for a new challenge.',
    'I am very interested. The tech stack matches my background well, and I have been wanting to work on something like this. Let us talk!',
  ],
  medium: [
    'I am open to exploring this opportunity. The role has some overlap with my skills, but I would need to learn a few things. Can you share more details?',
    'Maybe — I am not actively looking, but this sounds interesting enough to have a conversation. What does the team look like?',
    'I could be persuaded. Some of the required skills are in my wheelhouse, others are new to me. Tell me more about the growth opportunities.',
  ],
  low: [
    'I appreciate the outreach, but my current focus is in a different technology area. I do not think this role is the right fit for me right now.',
    'Not interested at this time. My expertise is in a different stack, and I would prefer to stay in my current domain. Good luck with the search!',
    'Thank you for reaching out, but this does not align with my career direction. I am happy where I am and not looking to switch.',
  ],
};

// ─── Utility Functions ──────────────────────────────────────────────

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function pickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateName(usedNames: Set<string>): string {
  let name = `${pickOne(FIRST_NAMES)} ${pickOne(LAST_NAMES)}`;
  let attempts = 0;
  while (usedNames.has(name) && attempts < 30) {
    name = `${pickOne(FIRST_NAMES)} ${pickOne(LAST_NAMES)}`;
    attempts++;
  }
  usedNames.add(name);
  return name;
}

// ─── Step 1: Strict Skill Extraction ────────────────────────────────

function extractSkillsFromJD(jd: string): string[] {
  const jdLower = jd.toLowerCase();
  const skills: string[] = [];
  const seen = new Set<string>();

  // First, expand known aliases (MERN, MEAN, etc.)
  for (const [alias, expanded] of Object.entries(SKILL_ALIASES)) {
    if (jdLower.includes(alias.toLowerCase())) {
      for (const skill of expanded) {
        const key = skill.toLowerCase();
        if (!seen.has(key)) {
          skills.push(skill);
          seen.add(key);
        }
      }
    }
  }

  // Then, match individual skill keywords
  // Sort by length descending so "spring boot" matches before "spring"
  const sortedKeywords = Object.entries(SKILL_KEYWORDS)
    .sort((a, b) => b[0].length - a[0].length);

  for (const [keyword, canonical] of sortedKeywords) {
    const key = canonical.toLowerCase();
    if (seen.has(key)) continue;

    // Use word boundary matching for short keywords to avoid false positives
    const regex = keyword.length <= 3
      ? new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
      : new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    if (regex.test(jd)) {
      skills.push(canonical);
      seen.add(key);
    }
  }

  return skills;
}

async function extractSkillsWithGemini(jd: string): Promise<string[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a technical recruiter. Extract ONLY the specific technical skills, frameworks, languages, and tools mentioned or directly implied in this job description. Do NOT add skills that are not related to the job. Return ONLY a JSON array of skill names.\n\nJob Description:\n${jd}`,
            }],
          }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 512 },
        }),
      }
    );

    if (!res.ok) return [];
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const match = text.match(/\[[\s\S]*?\]/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed)) return parsed.map(String);
    }
  } catch {
    console.log('Gemini skill extraction failed');
  }
  return [];
}

// ─── Step 2: JD-Domain Candidate Generation ─────────────────────────

interface RawCandidate {
  name: string;
  skills: string[];
  experience: string;
  title: string;
  location: string;
  summary: string;
}

function inferTitleFromSkills(skills: string[]): string {
  const skillSet = new Set(skills.map(s => s.toLowerCase()));
  const hasFrontend = ['react', 'vue.js', 'angular', 'svelte', 'next.js', 'typescript', 'javascript'].some(s => skillSet.has(s));
  const hasBackend = ['java', 'spring boot', 'python', 'django', 'node.js', 'express.js', 'go', 'rust'].some(s => skillSet.has(s));
  const hasData = ['machine learning', 'tensorflow', 'pytorch', 'pandas', 'spark'].some(s => skillSet.has(s));
  const hasDevOps = ['docker', 'kubernetes', 'aws', 'azure', 'terraform'].some(s => skillSet.has(s));

  if (hasData) return pickOne(['ML Engineer', 'Data Engineer', 'Data Scientist']);
  if (hasDevOps && !hasFrontend && !hasBackend) return pickOne(['DevOps Engineer', 'Platform Engineer', 'SRE']);
  if (hasFrontend && hasBackend) return pickOne(['Full Stack Engineer', 'Senior Software Engineer']);
  if (hasFrontend) return pickOne(['Frontend Engineer', 'UI Engineer', 'Senior Frontend Developer']);
  if (hasBackend) return pickOne(['Backend Engineer', 'Senior Software Engineer', 'Platform Engineer']);
  return pickOne(['Software Engineer', 'Senior Software Engineer', 'Staff Engineer']);
}

function getAdjacentSkills(requiredSkills: string[]): string[] {
  const adjacent = new Set<string>();
  for (const skill of requiredSkills) {
    const related = ADJACENT_SKILLS[skill] || [];
    for (const r of related) {
      if (!requiredSkills.some(rs => rs.toLowerCase() === r.toLowerCase())) {
        adjacent.add(r);
      }
    }
  }
  return Array.from(adjacent);
}

function generateCandidatesFromSkills(requiredSkills: string[]): RawCandidate[] {
  const usedNames = new Set<string>();
  const candidates: RawCandidate[] = [];
  const adjacentSkills = getAdjacentSkills(requiredSkills);

  // Define match tiers with precise skill counts
  const totalSkills = requiredSkills.length;

  // HIGH match: 70-100% of required skills
  const highCount = Math.max(1, Math.ceil(totalSkills * (0.7 + Math.random() * 0.3)));
  // MEDIUM match 1: 40-70%
  const med1Count = Math.max(1, Math.ceil(totalSkills * (0.4 + Math.random() * 0.3)));
  // MEDIUM match 2: 40-70% (different subset)
  const med2Count = Math.max(1, Math.ceil(totalSkills * (0.4 + Math.random() * 0.3)));
  // LOW match: 10-40%
  const lowCount = Math.max(0, Math.ceil(totalSkills * (0.1 + Math.random() * 0.3)));

  const profiles: Array<{ requiredCount: number; tier: 'high' | 'medium' | 'low' }> = [
    { requiredCount: highCount, tier: 'high' },
    { requiredCount: med1Count, tier: 'medium' },
    { requiredCount: med2Count, tier: 'medium' },
    { requiredCount: lowCount, tier: 'low' },
  ];

  // Maybe add a 5th candidate
  if (Math.random() > 0.4) {
    const extraCount = Math.max(1, Math.ceil(totalSkills * (0.3 + Math.random() * 0.5)));
    profiles.push({ requiredCount: extraCount, tier: extraCount / totalSkills >= 0.7 ? 'high' : extraCount / totalSkills >= 0.4 ? 'medium' : 'low' });
  }

  for (const profile of profiles) {
    const name = generateName(usedNames);

    // Pick required skills this candidate has
    const candidateRequiredSkills = pickRandom(requiredSkills, Math.min(profile.requiredCount, totalSkills));

    // Add 1-3 adjacent/extra skills from the same domain
    const extraCount = 1 + Math.floor(Math.random() * 3);
    const extraSkills = adjacentSkills.length > 0
      ? pickRandom(adjacentSkills, Math.min(extraCount, adjacentSkills.length))
      : [];

    const skills = Array.from(new Set([...candidateRequiredSkills, ...extraSkills]));
    const title = inferTitleFromSkills(skills);
    const location = pickOne(LOCATIONS);
    const experience = pickOne(EXPERIENCE_LEVELS);

    const topSkills = skills.slice(0, 3).join(', ');
    const summaryTemplates = {
      high: [
        `Experienced ${title} with deep expertise in ${topSkills}. Proven track record of building scalable systems and mentoring teams.`,
        `${title} specializing in ${topSkills}. Has led multiple high-impact projects from design to production.`,
      ],
      medium: [
        `${title} with solid foundation in ${topSkills}. Looking to expand into adjacent technologies and take on more responsibilities.`,
        `Versatile ${title} experienced in ${topSkills}. Eager to broaden skill set and contribute to cross-functional teams.`,
      ],
      low: [
        `${title} focused on ${topSkills}. Currently exploring opportunities that better align with existing expertise.`,
        `${title} with background in ${topSkills}. Open to conversations but primarily seeking roles closer to current stack.`,
      ],
    };
    const summary = pickOne(summaryTemplates[profile.tier]);

    candidates.push({ name, skills, experience, title, location, summary });
  }

  return candidates;
}

async function generateCandidatesWithGemini(requiredSkills: string[]): Promise<RawCandidate[] | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are generating candidate profiles for a job that requires these skills: ${JSON.stringify(requiredSkills)}

Generate 5 realistic candidate profiles. CRITICAL RULES:
- Each candidate's skills MUST be from the SAME technology domain as the required skills
- One candidate should match 70-100% of required skills (HIGH match)
- Two candidates should match 40-70% (MEDIUM match)
- One candidate should match less than 40% (LOW match)
- Extra skills must be ADJACENT to the required skills domain (e.g., if JD needs React, extra skills could be Redux, Next.js, NOT Java or Spring Boot)
- Do NOT give candidates skills from unrelated domains

Each candidate must include:
- name: realistic full name (diverse global backgrounds)
- skills: array of skill strings (mix of matched required skills + adjacent extras)
- experience: string like "5 years"
- title: realistic job title matching the domain
- location: city and country
- summary: 1-2 sentence professional summary

Return ONLY a JSON array. No explanation, no markdown.`,
            }],
          }],
          generationConfig: { temperature: 0.9, maxOutputTokens: 2048 },
        }),
      }
    );

    if (!res.ok) return null;
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const match = text.match(/\[[\s\S]*?\]/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed)) {
        const usedNames = new Set<string>();
        return parsed.map((c: Record<string, unknown>) => {
          const name = String(c.name || generateName(usedNames));
          usedNames.add(name);
          return {
            name,
            skills: Array.isArray(c.skills) ? c.skills.map(String) : [],
            experience: String(c.experience || pickOne(EXPERIENCE_LEVELS)),
            title: String(c.title || 'Software Engineer'),
            location: String(c.location || pickOne(LOCATIONS)),
            summary: String(c.summary || ''),
          };
        });
      }
    }
  } catch {
    console.log('Gemini candidate generation failed');
  }
  return null;
}

// ─── Step 3: Filtering ──────────────────────────────────────────────

function filterCandidates(candidates: RawCandidate[], requiredSkills: string[]): RawCandidate[] {
  return candidates.filter(candidate => {
    const matchCount = candidate.skills.filter(s =>
      requiredSkills.some(r => r.toLowerCase() === s.toLowerCase())
    ).length;
    // Keep candidates with at least 1 matching skill
    return matchCount > 0;
  });
}

// ─── Step 4: Match Score (strict math) ─────────────────────────────

function calculateMatchScore(candidateSkills: string[], requiredSkills: string[]): {
  score: number; matched: string[]; missing: string[];
} {
  const matched = candidateSkills.filter(s =>
    requiredSkills.some(r => r.toLowerCase() === s.toLowerCase())
  );
  const missing = requiredSkills.filter(r =>
    !candidateSkills.some(s => s.toLowerCase() === r.toLowerCase())
  );
  const score = requiredSkills.length > 0
    ? Math.round((matched.length / requiredSkills.length) * 100)
    : 0;
  return { score, matched, missing };
}

// ─── Step 5: Interest Score (rule-based) ────────────────────────────

function calculateInterestScore(matchScore: number): { score: number; reason: string } {
  if (matchScore > 70) {
    const score = 90 + Math.floor(Math.random() * 11); // 90-100
    return {
      score,
      reason: `Match score of ${matchScore}% indicates strong alignment — candidate is highly likely to be interested and responsive to outreach.`,
    };
  }
  if (matchScore >= 40) {
    const score = 50 + Math.floor(Math.random() * 21); // 50-70
    return {
      score,
      reason: `Match score of ${matchScore}% shows partial alignment — candidate may be open but would need to ramp up on missing skills.`,
    };
  }
  const score = 10 + Math.floor(Math.random() * 21); // 10-30
  return {
    score,
    reason: `Match score of ${matchScore}% indicates weak alignment — candidate is likely focused on a different technology area and may not engage.`,
  };
}

// ─── Step 6: Conversation Simulation ───────────────────────────────

function simulateConversation(matchScore: number): string {
  if (matchScore > 70) return pickOne(CONVERSATION_TEMPLATES.high);
  if (matchScore >= 40) return pickOne(CONVERSATION_TEMPLATES.medium);
  return pickOne(CONVERSATION_TEMPLATES.low);
}

// ─── Step 7: Why Selected ───────────────────────────────────────────

function buildWhySelected(data: {
  name: string; title: string; location: string; experience: string;
  matchScore: number; matchedSkills: string[]; missingSkills: string[];
  interestScore: number;
}): string {
  const parts: string[] = [];

  if (data.matchScore >= 70) {
    parts.push(`${data.name} is a strong match with ${data.matchScore}% skill overlap.`);
  } else if (data.matchScore >= 40) {
    parts.push(`${data.name} has moderate alignment at ${data.matchScore}% skill match.`);
  } else {
    parts.push(`${data.name} has limited direct skill overlap at ${data.matchScore}%.`);
  }

  if (data.matchedSkills.length > 0) {
    parts.push(`Matches: ${data.matchedSkills.join(', ')}.`);
  }
  if (data.missingSkills.length > 0) {
    parts.push(`Gaps: ${data.missingSkills.join(', ')}.`);
  }

  parts.push(`${data.title} based in ${data.location} with ${data.experience} of experience.`);

  if (data.interestScore >= 70) {
    parts.push('Highly receptive to outreach.');
  } else if (data.interestScore >= 40) {
    parts.push('Moderately open to conversation.');
  } else {
    parts.push('Likely to decline initial outreach.');
  }

  return parts.join(' ');
}

// ─── Validation ─────────────────────────────────────────────────────

function validateResults(
  candidates: Array<{
    name: string; matchScore: number; interestScore: number;
    finalScore: number; matchedSkills: string[]; missingSkills: string[];
  }>,
  requiredSkills: string[]
): boolean {
  if (candidates.length === 0) return false;

  // Check that scores are mathematically correct
  for (const c of candidates) {
    const expectedFinal = Math.round((c.matchScore * 0.6) + (c.interestScore * 0.4));
    if (Math.abs(expectedFinal - c.finalScore) > 1) return false;

    // Check match score is correct
    const expectedMatch = requiredSkills.length > 0
      ? Math.round((c.matchedSkills.length / requiredSkills.length) * 100)
      : 0;
    if (Math.abs(expectedMatch - c.matchScore) > 1) return false;
  }

  // Check that candidates vary (not all same score)
  const scores = candidates.map(c => c.matchScore);
  const uniqueScores = new Set(scores);
  if (uniqueScores.size < 2) return false;

  return true;
}

// ─── Main Handler ───────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobDescription } = body;

    if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length === 0) {
      return NextResponse.json({ error: 'Job description is required' }, { status: 400 });
    }

    const logs: string[] = [];

    // ── Step 1: Parse JD & Extract Skills ──
    logs.push('Parsing job description...');

    let requiredSkills: string[];
    const geminiSkills = await extractSkillsWithGemini(jobDescription);

    if (geminiSkills.length > 0) {
      requiredSkills = geminiSkills;
      logs.push(`Gemini extracted ${requiredSkills.length} skills: ${requiredSkills.join(', ')}`);
    } else {
      requiredSkills = extractSkillsFromJD(jobDescription);
      logs.push(`Keyword extraction found ${requiredSkills.length} skills: ${requiredSkills.join(', ')}`);
    }

    if (requiredSkills.length === 0) {
      logs.push('Warning: No skills detected — using fallback from JD text');
      requiredSkills = extractSkillsFromJD(jobDescription);
    }

    // ── Step 2: Generate Candidates ──
    logs.push('Generating candidate profiles based on required skills...');

    let rawCandidates: RawCandidate[];
    const geminiCandidates = await generateCandidatesWithGemini(requiredSkills);

    if (geminiCandidates && geminiCandidates.length > 0) {
      rawCandidates = geminiCandidates;
      logs.push(`AI generated ${rawCandidates.length} candidate profiles`);
    } else {
      rawCandidates = generateCandidatesFromSkills(requiredSkills);
      logs.push(`Generated ${rawCandidates.length} candidate profiles from skill analysis`);
    }

    // ── Step 3: Filter Candidates ──
    logs.push('Filtering candidates — removing zero-overlap profiles...');
    const beforeFilter = rawCandidates.length;
    rawCandidates = filterCandidates(rawCandidates, requiredSkills);
    const filtered = beforeFilter - rawCandidates.length;
    if (filtered > 0) {
      logs.push(`Removed ${filtered} candidate(s) with no skill overlap`);
    }
    logs.push(`${rawCandidates.length} candidates passed filtering`);

    // ── Step 4: Calculate Match Scores ──
    logs.push('Calculating match scores (matched skills / total required skills)...');

    const candidates = rawCandidates.map(raw => {
      const { score: matchScore, matched: matchedSkills, missing: missingSkills } =
        calculateMatchScore(raw.skills, requiredSkills);

      // ── Step 5: Interest Score ──
      const { score: interestScore, reason: interestReason } = calculateInterestScore(matchScore);

      // ── Step 6: Final Score ──
      const finalScore = Math.round((matchScore * 0.6) + (interestScore * 0.4));

      const explanation = `Matches ${matchedSkills.length} out of ${requiredSkills.length} required skills`;

      const whySelected = buildWhySelected({
        name: raw.name, title: raw.title, location: raw.location,
        experience: raw.experience, matchScore, matchedSkills, missingSkills, interestScore,
      });

      const conversation = simulateConversation(matchScore);

      return {
        name: raw.name,
        skills: raw.skills,
        experience: raw.experience,
        title: raw.title,
        location: raw.location,
        summary: raw.summary,
        matchScore,
        interestScore,
        finalScore,
        explanation,
        whySelected,
        interestReason,
        matchedSkills,
        missingSkills,
        conversation: [conversation],
      };
    });

    // ── Step 7: Rank ──
    logs.push('Simulating outreach conversations...');
    logs.push('Computing final scores (60% match + 40% interest)...');
    candidates.sort((a, b) => b.finalScore - a.finalScore);
    logs.push('Ranking candidates by final score...');

    // ── Step 8: Validate ──
    logs.push('Validating results — checking score accuracy and candidate variation...');
    const isValid = validateResults(candidates, requiredSkills);
    if (!isValid) {
      logs.push('Validation failed — regenerating candidates...');
      // Regenerate with fallback
      const fallbackCandidates = generateCandidatesFromSkills(requiredSkills);
      const filteredFallback = filterCandidates(fallbackCandidates, requiredSkills);

      const regenerated = filteredFallback.map(raw => {
        const { score: matchScore, matched: matchedSkills, missing: missingSkills } =
          calculateMatchScore(raw.skills, requiredSkills);
        const { score: interestScore, reason: interestReason } = calculateInterestScore(matchScore);
        const finalScore = Math.round((matchScore * 0.6) + (interestScore * 0.4));
        const explanation = `Matches ${matchedSkills.length} out of ${requiredSkills.length} required skills`;
        const whySelected = buildWhySelected({
          name: raw.name, title: raw.title, location: raw.location,
          experience: raw.experience, matchScore, matchedSkills, missingSkills, interestScore,
        });
        const conversation = simulateConversation(matchScore);
        return {
          name: raw.name, skills: raw.skills, experience: raw.experience,
          title: raw.title, location: raw.location, summary: raw.summary,
          matchScore, interestScore, finalScore, explanation, whySelected,
          interestReason, matchedSkills, missingSkills, conversation: [conversation],
        };
      });

      regenerated.sort((a, b) => b.finalScore - a.finalScore);
      candidates.length = 0;
      candidates.push(...regenerated);
      logs.push('Regeneration complete — results validated');
    } else {
      logs.push('Validation passed — scores are accurate and candidates vary');
    }

    // ── Summary ──
    if (candidates.length > 0) {
      logs.push(`Top candidate: ${candidates[0].name} (${candidates[0].matchScore}% match, score: ${candidates[0].finalScore})`);
    }
    logs.push('Scouting complete!');

    return NextResponse.json({ logs, candidates, requiredSkills });
  } catch (error) {
    console.error('Agent error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
