import { useState, useEffect } from 'react'
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { api } from '../lib/api'
import { Card, Table, errText } from './adminKit'

const LESSON_KINDS = { video: 'Video', text: 'Reading', file: 'File' }

// Module form
function ModuleForm({ module, courseId, onSaved, onCancel }) {
  const [f, setF] = useState({ title: module?.title || '', order: module?.order || 0 })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function save(e) {
    e.preventDefault()
    setBusy(true)
    setErr('')
    try {
      await api(module?.id ? `/admin/modules/${module.id}/` : '/admin/modules/', {
        method: module?.id ? 'PATCH' : 'POST',
        body: { ...f, course: courseId, order: Number(f.order) }
      })
      onSaved()
    } catch (x) {
      setErr(errText(x))
      setBusy(false)
    }
  }

  return (
    <form onSubmit={save} className="grid gap-4 border-b border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-2">
      <label className="block text-sm font-medium">Module title
        <input required className="input mt-1" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
      </label>
      <label className="block text-sm font-medium">Order
        <input type="number" className="input mt-1" value={f.order} onChange={(e) => setF({ ...f, order: e.target.value })} />
      </label>
      {err && <p className="text-sm text-red-600 sm:col-span-2">{err}</p>}
      <div className="flex gap-3 sm:col-span-2">
        <button disabled={busy} className="btn-dark !py-2">{busy ? 'Saving…' : 'Save module'}</button>
        <button type="button" onClick={onCancel} className="btn-light !py-2">Cancel</button>
      </div>
    </form>
  )
}

// Lesson form
function LessonForm({ lesson, moduleId, onSaved, onCancel }) {
  const [f, setF] = useState({
    title: lesson?.title || '',
    kind: lesson?.kind || 'text',
    video_url: lesson?.video_url || '',
    body: lesson?.body || '',
    file_url: lesson?.file_url || '',
    order: lesson?.order || 0
  })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function save(e) {
    e.preventDefault()
    setBusy(true)
    setErr('')
    try {
      await api(lesson?.id ? `/admin/lessons/${lesson.id}/` : '/admin/lessons/', {
        method: lesson?.id ? 'PATCH' : 'POST',
        body: { ...f, module: moduleId, order: Number(f.order) }
      })
      onSaved()
    } catch (x) {
      setErr(errText(x))
      setBusy(false)
    }
  }

  return (
    <form onSubmit={save} className="grid gap-4 border-b border-zinc-200 bg-zinc-50 p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">Lesson title
          <input required className="input mt-1" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
        </label>
        <label className="block text-sm font-medium">Kind
          <select className="input mt-1" value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}>
            {Object.entries(LESSON_KINDS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <label className="block text-sm font-medium">Order
          <input type="number" className="input mt-1" value={f.order} onChange={(e) => setF({ ...f, order: e.target.value })} />
        </label>
        {f.kind === 'video' && (
          <label className="block text-sm font-medium">Video URL
            <input className="input mt-1" value={f.video_url} onChange={(e) => setF({ ...f, video_url: e.target.value })} />
          </label>
        )}
        {f.kind === 'file' && (
          <label className="block text-sm font-medium">File URL
            <input className="input mt-1" value={f.file_url} onChange={(e) => setF({ ...f, file_url: e.target.value })} />
          </label>
        )}
      </div>
      <label className="block text-sm font-medium">Body (text content)
        <textarea rows={4} className="input mt-1" value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} />
      </label>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <div className="flex gap-3">
        <button disabled={busy} className="btn-dark !py-2">{busy ? 'Saving…' : 'Save lesson'}</button>
        <button type="button" onClick={onCancel} className="btn-light !py-2">Cancel</button>
      </div>
    </form>
  )
}

