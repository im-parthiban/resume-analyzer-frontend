import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  FileText,
  Lightbulb,
  MessageCircleQuestion,
  Plus,
  XCircle,
} from 'lucide-react'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import ScoreGauge from '../components/ScoreGauge'
import { getScoreStyle } from '../utils/scoreStyle'

function formatDate(value) {
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function SkillPills({ skills, tone, emptyText }) {
  if (skills.length === 0) {
    return <p className="text-sm text-slate-500">{emptyText}</p>
  }
  const toneClass =
    tone === 'good' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'

  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill) => (
        <span key={skill} className={`rounded-full px-3 py-1 text-sm font-medium ${toneClass}`}>
          {skill}
        </span>
      ))}
    </div>
  )
}

function Card({ icon: Icon, title, count, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
        <Icon className="h-5 w-5 text-indigo-600" />
        {title}
        {count !== undefined && (
          <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {count}
          </span>
        )}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function ResultSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="h-40 animate-pulse rounded-2xl bg-slate-200" />
        <div className="h-40 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    </div>
  )
}

export default function Result() {
  const { id } = useParams()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    api
      .get(`/analyses/${id}`)
      .then((response) => {
        if (!cancelled) setAnalysis(response.data)
      })
      .catch((err) => {
        if (cancelled) return
        setError(
          err.response?.status === 404
            ? 'This analysis was not found.'
            : 'Could not load this analysis. Is the backend running?'
        )
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  const questions = analysis?.interviewQuestions
    ? analysis.interviewQuestions.split('\n').filter((q) => q.trim())
    : []

  const style = analysis ? getScoreStyle(analysis.matchScore) : null

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        {loading && (
          <div className="mt-6">
            <ResultSkeleton />
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {analysis && (
          <div className="mt-6 space-y-6">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
                {analysis.jobTitle}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4" />
                  {analysis.companyName || 'No company added'}
                </span>
                <span className="flex min-w-0 items-center gap-1.5">
                  <FileText className="h-4 w-4 shrink-0" />
                  <span className="truncate">{analysis.resumeFileName}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4" />
                  {formatDate(analysis.createdAt)}
                </span>
              </div>
            </div>

            <section className="grid items-center gap-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2 md:p-8">
              <ScoreGauge score={analysis.matchScore} />

              <div className="text-center md:text-left">
                <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${style.badge}`}>
                  {style.label}
                </span>
                <h2 className="mt-3 text-2xl font-semibold text-slate-900">
                  {analysis.matchedSkills.length} of {analysis.requiredSkillCount} required skills
                  matched
                </h2>
                <p className="mt-2 text-slate-500">
                  The score is calculated from the skills this job asks for that also appear in your
                  resume. It does not use AI, so the same inputs always give the same score.
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-emerald-50 p-4">
                    <p className="text-2xl font-semibold text-emerald-700">
                      {analysis.matchedSkills.length}
                    </p>
                    <p className="text-sm text-emerald-700">Matched</p>
                  </div>
                  <div className="rounded-xl bg-amber-50 p-4">
                    <p className="text-2xl font-semibold text-amber-700">
                      {analysis.missingSkills.length}
                    </p>
                    <p className="text-sm text-amber-700">Missing</p>
                  </div>
                </div>
              </div>
            </section>

            <div className="grid gap-6 md:grid-cols-2">
              <Card icon={CheckCircle2} title="Matched skills" count={analysis.matchedSkills.length}>
                <SkillPills
                  skills={analysis.matchedSkills}
                  tone="good"
                  emptyText="None of the required skills were found in your resume."
                />
              </Card>

              <Card icon={XCircle} title="Missing skills" count={analysis.missingSkills.length}>
                <SkillPills
                  skills={analysis.missingSkills}
                  tone="warn"
                  emptyText="Great news. Your resume covers every skill this job lists."
                />
              </Card>
            </div>

            <Card icon={Lightbulb} title="Improvement suggestions">
              {analysis.aiFeedback ? (
                <p className="leading-relaxed text-slate-700">{analysis.aiFeedback}</p>
              ) : (
                <p className="text-sm text-slate-500">
                  Feedback is not available for this analysis. Your score and skills above are
                  still accurate.
                </p>
              )}
              <p className="mt-4 text-xs text-slate-400">
                Suggestions are guidance only and may not be perfect. Use your own judgement.
              </p>
            </Card>

            <Card icon={MessageCircleQuestion} title="Practice interview questions">
              {questions.length > 0 ? (
                <ol className="space-y-3">
                  {questions.map((question, index) => (
                    <li key={question} className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-600">
                        {index + 1}
                      </span>
                      <span className="text-slate-700">{question}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-slate-500">
                  No interview questions are available for this analysis.
                </p>
              )}
            </Card>

            <div className="flex justify-center pt-2">
              <Link
                to="/analyze"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white transition hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4" />
                Analyze another job
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}