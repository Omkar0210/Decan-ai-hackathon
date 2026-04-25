'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Search, Bot, Trophy, User, Sparkles, Loader as Loader2, Terminal, ChartBar as BarChart3, MessageSquare, CircleCheck as CheckCircle2, Circle as XCircle, Lightbulb, MapPin, Briefcase, Globe } from 'lucide-react';

interface Candidate {
  name: string;
  skills: string[];
  experience: string;
  title: string;
  location: string;
  summary: string;
  matchScore: number;
  interestScore: number;
  finalScore: number;
  explanation: string;
  whySelected: string;
  interestReason: string;
  matchedSkills: string[];
  missingSkills: string[];
  conversation: string[];
}

export default function Home() {
  const [jobDescription, setJobDescription] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleRunAgent = async () => {
    console.log('Button clicked');
    if (!jobDescription.trim()) return;

    setLoading(true);
    setLogs([]);
    setCandidates([]);
    setRequiredSkills([]);

    setLogs(prev => [...prev, 'Starting AI Talent Scouting Agent...']);

    try {
      console.log('Calling API /api/run-agent');
      const res = await fetch('/api/run-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription }),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();
      console.log('Received response', data);

      for (let i = 0; i < data.logs.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 350));
        setLogs(prev => [...prev, data.logs[i]]);
      }

      await new Promise(resolve => setTimeout(resolve, 300));
      setCandidates(data.candidates);
      setRequiredSkills(data.requiredSkills || []);
      setLogs(prev => [...prev, 'Displaying ranked candidates...']);
    } catch (err) {
      console.error('Error:', err);
      setLogs(prev => [...prev, `Error: ${err instanceof Error ? err.message : 'Unknown error'}`]);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-emerald-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return 'bg-emerald-50 border-emerald-200';
    if (score >= 40) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  const getScoreBar = (score: number) => {
    if (score >= 70) return 'bg-emerald-500';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-red-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900 leading-tight">AI Talent Scouting Agent</h1>
            <p className="text-xs text-slate-500">JD-driven candidate sourcing, scoring & engagement</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-400">
            <Globe className="h-3.5 w-3.5" />
            <span>Global Talent Pool</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Input + Logs */}
          <div className="lg:col-span-5 space-y-6">
            {/* Job Description Input */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  Job Description
                </CardTitle>
                <CardDescription className="text-xs">
                  Paste a job description and the agent will extract skills, generate relevant candidates, filter, score, and rank them
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="e.g. We are looking for a Senior Backend Engineer with experience in Java, Spring Boot, REST API design, and PostgreSQL. Experience with Docker and AWS is a plus..."
                  className="min-h-[160px] text-sm resize-none focus-visible:ring-blue-600"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
                <Button
                  onClick={handleRunAgent}
                  disabled={loading || !jobDescription.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition-all duration-200 h-11 text-sm font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Running Agent...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Run Talent Scouting Agent
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Extracted Skills */}
            {requiredSkills.length > 0 && (
              <Card className="border-blue-200 bg-blue-50/30 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-blue-800">
                    <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                    Extracted Required Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    {requiredSkills.map(skill => (
                      <Badge key={skill} className="bg-blue-600 text-white hover:bg-blue-700 text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Agent Logs */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-slate-600" />
                  Agent Logs
                </CardTitle>
                <CardDescription className="text-xs">
                  Pipeline: Parse &rarr; Extract &rarr; Generate &rarr; Filter &rarr; Score &rarr; Rank &rarr; Validate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900 rounded-lg p-4 min-h-[240px] max-h-[400px] overflow-y-auto font-mono text-xs">
                  {logs.length === 0 ? (
                    <div className="text-slate-500 flex items-center gap-2">
                      <span className="animate-pulse">&#9679;</span> Waiting for agent to start...
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {logs.map((log, i) => (
                        <div key={i} className="flex items-start gap-2 text-slate-300 animate-in fade-in-0 duration-300">
                          <span className="text-slate-600 select-none shrink-0">{String(i + 1).padStart(2, '0')}</span>
                          <span className="break-all">{log}</span>
                        </div>
                      ))}
                      {loading && (
                        <div className="text-emerald-400 flex items-center gap-2 mt-2">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span>Processing...</span>
                        </div>
                      )}
                    </div>
                  )}
                  <div ref={logsEndRef} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7 space-y-6">
            {candidates.length > 0 && (
              <>
                {/* Top Candidate Highlight */}
                <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2 text-emerald-800">
                        <Trophy className="h-4 w-4 text-emerald-600" />
                        Top Candidate
                      </CardTitle>
                      <Badge className="bg-emerald-600 text-white hover:bg-emerald-700">
                        Score: {candidates[0].finalScore}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-4">
                      <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 border-2 border-emerald-200">
                        <User className="h-7 w-7 text-emerald-700" />
                      </div>
                      <div className="space-y-3 flex-1 min-w-0">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{candidates[0].name}</h3>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{candidates[0].title}</span>
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{candidates[0].location}</span>
                            <span>{candidates[0].experience}</span>
                          </div>
                        </div>

                        {/* Professional Summary */}
                        {candidates[0].summary && (
                          <p className="text-sm text-slate-600 leading-relaxed">{candidates[0].summary}</p>
                        )}

                        {/* Matched vs Missing Skills */}
                        <div className="space-y-2">
                          <div>
                            <span className="text-xs font-medium text-emerald-700 flex items-center gap-1 mb-1">
                              <CheckCircle2 className="h-3 w-3" /> Matched Skills
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {candidates[0].matchedSkills.map(skill => (
                                <Badge key={skill} className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs hover:bg-emerald-100">
                                  {skill}
                                </Badge>
                              ))}
                              {candidates[0].matchedSkills.length === 0 && (
                                <span className="text-xs text-slate-400">None matched</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-red-600 flex items-center gap-1 mb-1">
                              <XCircle className="h-3 w-3" /> Missing Skills
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {candidates[0].missingSkills.map(skill => (
                                <Badge key={skill} variant="outline" className="border-red-200 text-red-600 text-xs hover:bg-red-50">
                                  {skill}
                                </Badge>
                              ))}
                              {candidates[0].missingSkills.length === 0 && (
                                <span className="text-xs text-slate-400">No gaps</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Why Selected */}
                        <div className="bg-white/80 rounded-md p-3 border border-emerald-100">
                          <div className="flex items-start gap-2">
                            <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-medium text-slate-700 mb-0.5">Why this candidate was selected</p>
                              <p className="text-sm text-slate-600">{candidates[0].whySelected}</p>
                            </div>
                          </div>
                        </div>

                        {/* Interest Reason */}
                        <div className="bg-white/80 rounded-md p-3 border border-emerald-100">
                          <div className="flex items-start gap-2">
                            <MessageSquare className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-medium text-slate-700 mb-0.5">Interest assessment</p>
                              <p className="text-sm text-slate-600">{candidates[0].interestReason}</p>
                            </div>
                          </div>
                        </div>

                        {/* Conversation */}
                        <div className="bg-white/80 rounded-md p-3 border border-emerald-100 text-sm text-slate-700 italic">
                          &ldquo;{candidates[0].conversation[0]}&rdquo;
                        </div>

                        {/* Score Bars */}
                        <div className="grid grid-cols-3 gap-3 pt-1">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-slate-500">Match</span>
                              <span className={`text-xs font-bold ${getScoreColor(candidates[0].matchScore)}`}>
                                {candidates[0].matchScore}%
                              </span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-500 ${getScoreBar(candidates[0].matchScore)}`} style={{ width: `${candidates[0].matchScore}%` }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-slate-500">Interest</span>
                              <span className={`text-xs font-bold ${getScoreColor(candidates[0].interestScore)}`}>
                                {candidates[0].interestScore}%
                              </span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-500 ${getScoreBar(candidates[0].interestScore)}`} style={{ width: `${candidates[0].interestScore}%` }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-slate-500">Final</span>
                              <span className={`text-xs font-bold ${getScoreColor(candidates[0].finalScore)}`}>
                                {candidates[0].finalScore}
                              </span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-500 ${getScoreBar(candidates[0].finalScore)}`} style={{ width: `${candidates[0].finalScore}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* All Candidates Table */}
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-slate-600" />
                      All Candidates
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Filtered, scored, and ranked by final score (60% match + 40% interest)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-left">
                            <th className="pb-3 pr-2 font-medium text-slate-500 text-xs uppercase tracking-wider">Rank</th>
                            <th className="pb-3 pr-2 font-medium text-slate-500 text-xs uppercase tracking-wider">Candidate</th>
                            <th className="pb-3 pr-2 font-medium text-slate-500 text-xs uppercase tracking-wider">Location</th>
                            <th className="pb-3 pr-2 font-medium text-slate-500 text-xs uppercase tracking-wider">Skills</th>
                            <th className="pb-3 pr-2 font-medium text-slate-500 text-xs uppercase tracking-wider text-center">Match</th>
                            <th className="pb-3 pr-2 font-medium text-slate-500 text-xs uppercase tracking-wider text-center">Interest</th>
                            <th className="pb-3 font-medium text-slate-500 text-xs uppercase tracking-wider text-center">Final</th>
                          </tr>
                        </thead>
                        <tbody>
                          {candidates.map((c, i) => (
                            <tr
                              key={c.name}
                              className={`border-b last:border-0 transition-colors hover:bg-slate-50 ${i === 0 ? 'bg-emerald-50/50' : ''}`}
                            >
                              <td className="py-3 pr-2">
                                <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold ${i === 0 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                  {i + 1}
                                </span>
                              </td>
                              <td className="py-3 pr-2">
                                <div>
                                  <p className="font-medium text-slate-900 text-sm">{c.name}</p>
                                  <p className="text-[10px] text-slate-400">{c.title} &middot; {c.experience}</p>
                                </div>
                              </td>
                              <td className="py-3 pr-2">
                                <span className="text-xs text-slate-500 flex items-center gap-1 whitespace-nowrap">
                                  <MapPin className="h-2.5 w-2.5" />{c.location}
                                </span>
                              </td>
                              <td className="py-3 pr-2">
                                <div className="flex flex-wrap gap-0.5 max-w-[180px]">
                                  {c.skills.slice(0, 3).map(skill => {
                                    const isMatched = c.matchedSkills.some(m => m.toLowerCase() === skill.toLowerCase());
                                    return (
                                      <Badge key={skill} variant="outline" className={`text-[10px] px-1.5 py-0 ${isMatched ? 'border-emerald-300 text-emerald-700 bg-emerald-50' : 'border-slate-200 text-slate-500'}`}>
                                        {skill}
                                      </Badge>
                                    );
                                  })}
                                  {c.skills.length > 3 && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-slate-200 text-slate-400">
                                      +{c.skills.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 pr-2 text-center">
                                <span className={`font-semibold ${getScoreColor(c.matchScore)}`}>
                                  {c.matchScore}%
                                </span>
                              </td>
                              <td className="py-3 pr-2 text-center">
                                <span className={`font-semibold ${getScoreColor(c.interestScore)}`}>
                                  {c.interestScore}%
                                </span>
                              </td>
                              <td className="py-3 text-center">
                                <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold border ${getScoreBg(c.finalScore)} ${getScoreColor(c.finalScore)}`}>
                                  {c.finalScore}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Candidate Details with Why Selected */}
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-slate-600" />
                      Detailed Candidate Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {candidates.map((c, i) => (
                      <div key={c.name} className={`rounded-lg border p-4 ${i === 0 ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-100 bg-white'}`}>
                        <div className="flex gap-3">
                          <div className={`h-11 w-11 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${i === 0 ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-200' : 'bg-slate-100 text-slate-600'}`}>
                            {c.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0 space-y-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-sm text-slate-900">{c.name}</span>
                                <Badge variant="outline" className="text-[10px]">{c.title}</Badge>
                                <span className={`text-xs px-1.5 py-0.5 rounded ${getScoreBg(c.finalScore)} ${getScoreColor(c.finalScore)}`}>
                                  {c.finalScore}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 mt-0.5 text-[11px] text-slate-400">
                                <span className="flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{c.location}</span>
                                <span>{c.experience}</span>
                              </div>
                            </div>

                            {/* Professional Summary */}
                            {c.summary && (
                              <p className="text-xs text-slate-600 leading-relaxed">{c.summary}</p>
                            )}

                            {/* Skills breakdown */}
                            <div className="flex flex-wrap gap-1">
                              {c.skills.map(skill => {
                                const isMatched = c.matchedSkills.some(m => m.toLowerCase() === skill.toLowerCase());
                                return (
                                  <Badge
                                    key={skill}
                                    variant="outline"
                                    className={`text-[10px] px-1.5 py-0 ${
                                      isMatched
                                        ? 'border-emerald-300 text-emerald-700 bg-emerald-50'
                                        : 'border-slate-200 text-slate-500'
                                    }`}
                                  >
                                    {isMatched && <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />}
                                    {skill}
                                  </Badge>
                                );
                              })}
                            </div>

                            {/* Why Selected */}
                            <div className="flex items-start gap-2 bg-slate-50 rounded-md p-2.5 border border-slate-100">
                              <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-[10px] font-medium text-slate-500 mb-0.5">Why selected</p>
                                <p className="text-xs text-slate-600 leading-relaxed">{c.whySelected}</p>
                              </div>
                            </div>

                            {/* Interest Reason */}
                            <div className="flex items-start gap-2 bg-slate-50 rounded-md p-2.5 border border-slate-100">
                              <MessageSquare className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-[10px] font-medium text-slate-500 mb-0.5">Interest reasoning</p>
                                <p className="text-xs text-slate-600 leading-relaxed">{c.interestReason}</p>
                              </div>
                            </div>

                            {/* Conversation */}
                            <p className="text-xs text-slate-500 bg-slate-50 rounded-md p-2.5 border border-slate-100 italic">
                              &ldquo;{c.conversation[0]}&rdquo;
                            </p>

                            <p className="text-[10px] text-slate-400">{c.explanation}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </>
            )}

            {candidates.length === 0 && !loading && (
              <Card className="border-dashed border-slate-300 bg-slate-50/50">
                <CardContent className="py-16 text-center">
                  <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Globe className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-base font-medium text-slate-700 mb-1">No candidates yet</h3>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto">
                    Enter a job description and the agent will extract skills, generate relevant candidates, and rank them
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