// Question form
function QuestionForm({ question, courseId, onSaved, onCancel }) {
  const [f, setF] = useState({
    text: question?.text || '',
    options: question?.options || ['', ''],
    correct: question?.correct || 0,
    order: question?.order || 0
  })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const addOption = () => setF({ ...f, options: [...f.options, ''] })
  const removeOption = (i) => setF({ ...f, options: f.options.filter((_, n) => n !== i) })
  const updateOption = (i, val) => setF({ ...f, options: f.options.map((x, n) => n === i ? val : x) })

  async function save(e) {
    e.preventDefault()
    setBusy(true)
    setErr('')
    try {
      await api(question?.id ? `/admin/questions/${question.id}/` : '/admin/questions/', {
        method: question?.id ? 'PATCH' : 'POST',
        body: { ...f, course: courseId, order: Number(f.order) }
      })
      onSaved()
    } catch (x) {
      setErr(errText(x))
      setBusy(false)
    }
  }

  return (
    <form onSubmit={save} className="grid gap-4 border-b border-zinc-200 bg-zinc-50 p-4">
      <label className="block text-sm font-medium">Question text
        <input required className="input mt-1" value={f.text} onChange={(e) => setF({ ...f, text: e.target.value })} />
      </label>
      <div className="space-y-2">
        <p className="text-sm font-medium">Options (2-6)</p>
        {f.options.map((opt, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              type="radio"
              name={`correct-${question?.id || 'new'}`}
              checked={f.correct === i}
              onChange={() => setF({ ...f, correct: i })}
              className="h-4 w-4"
            />
            <input
              className="input flex-1"
              value={opt}
              onChange={(e) => updateOption(i, e.target.value)}
              placeholder={`Option ${i + 1}`}
            />
            {f.options.length > 2 && (
              <button type="button" onClick={() => removeOption(i)} className="text-red-600">
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
        {f.options.length < 6 && (
          <button type="button" onClick={addOption} className="text-sm font-semibold text-brand-grad">
            <Plus size={14} className="inline mr-1" />Add option
          </button>
        )}
      </div>
      <label className="block text-sm font-medium">Order
        <input type="number" className="input mt-1" value={f.order} onChange={(e) => setF({ ...f, order: e.target.value })} />
      </label>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <div className="flex gap-3">
        <button disabled={busy} className="btn-dark !py-2">{busy ? 'Saving…' : 'Save question'}</button>
        <button type="button" onClick={onCancel} className="btn-light !py-2">Cancel</button>
      </div>
    </form>
  )
}

// Module with lessons
function ModuleCard({ module, courseId, onRefresh }) {
  const [expanded, setExpanded] = useState(false)
  const [lessons, setLessons] = useState([])
  const [editLesson, setEditLesson] = useState(null)
  const [editModule, setEditModule] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (expanded) {
      api(`/admin/lessons/?course=${courseId}`).then((all) => {
        setLessons(all.filter((l) => l.module === module.id))
      })
    }
  }, [expanded, module.id, courseId])

  const delLesson = async (l) => {
    if (confirm(`Delete "${l.title}"?`)) {
      await api(`/admin/lessons/${l.id}/`, { method: 'DELETE' }).catch((e) => alert(e.message))
      setLessons(lessons.filter((x) => x.id !== l.id))
      onRefresh()
    }
  }

  const delModule = async () => {
    if (confirm(`Delete module "${module.title}" and all its lessons?`)) {
      await api(`/admin/modules/${module.id}/`, { method: 'DELETE' }).catch((e) => alert(e.message))
      onRefresh()
    }
  }

  return (
    <div className="border border-zinc-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between bg-zinc-50 px-4 py-3">
        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-2 font-semibold">
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          {module.title}
          <span className="text-xs text-zinc-500">(Order: {module.order})</span>
        </button>
        <div className="flex gap-2">
          <button onClick={() => setEditModule(module)} className="text-sm font-semibold underline">Edit</button>
          <button onClick={delModule} className="text-red-600"><Trash2 size={16} /></button>
        </div>
      </div>
      {editModule && <ModuleForm module={editModule} courseId={courseId} onCancel={() => setEditModule(null)} onSaved={() => { setEditModule(null); onRefresh() }} />}
      {expanded && (
        <div className="p-4 space-y-3">
          {lessons.map((l) => (
            <div key={l.id} className="flex items-center justify-between border border-zinc-200 rounded p-3">
              <div>
                <p className="font-medium">{l.title}</p>
                <p className="text-xs text-zinc-500">{LESSON_KINDS[l.kind]} · Order: {l.order}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditLesson(l)} className="text-sm font-semibold underline">Edit</button>
                <button onClick={() => delLesson(l)} className="text-red-600"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
          {editLesson && <LessonForm lesson={editLesson} moduleId={module.id} onCancel={() => setEditLesson(null)} onSaved={() => { setEditLesson(null); setLessons(lessons); onRefresh() }} />}
          <button onClick={() => setEditLesson({})} className="btn-light !py-2 text-sm">
            <Plus size={14} className="inline mr-1" />Add lesson
          </button>
        </div>
      )}
    </div>
  )
}

// Main content editor
export default function AdminContent() {
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [modules, setModules] = useState([])
  const [questions, setQuestions] = useState([])
  const [editModule, setEditModule] = useState(null)
  const [editQuestion, setEditQuestion] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api('/admin/courses/').then((data) => {
      const list = data.results || data
      setCourses(list)
      if (list.length > 0 && !selectedCourse) setSelectedCourse(list[0])
    })
  }, [])

  useEffect(() => {
    if (selectedCourse) {
      setLoading(true)
      Promise.all([
        api(`/admin/modules/?course=${selectedCourse.id}`),
        api(`/admin/questions/?course=${selectedCourse.id}`)
      ]).then(([mods, qs]) => {
        setModules(mods)
        setQuestions(qs)
        setLoading(false)
      }).catch(() => setLoading(false))
    }
  }, [selectedCourse])

  const delQuestion = async (q) => {
    if (confirm(`Delete question "${q.text}"?`)) {
      await api(`/admin/questions/${q.id}/`, { method: 'DELETE' }).catch((e) => alert(e.message))
      setQuestions(questions.filter((x) => x.id !== q.id))
    }
  }

  return (
    <div className="space-y-6">
      <Card title="Course Content">
        <div className="p-4">
          <label className="block text-sm font-medium mb-4">Select course
            <select
              className="input mt-1"
              value={selectedCourse?.id || ''}
              onChange={(e) => {
                const course = courses.find((c) => c.id === Number(e.target.value))
                setSelectedCourse(course)
              }}
            >
              {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
        </div>
      </Card>

      {selectedCourse && (
        <>
          <Card title="Modules" extra={<button onClick={() => setEditModule({})} className="btn-dark !px-4 !py-2"><Plus size={16} />New module</button>}>
            {editModule && <ModuleForm module={editModule} courseId={selectedCourse.id} onCancel={() => setEditModule(null)} onSaved={() => { setEditModule(null); setModules([...modules]); api(`/admin/modules/?course=${selectedCourse.id}`).then(setModules) }} />}
            <div className="p-4 space-y-3">
              {modules.map((m) => (
                <ModuleCard key={m.id} module={m} courseId={selectedCourse.id} onRefresh={() => api(`/admin/modules/?course=${selectedCourse.id}`).then(setModules)} />
              ))}
              {modules.length === 0 && !loading && <p className="text-zinc-500">No modules yet.</p>}
            </div>
          </Card>

          <Card title="Quiz Questions" extra={<button onClick={() => setEditQuestion({})} className="btn-dark !px-4 !py-2"><Plus size={16} />New question</button>}>
            {editQuestion && <QuestionForm question={editQuestion} courseId={selectedCourse.id} onCancel={() => setEditQuestion(null)} onSaved={() => { setEditQuestion(null); api(`/admin/questions/?course=${selectedCourse.id}`).then(setQuestions) }} />}
            <Table head={['Question', 'Options', 'Correct', 'Order', '']} loading={loading} empty={!loading && questions.length === 0}>
              {questions.map((q) => (
                <tr key={q.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3 font-medium">{q.text}</td>
                  <td className="px-4 py-3">{q.options.length} options</td>
                  <td className="px-4 py-3">{q.correct + 1}</td>
                  <td className="px-4 py-3">{q.order}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button onClick={() => setEditQuestion(q)} className="mr-3 text-sm font-semibold underline">Edit</button>
                    <button onClick={() => delQuestion(q)} className="text-red-600"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </Table>
          </Card>
        </>
      )}
    </div>
  )
}
