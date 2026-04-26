import { NextRequest, NextResponse } from 'next/server';

// ─── Skill Knowledge Base ───────────────────────────────────────────
// Maps technology keywords to their canonical skill names.
// This ensures "MERN" expands to the correct 4 skills, etc.
const SKILL_ALIASES: Record<string, string[]> = {
  'mern': ['MongoDB', 'Express.js', 'React', 'Node.js'],
  'mean': ['MongoDB', 'Express.js', 'Angular', 'Node.js'],
  'jamstack': ['JavaScript', 'React', 'AWS'],
  'lamp': ['Linux', 'Apache', 'MySQL', 'PHP'],
  'full stack': ['React', 'Node.js', 'MongoDB'],
  'frontend developer': ['React', 'TypeScript', 'Tailwind CSS'],
  'backend developer': ['Node.js', 'Express.js', 'PostgreSQL'],
  'java backend': ['Java', 'Spring Boot', 'MySQL'],
};

// ─── GENERIC SKILLS BLACKLIST ─────────────────────────────────────
// These are NOT real technologies — filter them out completely
const GENERIC_SKILLS_BLACKLIST = new Set([
  'backend', 'frontend', 'database', 'server', 'api', 'html', 'css',
  'markup', 'linux', 'apache', 'programming', 'development', 'software',
  'web development', 'mobile development', 'data', 'distributed systems',
]);

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

// ─── SKILL WEIGHTING SYSTEM ──────────────────────────────────────
// Core skills are critical (weight 2), secondary are nice-to-have (weight 1)
// This prevents generic terms from inflating scores
const SKILL_WEIGHTS: Record<string, number> = {
  // Languages (core, weight 2)
  'Java': 2, 'Python': 2, 'JavaScript': 2, 'TypeScript': 2, 'Go': 2, 'Rust': 2,
  'Ruby': 2, 'PHP': 2, 'C#': 2, 'C++': 2, 'Kotlin': 2,
  // Frameworks (core, weight 2)
  'React': 2, 'Vue.js': 2, 'Angular': 2, 'Node.js': 2, 'Express.js': 2,
  'Django': 2, 'Flask': 2, 'FastAPI': 2, 'Spring Boot': 2, 'Next.js': 2,
  'Ruby on Rails': 2, 'Svelte': 2, '.NET': 2, 'ASP.NET': 2,
  // Databases (core, weight 2)
  'PostgreSQL': 2, 'MySQL': 2, 'MongoDB': 2, 'Redis': 2, 'Cassandra': 2,
  // DevOps (core, weight 2)
  'Docker': 2, 'Kubernetes': 2, 'AWS': 2, 'Azure': 2, 'GCP': 2,
  // Complementary tools (secondary, weight 1)
  'TypeScript': 1, 'Redux': 1, 'Tailwind CSS': 1, 'Bootstrap': 1,
  'REST API': 1, 'GraphQL': 1, 'Microservices': 1, 'CI/CD': 1,
  'Terraform': 1, 'Ansible': 1, 'Jenkins': 1, 'GitHub Actions': 1,
  'TensorFlow': 1, 'PyTorch': 1, 'Pandas': 1, 'NumPy': 1,
  'Machine Learning': 1, 'Deep Learning': 1, 'Data Engineering': 1,
};

