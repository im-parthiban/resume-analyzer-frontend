import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, CalendarDays, FileText, Plus, Trophy } from 'lucide-react'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { getScoreStyle } from '../utils/scoreStyle'

function formatDate(value) {
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  )
}

function AnalysisCard({ analysis }) {
  const style = getScoreStyle(analysis.matchScore)

  return (
    <Link
      to={`/analyses/${analysis.id}`}
      className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-slate-900">{analysis.jobTitle}</h3>
          <p className="truncate text-sm text-slate-500">
            {analysis.companyName || 'No company added'}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${style.badge}`}>
          {analysis.matchScore}%
        </span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${style.bar}`}
          style={{ width: `${analysis.matchScore}%` }}
        />
      </div>

      <p className="mt-3 text-sm text-slate-600">
        {analysis.matchedSkills.length} of {analysis.requiredSkillCount} skills matched
      </p>

      <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
        <span className="flex min-w-0 items-center gap-1">
          <FileText className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{analysis.resumeFileName}</span>
        </span>
        <span className="flex shrink-0 items-center gap-1">
          <CalendarDays className="h-3.5 w-3.5" />
          {formatDate(analysis.createdAt)}
        </span>
      </div>
    </Link>
  )
}

function LoadingCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((n) => (
        <div key={n} className="h-44 animate-pulse rounded-2xl bg-slate-200" />
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
        <FileText className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">No analyses yet</h3>
      <p className="mx-auto mt-1 max-w-sm text-slate-500">
        Upload your resume and paste a job description to see how well you match.
      </p>
      <Link
        to="/analyze"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-700"
      >
        <Plus className="h-4 w-4" />
        Start your first analysis
      </Link>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    api
      .get('/analyses')
      .then((response) => {
        if (!cancelled) setAnalyses(response.data)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load your analyses. Is the backend running?')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const total = analyses.length
  const average = total
    ? Math.round(analyses.reduce((sum, a) => sum + a.matchScore, 0) / total)
    : 0
  const best = total ? Math.max(...analyses.map((a) => a.matchScore)) : 0

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
          Hello, {user?.name}
        </h1>
        <p className="mt-1 text-slate-500">Here is how your resume has matched so far.</p>

        {error && (
          <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {!error && total > 0 && (
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <StatCard icon={BarChart3} label="Analyses" value={total} />
            <StatCard icon={Trophy} label="Best score" value={`${best}%`} />
            <StatCard icon={BarChart3} label="Average score" value={`${average}%`} />
          </div>
        )}

        <h2 className="mb-4 mt-10 text-lg font-semibold text-slate-900">Your analyses</h2>

        {loading && <LoadingCards />}
        {!loading && !error && total === 0 && <EmptyState />}
        {!loading && total > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {analyses.map((analysis) => (
              <AnalysisCard key={analysis.id} analysis={analysis} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}