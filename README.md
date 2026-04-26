# AI-Powered Talent Scouting & Engagement Agent

An intelligent recruitment automation system that leverages multi-step AI agents to discover, evaluate, and rank candidates based on job requirements and demonstrated interest levels.

---

## Problem Statement

Recruiters face significant challenges in their talent acquisition workflow:
- **Manual candidate search** consumes hours scanning databases and resumes
- **Interest verification** requires individual follow-ups to gauge candidate availability
- **Skill matching** lacks standardized, objective evaluation criteria
- **Scale limitations** make it difficult to process large candidate pools efficiently

This project automates the entire recruitment discovery pipeline, enabling recruiters to focus on building relationships rather than administrative tasks.

---

## Solution Overview

Our AI-Powered Talent Scouting system transforms recruitment through an automated multi-step agent pipeline:

1. **Analyzes** the job description to extract key requirements
2. **Generates** realistic candidate profiles matching the role
3. **Evaluates** technical skill alignment with objective scoring
4. **Simulates** candidate interest through intelligent conversation
5. **Ranks** candidates by combined match and interest scores
6. **Produces** an explainable shortlist with decision reasoning

The system provides transparency at every step, allowing recruiters to understand exactly why candidates were recommended.

---

## Key Features

- **Multi-Step AI Agent Pipeline** - Coordinated agents handle parsing, generation, evaluation, and ranking
- **Dynamic Role-Based Skill Mapping** - Automatically extracts and maps relevant skills from job descriptions
- **Deterministic Match Scoring** - Objective, reproducible candidate evaluation (not random AI outputs)
- **Simulated Interest Assessment** - Models candidate responses to gauge engagement likelihood
- **Explainable Decision-Making** - Clear reasoning for every candidate ranking
- **Real-Time Agent Logs** - View the complete decision-making process in real-time
- **Ranked Candidate Output** - Final shortlist with scores, skills, and interest indicators

---

## Agent Architecture

The system operates through a structured 8-step pipeline:

### Step 1: Parse Job Description
Extract job title, required skills, experience level, and domain from the job posting

### Step 2: Extract Skills
Identify technical and soft skills needed for the role with priority weighting

### Step 3: Generate Candidates
Create realistic candidate profiles with varied skill sets and experience levels

### Step 4: Filter Candidates
Apply basic filtering to ensure candidates are within viable range for the role

### Step 5: Calculate Match Score
Compute technical skill alignment using deterministic scoring logic

### Step 6: Simulate Interest
Model candidate responses through multi-turn conversation simulation

### Step 7: Rank Candidates
Sort candidates by combined match and interest metrics

### Step 8: Final Decision
Generate explainable rankings with clear decision reasoning

---

## Scoring Logic

The system employs transparent, deterministic scoring:

### Match Score
```
Match Score = (Skills Matched / Total Required Skills) × 100
```

Calculates the percentage of job-required skills present in candidate profile.

### Interest Score
```
Interest Score = Average confidence level from simulated candidate responses
```

Based on candidate's expressed interest during multi-turn interaction simulation.

### Final Score
```
Final Score = (Match Score × 0.6) + (Interest Score × 0.4)
```

Weighted combination prioritizing technical fit (60%) while valuing engagement (40%).

---

## Tech Stack

- **Frontend**: React with Next.js (App Router)
- **Styling**: Tailwind CSS
- **Backend**: Node.js API routes
- **AI Integration**: Vercel AI SDK with LLM models
- **Architecture**: Multi-agent pipeline pattern

---

## Demo

- **Live Demo**: [Add your deployed URL here]
- **Demo Video**: [Add your video link here]

---

## How to Run Locally

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Omkar0210/Decan-ai-hackathon.git
   cd Decan-ai-hackathon
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Create a `.env.local` file with required API keys
   - Add your LLM provider credentials (if needed)

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   - Navigate to `http://localhost:3000`

---

## Sample Input

```
Job Description: "Seeking a Full Stack Developer with 5+ years experience in React and Node.js for a fast-paced fintech startup. Must have experience with microservices, PostgreSQL, and AWS. Leadership experience is a plus."
```

---

## Sample Output

### Extracted Skills
- React (primary)
- Node.js (primary)
- PostgreSQL (primary)
- AWS (primary)
- Microservices (secondary)
- Leadership (tertiary)

### Ranked Candidates

| Rank | Name | Match Score | Interest Score | Final Score |
|------|------|------------|----------------|------------|
| 1 | Alex Chen | 85% | 90% | 87% |
| 2 | Jordan Smith | 78% | 85% | 80.8% |
| 3 | Taylor Rodriguez | 72% | 88% | 78.4% |

Each candidate includes detailed skill breakdowns and interest reasoning.

---

## Why This Project Stands Out

- **Explainable AI** - Not a black box. Every decision is transparent and traceable
- **Realistic Scoring Logic** - Deterministic evaluation that mirrors real recruiter workflows
- **Simulated Recruiter Workflow** - Captures the complete end-to-end hiring conversation
- **Practical Real-World Use Case** - Directly addresses pain points in recruitment automation
- **Scalable Architecture** - Easily extends to real candidate databases and APIs
- **Production-Ready Patterns** - Multi-agent orchestration applicable to other domains

---

## Future Improvements

- **Real LinkedIn/API Integration** - Connect to live candidate databases
- **Real Candidate Database** - Replace simulation with actual candidate profiles
- **Advanced LLM-Based Reasoning** - Enhanced decision logic with few-shot learning
- **Candidate Feedback Loop** - Track which ranked candidates ultimately succeed
- **Custom Scoring Weights** - Allow recruiters to adjust match/interest balance
- **Multi-Role Pipeline** - Simultaneously evaluate candidates for multiple open positions

---

## Project Structure

- `/app` - Next.js application with UI and API routes
- `/pages/api` - Agent orchestration and scoring logic
- `/components` - Reusable React components for the interface
- `/lib` - Utility functions and agent helpers

---

## Contact & Support

For questions or feedback about this project, please reach out through the repository issues or contact the hackathon team.

---

**Built for the Decan AI Hackathon**