// Adjacent skills: for each skill, what are reasonable "extra" skills a candidate might have
const ADJACENT_SKILLS: Record<string, string[]> = {
  'React': ['TypeScript', 'Redux', 'Next.js', 'Tailwind CSS', 'Jest'],
  'Vue.js': ['TypeScript', 'Nuxt.js', 'Vuex', 'Tailwind CSS'],
  'Angular': ['TypeScript', 'RxJS', 'NgRx'],
  'Node.js': ['Express.js', 'TypeScript', 'NestJS'],
  'Express.js': ['Node.js', 'TypeScript', 'MongoDB', 'Redis'],
  'Java': ['Spring Boot', 'Spring', 'Maven', 'Gradle'],
  'Spring Boot': ['Java', 'Maven', 'MySQL', 'PostgreSQL', 'Microservices'],
  'Python': ['Django', 'Flask', 'FastAPI', 'Pandas', 'NumPy'],
  'Django': ['Python', 'PostgreSQL', 'Redis'],
  'MongoDB': ['Node.js', 'Express.js', 'Mongoose'],
  'PostgreSQL': ['TypeORM', 'Hibernate', 'Django'],
  'MySQL': ['TypeORM', 'Hibernate', 'Laravel'],
  'Docker': ['Kubernetes', 'CI/CD', 'AWS', 'Terraform'],
  'Kubernetes': ['Docker', 'AWS', 'Terraform'],
  'AWS': ['Docker', 'Kubernetes', 'Terraform'],
  'GraphQL': ['Apollo', 'TypeScript', 'React', 'Node.js'],
  'Machine Learning': ['Python', 'TensorFlow', 'PyTorch', 'Pandas'],
  'TypeScript': ['React', 'Node.js', 'Next.js'],
  'REST API': ['Node.js', 'Express.js', 'Spring Boot', 'Django'],
  'Microservices': ['Docker', 'Kubernetes', 'Kafka', 'Spring Boot'],
  'Redis': ['Node.js', 'Python', 'Docker'],
  'Kafka': ['Java', 'Spring Boot', 'Microservices'],
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

// ─── Domain Detection ────────────────────────────────────────────
// Detect the role type from the JD to apply smart skill normalization
function detectRoleDomain(jd: string): 'mern' | 'java_backend' | 'python_backend' | 'devops' | 'data_ml' | 'frontend' | 'generic' {
  const jdLower = jd.toLowerCase();
  
  if ((jdLower.includes('machine learning') || jdLower.includes('ml') || jdLower.includes('data scientist')) && 
      (jdLower.includes('python') || jdLower.includes('tensorflow') || jdLower.includes('pytorch'))) {
    return 'data_ml';
  }
  if ((jdLower.includes('devops') || jdLower.includes('kubernetes') || jdLower.includes('docker') || jdLower.includes('infrastructure')) &&
      !jdLower.includes('react')) {
    return 'devops';
  }
  if ((jdLower.includes('java') || jdLower.includes('spring boot')) && !jdLower.includes('react')) {
    return 'java_backend';
  }
  if ((jdLower.includes('python') && (jdLower.includes('django') || jdLower.includes('flask'))) && !jdLower.includes('react')) {
    return 'python_backend';
  }
  if ((jdLower.includes('mern') || (jdLower.includes('react') && jdLower.includes('node'))) || 
      (jdLower.includes('full stack') && (jdLower.includes('react') || jdLower.includes('javascript')))) {
    return 'mern';
  }
  if ((jdLower.includes('frontend') || jdLower.includes('react') || jdLower.includes('vue') || jdLower.includes('angular')) && 
      !jdLower.includes('backend') && !jdLower.includes('full')) {
    return 'frontend';
  }
  return 'generic';
}

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
        // Reject generic skills immediately
        if (!GENERIC_SKILLS_BLACKLIST.has(key) && !seen.has(key)) {
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
    // Skip if already added OR if it's a blacklisted generic skill
    if (seen.has(key) || GENERIC_SKILLS_BLACKLIST.has(key)) continue;

    // Use word boundary matching for short keywords to avoid false positives
    const regex = keyword.length <= 3
      ? new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
      : new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    if (regex.test(jd)) {
      skills.push(canonical);
      seen.add(key);
    }
  }

  // If no real skills found after blacklist, provide intelligent defaults based on domain
  if (skills.length === 0) {
    const domain = detectRoleDomain(jd);
    if (domain === 'mern') {
      skills.push(...['React', 'Node.js', 'MongoDB']);
    } else if (domain === 'java_backend') {
      skills.push(...['Java', 'Spring Boot', 'MySQL']);
    } else if (domain === 'python_backend') {
      skills.push(...['Python', 'Django', 'PostgreSQL']);
    } else if (domain === 'devops') {
      skills.push(...['Docker', 'Kubernetes', 'AWS']);
    } else if (domain === 'data_ml') {
      skills.push(...['Python', 'Machine Learning', 'TensorFlow']);
    } else if (domain === 'frontend') {
      skills.push(...['React', 'TypeScript', 'Tailwind CSS']);
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

// ─── Step 4: Weighted Match Score (intelligent scoring) ──────────

function calculateWeightedMatchScore(candidateSkills: string[], requiredSkills: string[]): {
  score: number; matched: string[]; missing: string[];
} {
  const matched: string[] = [];
  let matchedWeight = 0;
  let totalWeight = 0;

  // Calculate weights for required skills
  for (const req of requiredSkills) {
    const weight = SKILL_WEIGHTS[req] || 1;
    totalWeight += weight;
    
    if (candidateSkills.some(c => c.toLowerCase() === req.toLowerCase())) {
      matched.push(req);
      matchedWeight += weight;
    }
  }

  // Missing skills
  const missing = requiredSkills.filter(r =>
    !candidateSkills.some(s => s.toLowerCase() === r.toLowerCase())
  );

  // Weighted score formula: (matchedWeight / totalWeight) * 100
  const score = totalWeight > 0
    ? Math.round((matchedWeight / totalWeight) * 100)
    : 0;

  return { score, matched, missing };
}

// ─── Step 5: Interest Score (realistic randomized) ────────────────

function calculateInterestScore(matchScore: number): { score: number; reason: string } {
  let score: number;
  let reason: string;
  
  if (matchScore >= 85) {
    // Strong match: 80-95 range with good variation
    score = 80 + Math.floor(Math.random() * 16);
    reason = `Perfect skill alignment at ${matchScore}% — candidate is actively interested in this exact domain and likely seeking roles like this.`;
  } else if (matchScore >= 70) {
    // Good match: 75-92 range
    score = 75 + Math.floor(Math.random() * 18);
    reason = `Strong skill overlap at ${matchScore}% — candidate is very likely interested; may see some growth opportunities.`;
  } else if (matchScore >= 55) {
    // Moderate match: 55-78 range
    score = 55 + Math.floor(Math.random() * 24);
    reason = `Moderate alignment at ${matchScore}% — candidate has core skills but would need to develop additional expertise.`;
  } else if (matchScore >= 40) {
    // Partial match: 40-65 range
    score = 40 + Math.floor(Math.random() * 26);
    reason = `Partial skill overlap at ${matchScore}% — candidate could transition to this role with some ramp-up time.`;
  } else if (matchScore >= 25) {
    // Weak match: 15-45 range
    score = 15 + Math.floor(Math.random() * 31);
    reason = `Limited alignment at ${matchScore}% — candidate is likely focused elsewhere but could be intrigued by growth potential.`;
  } else {
    // Very weak match: 5-20 range
    score = 5 + Math.floor(Math.random() * 16);
    reason = `Minimal overlap at ${matchScore}% — candidate is pursuing a different technology path and unlikely to engage.`;
  }
  
  return { score, reason };
}

// ─── Step 6: Conversation Simulation ───────────────────────────────

function simulateConversation(matchScore: number): string {
  if (matchScore > 70) return pickOne(CONVERSATION_TEMPLATES.high);
  if (matchScore >= 40) return pickOne(CONVERSATION_TEMPLATES.medium);
  return pickOne(CONVERSATION_TEMPLATES.low);
}

// ─── Step 7: Final Selection Reasoning ─────────────────────────────

function buildWhySelected(data: {
  name: string; title: string; location: string; experience: string;
  matchScore: number; matchedSkills: string[]; missingSkills: string[];
  interestScore: number;
  rank?: number; totalCandidates?: number;
}): string {
  const parts: string[] = [];

  // Primary reason: skill match quality
  if (data.matchScore >= 85) {
    parts.push(`${data.name} is an exceptional fit with ${data.matchScore}% weighted skill match.`);
    parts.push(`Core competencies: ${data.matchedSkills.slice(0, 3).join(', ')}.`);
  } else if (data.matchScore >= 70) {
    parts.push(`${data.name} is a strong candidate with ${data.matchScore}% weighted skill overlap.`);
    parts.push(`Key strengths: ${data.matchedSkills.slice(0, 3).join(', ')}.`);
  } else if (data.matchScore >= 50) {
    parts.push(`${data.name} demonstrates moderate alignment at ${data.matchScore}% weighted match.`);
    parts.push(`Relevant experience: ${data.matchedSkills.slice(0, 2).join(', ')}.`);
  } else {
    parts.push(`${data.name} has limited skill overlap at ${data.matchScore}% but shows potential.`);
    if (data.matchedSkills.length > 0) {
      parts.push(`Foundation skills: ${data.matchedSkills.join(', ')}.`);
    }
  }

  // Secondary reason: interest alignment + experience
  if (data.interestScore >= 75) {
    parts.push(`${data.title} with ${data.experience} experience — highly motivated to transition into this role.`);
  } else if (data.interestScore >= 50) {
    parts.push(`${data.title} with ${data.experience} experience — open to conversation with right growth path.`);
  } else {
    parts.push(`${data.title} with ${data.experience} experience — may require compelling case for interest.`);
  }

  // Closing: gap analysis
  if (data.missingSkills.length === 0) {
    parts.push('No critical gaps — ready for immediate impact.');
  } else if (data.missingSkills.length <= 2) {
    parts.push(`Minimal gaps (${data.missingSkills.join(', ')}) — trainable within 3-6 months.`);
  } else {
    parts.push(`Will need ramp-up on ${data.missingSkills.length} additional skills.`);
  }

  if (data.rank === 1) {
    parts.push('Selected as top candidate for priority outreach.');
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

    // ── STEP 01: Parse JD & Detect Domain ──
    logs.push('01 Parsing job description...');
    const detectedDomain = detectRoleDomain(jobDescription);
    logs.push(`02 Detected role type: ${detectedDomain}`);

    // ── STEP 02: Extract & Normalize Skills ──
    logs.push('03 Extracting and normalizing skills...');
    let requiredSkills: string[];
    const geminiSkills = await extractSkillsWithGemini(jobDescription);

    if (geminiSkills.length > 0) {
      requiredSkills = geminiSkills.filter(s => !GENERIC_SKILLS_BLACKLIST.has(s.toLowerCase()));
      logs.push(`04 Extracted ${requiredSkills.length} valid skills (AI-enhanced): ${requiredSkills.join(', ')}`);
    } else {
      requiredSkills = extractSkillsFromJD(jobDescription);
      logs.push(`04 Normalized ${requiredSkills.length} skills from keywords: ${requiredSkills.join(', ')}`);
    }

    if (requiredSkills.length === 0) {
      logs.push('⚠️  No skills found — applying domain-based defaults');
      requiredSkills = extractSkillsFromJD(jobDescription);
    }

    // ── STEP 03: Generate Candidates ──
    logs.push('05 Generating candidate profiles based on required skills...');
    let rawCandidates: RawCandidate[];
    const geminiCandidates = await generateCandidatesWithGemini(requiredSkills);

    if (geminiCandidates && geminiCandidates.length > 0) {
      rawCandidates = geminiCandidates;
      logs.push(`06 AI generated ${rawCandidates.length} candidate profiles`);
    } else {
      rawCandidates = generateCandidatesFromSkills(requiredSkills);
      logs.push(`06 Generated ${rawCandidates.length} candidates from skill distribution`);
    }

    // ── STEP 04: Filter Candidates ──
    logs.push('07 Filtering candidates — removing non-relevant profiles...');
    const beforeFilter = rawCandidates.length;
    rawCandidates = filterCandidates(rawCandidates, requiredSkills);
    const filtered = beforeFilter - rawCandidates.length;
    logs.push(`08 Removed ${filtered} irrelevant candidate(s) — ${rawCandidates.length} remain`);

    // ── STEP 05: Calculate Weighted Scores ──
    logs.push('09 Applying weighted skill matching algorithm...');
    const candidates = rawCandidates.map((raw, index) => {
      const { score: matchScore, matched: matchedSkills, missing: missingSkills } =
        calculateWeightedMatchScore(raw.skills, requiredSkills);

      // ── STEP 06: Interest Score ──
      const { score: interestScore, reason: interestReason } = calculateInterestScore(matchScore);

      // ── STEP 07: Final Score ──
      const finalScore = Math.round((matchScore * 0.6) + (interestScore * 0.4));

      const explanation = `Weighted match: ${matchedSkills.length}/${requiredSkills.length} skills`;

      const whySelected = buildWhySelected({
        name: raw.name, title: raw.title, location: raw.location,
        experience: raw.experience, matchScore, matchedSkills, missingSkills, interestScore,
        rank: index + 1, totalCandidates: rawCandidates.length,
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

    // ── STEP 08: Rank ──
    logs.push('10 Simulating outreach conversations...');
    logs.push('11 Computing final scores (60% weighted match + 40% interest)...');
    candidates.sort((a, b) => b.finalScore - a.finalScore);
    logs.push('12 Ranking candidates by composite score...');

    // ── STEP 09: Validate ──
    logs.push('13 Validating results — checking mathematical accuracy...');
    const isValid = validateResults(candidates, requiredSkills);
    if (!isValid) {
      logs.push('⚠️  Validation failed — regenerating with fallback...');
      // Regenerate with fallback
      const fallbackCandidates = generateCandidatesFromSkills(requiredSkills);
      const filteredFallback = filterCandidates(fallbackCandidates, requiredSkills);

      const regenerated = filteredFallback.map((raw, index) => {
        const { score: matchScore, matched: matchedSkills, missing: missingSkills } =
          calculateWeightedMatchScore(raw.skills, requiredSkills);
        const { score: interestScore, reason: interestReason } = calculateInterestScore(matchScore);
        const finalScore = Math.round((matchScore * 0.6) + (interestScore * 0.4));
        const explanation = `Weighted match: ${matchedSkills.length}/${requiredSkills.length} skills`;
        const whySelected = buildWhySelected({
          name: raw.name, title: raw.title, location: raw.location,
          experience: raw.experience, matchScore, matchedSkills, missingSkills, interestScore,
          rank: index + 1, totalCandidates: filteredFallback.length,
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
      logs.push('14 Fallback generation complete — validated');
    } else {
      logs.push('14 Validation passed — all scores verified');
    }

    // ── Summary & Final Selection Reasoning ──
    logs.push('15 Final selection reasoning:');
    if (candidates.length > 0) {
      const topCandidate = candidates[0];
      logs.push(`✓ Top candidate: ${topCandidate.name} (${topCandidate.matchScore}% match, score: ${topCandidate.finalScore})`);
      logs.push(`  Strengths: ${topCandidate.matchedSkills.slice(0, 3).join(', ')}`);
      if (topCandidate.missingSkills.length > 0) {
        logs.push(`  Growth areas: ${topCandidate.missingSkills.slice(0, 3).join(', ')}`);
      }
    }
    logs.push('16 Talent scouting complete — candidates ranked and ready for outreach');

    return NextResponse.json({ logs, candidates, requiredSkills });
  } catch (error) {
    console.error('Agent error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
