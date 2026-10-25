import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, FileText, Loader2, Sparkles, UploadCloud } from 'lucide-react'
import api from '../api/axios'
import Navbar from '../components/Navbar'

const MAX_SIZE = 5 * 1024 * 1024
const MAX_DESCRIPTION = 20000

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'

function uploadErrorMessage(err) {
  if (!err.response) return 'Cannot reach the server. Is the backend running?'
  switch (err.response.status) {
    case 413:
      return 'This file is too large. The limit is 5 MB.'
    case 415:
      return 'Only PDF and DOCX files are supported.'
    case 422:
      return 'No readable text was found. Scanned or password-protected files are not supported.'
    default:
      return 'Upload failed. Please try again.'
  }
}

function analyzeErrorMessage(err) {
  if (!err.response) return 'Cannot reach the server. Is the backend running?'
  switch (err.response.status) {
    case 400:
      return 'Please check the job title and description.'
    case 404:
      return 'That resume could not be found. Please select or upload one again.'
    case 422:
      return 'No known skills were found in this job description. Paste the full description, including the requirements.'
    default:
      return 'Analysis failed. Please try again.'
  }
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function Analyze() {
  const navigate = useNavigate()
  const fileInput = useRef(null)

  const [resumes, setResumes] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [loadingResumes, setLoadingResumes] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const [jobTitle, setJobTitle] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    api
      .get('/resumes')
      .then((response) => {
        if (cancelled) return
        setResumes(response.data)
        if (response.data.length > 0) setSelectedId(response.data[0].id)
      })
      .catch(() => {
        if (!cancelled) setUploadError('Could not load your resumes.')
      })
      .finally(() => {
        if (!cancelled) setLoadingResumes(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const uploadFile = async (file) => {
    if (!file) return
    setUploadError('')

    const name = file.name.toLowerCase()
    if (!name.endsWith('.pdf') && !name.endsWith('.docx')) {
      setUploadError('Only PDF and DOCX files are supported.')
      return
    }
    if (file.size > MAX_SIZE) {
      setUploadError('This file is too large. The limit is 5 MB.')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    setUploading(true)
    try {
      const response = await api.post('/resumes', formData)
      setResumes((current) => [response.data, ...current])
      setSelectedId(response.data.id)
    } catch (err) {
      setUploadError(uploadErrorMessage(err))
    } finally {
      setUploading(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    uploadFile(e.dataTransfer.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!selectedId) {
      setError('Please upload or select a resume first.')
      return
    }

    setSubmitting(true)
    try {
      const response = await api.post('/analyses', {
        resumeId: selectedId,
        jobTitle: jobTitle.trim(),
        companyName: companyName.trim(),
        descriptionText: description.trim(),
      })
      navigate(`/analyses/${response.data.id}`)
    } catch (err) {
      setError(analyzeErrorMessage(err))
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">New analysis</h1>
        <p className="mt-1 text-slate-500">
          Choose your resume, paste the job description, and see how well you match.
        </p>

        <form onSubmit={handleSubmit} className="mt-8">
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-sm text-white">
                  1
                </span>
                Your resume
              </h2>

              <div
                onClick={() => !uploading && fileInput.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragging(true)
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={`mt-5 flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition ${
                  dragging
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
                }`}
              >
                {uploading ? (
                  <Loader2 className="h-9 w-9 animate-spin text-indigo-600" />
                ) : (
                  <UploadCloud className="h-9 w-9 text-indigo-600" />
                )}
                <p className="mt-3 font-medium text-slate-800">
                  {uploading ? 'Reading your resume...' : 'Click to upload or drag a file here'}
                </p>
                <p className="mt-1 text-sm text-slate-500">PDF or DOCX, up to 5 MB</p>
                <input
                  ref={fileInput}
                  type="file"
                  accept=".pdf,.docx"
                  className="hidden"
                  onChange={(e) => uploadFile(e.target.files[0])}
                />
              </div>

              {uploadError && (
                <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  {uploadError}
                </div>
              )}

              <div className="mt-6">
                <p className="text-sm font-medium text-slate-700">
                  {resumes.length > 0 ? 'Or choose an uploaded resume' : 'Uploaded resumes'}
                </p>

                {loadingResumes && (
                  <div className="mt-3 h-14 animate-pulse rounded-lg bg-slate-100" />
                )}

                {!loadingResumes && resumes.length === 0 && (
                  <p className="mt-3 text-sm text-slate-500">
                    No resumes yet. Upload one above to get started.
                  </p>
                )}

                <ul className="mt-3 max-h-56 space-y-2 overflow-y-auto">
                  {resumes.map((resume) => {
                    const selected = resume.id === selectedId
                    return (
                      <li key={resume.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedId(resume.id)}
                          className={`flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition ${
                            selected
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <FileText
                            className={`h-5 w-5 shrink-0 ${selected ? 'text-indigo-600' : 'text-slate-400'}`}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-slate-800">
                              {resume.fileName}
                            </span>
                            <span className="block text-xs text-slate-500">
                              Uploaded {formatDate(resume.uploadedAt)}
                            </span>
                          </span>
                          {selected && <CheckCircle2 className="h-5 w-5 shrink-0 text-indigo-600" />}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-sm text-white">
                  2
                </span>
                Job details
              </h2>

              <div className="mt-5 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Job title
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={255}
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="Java Developer"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Company <span className="font-normal text-slate-400">(optional)</span>
                    </label>
                    <input
                      type="text"
                      maxLength={255}
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Company name"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Job description
                  </label>
                  <textarea
                    required
                    rows={10}
                    maxLength={MAX_DESCRIPTION}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Paste the full job description here, including the requirements and skills."
                    className={`${inputClass} resize-y`}
                  />
                  <p className="mt-1 text-right text-xs text-slate-400">
                    {description.length} / {MAX_DESCRIPTION}
                  </p>
                </div>
              </div>
            </section>
          </div>

          {error && (
            <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={submitting || uploading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60 sm:w-auto"
            >
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
              {submitting ? 'Analyzing...' : 'Analyze resume'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}