import { FileSearch, Target, Sparkles, ShieldCheck } from 'lucide-react'

const features = [
  { icon: Target, text: 'Get an explainable match score for any job' },
  { icon: FileSearch, text: 'See matched and missing skills at a glance' },
  { icon: Sparkles, text: 'Receive tips and likely interview questions' },
  { icon: ShieldCheck, text: 'Your resumes stay private to your account' },
]

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="grid min-h-screen bg-slate-50 lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-indigo-600 p-12 text-white lg:flex">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <FileSearch className="h-6 w-6" />
          ResumeMatch
        </div>

        <div>
          <h2 className="text-4xl font-semibold leading-tight">
            Know how well your resume fits before you apply.
          </h2>
          <ul className="mt-10 space-y-5">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-indigo-100">
                <span className="mt-0.5 rounded-lg bg-white/15 p-2">
                  <Icon className="h-5 w-5 text-white" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-indigo-200">Built with React and Spring Boot</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 text-lg font-semibold text-indigo-600 lg:hidden">
            <FileSearch className="h-6 w-6" />
            ResumeMatch
          </div>

          <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
          <p className="mt-2 text-slate-500">{subtitle}</p>

          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  )
}