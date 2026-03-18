'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Step {
  label: string
  text?: string
  math?: string
  math2?: string
  math3?: string
  speech: string
  highlight?: boolean
  isAnswer?: boolean
  showElements?: string[]
}

interface DiagramConfig {
  type: 'atwood' | 'projectile' | 'pendulum' | 'lens' | 'circuit' | 'gauss' | 'none'
  params: Record<string, { label: string; min: number; max: number; step: number; value: number; unit: string }>
}

interface Topic {
  id: string
  title: string
  titleHi: string
  icon: string
  color: string
  exam: 'JEE Mains' | 'JEE Advanced' | 'NEET'
  subject: 'Physics' | 'Chemistry' | 'Mathematics'
  difficulty: 'Easy' | 'Medium' | 'Hard'
  chapter: string
  steps: Step[]
  diagram?: DiagramConfig
}

interface Parameter {
  key: string
  label: string
  min: number
  max: number
  step: number
  value: number
  unit: string
}

export default function AdminPanel() {
  const [questions, setQuestions] = useState<Topic[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<Partial<Topic>>({
    id: '',
    title: '',
    titleHi: '',
    icon: '⚡',
    color: '#3B82F6',
    exam: 'JEE Mains',
    subject: 'Physics',
    difficulty: 'Medium',
    chapter: '',
    steps: [],
    diagram: {
      type: 'none',
      params: {},
    },
  })

  const [parameters, setParameters] = useState<Parameter[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('jeetribe_custom_questions')
    if (stored) {
      try {
        const data = JSON.parse(stored)
        setQuestions(Array.isArray(data) ? data : [])
      } catch (e) {
        console.error('Failed to load questions:', e)
      }
    }
  }, [])

  useEffect(() => {
    if (selectedId) {
      const question = questions.find((q) => q.id === selectedId)
      if (question) {
        setFormData(question)
        const paramKeys = question.diagram?.params || {}
        setParameters(
          Object.entries(paramKeys).map(([key, val]) => ({
            key,
            label: val.label,
            min: val.min,
            max: val.max,
            step: val.step,
            value: val.value,
            unit: val.unit,
          }))
        )
      }
    } else {
      setFormData({
        id: '',
        title: '',
        titleHi: '',
        icon: '⚡',
        color: '#3B82F6',
        exam: 'JEE Mains',
        subject: 'Physics',
        difficulty: 'Medium',
        chapter: '',
        steps: [],
        diagram: {
          type: 'none',
          params: {},
        },
      })
      setParameters([])
    }
    setErrors({})
  }, [selectedId, questions])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title?.trim()) newErrors.title = 'Title is required'
    if (!formData.titleHi?.trim()) newErrors.titleHi = 'Hindi title is required'
    if (!formData.chapter?.trim()) newErrors.chapter = 'Chapter is required'
    if (!formData.steps || formData.steps.length === 0)
      newErrors.steps = 'At least one step is required'
    if (formData.steps?.some((s) => !s.label?.trim() || !s.speech?.trim())) {
      newErrors.steps = 'All steps must have a label and speech'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const saveQuestion = () => {
    if (!validateForm()) return

    const id = formData.id || `q_${Date.now()}`
    const paramsObj: Record<string, { label: string; min: number; max: number; step: number; value: number; unit: string }> = {}

    parameters.forEach((p) => {
      paramsObj[p.key] = {
        label: p.label,
        min: p.min,
        max: p.max,
        step: p.step,
        value: p.value,
        unit: p.unit,
      }
    })

    const newQuestion: Topic = {
      id,
      title: formData.title || '',
      titleHi: formData.titleHi || '',
      icon: formData.icon || '⚡',
      color: formData.color || '#3B82F6',
      exam: formData.exam || 'JEE Mains',
      subject: formData.subject || 'Physics',
      difficulty: formData.difficulty || 'Medium',
      chapter: formData.chapter || '',
      steps: formData.steps || [],
      diagram: {
        type: (formData.diagram?.type || 'none') as any,
        params: paramsObj,
      },
    }

    let updated = [...questions]
    const existingIndex = updated.findIndex((q) => q.id === id)

    if (existingIndex >= 0) {
      updated[existingIndex] = newQuestion
    } else {
      updated.push(newQuestion)
    }

    setQuestions(updated)
    localStorage.setItem('jeetribe_custom_questions', JSON.stringify(updated))
    setSelectedId(id)
    alert('Question saved successfully!')
  }

  const deleteQuestion = (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return
    const updated = questions.filter((q) => q.id !== id)
    setQuestions(updated)
    localStorage.setItem('jeetribe_custom_questions', JSON.stringify(updated))
    if (selectedId === id) setSelectedId(null)
  }

  const exportJSON = () => {
    if (!formData.id) {
      alert('Please save the question first')
      return
    }
    const question = questions.find((q) => q.id === formData.id)
    if (!question) return

    const json = JSON.stringify(question, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${question.title}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const importJSON = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e: any) => {
      const file = e.target.files[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event: any) => {
        try {
          const imported = JSON.parse(event.target.result) as Topic
          if (!imported.id) imported.id = `q_${Date.now()}`

          setFormData(imported)
          const paramKeys = imported.diagram?.params || {}
          setParameters(
            Object.entries(paramKeys).map(([key, val]) => ({
              key,
              label: val.label,
              min: val.min,
              max: val.max,
              step: val.step,
              value: val.value,
              unit: val.unit,
            }))
          )
          alert('Question imported! You can now edit and save it.')
        } catch (error) {
          alert('Invalid JSON file')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const addStep = () => {
    const newStep: Step = {
      label: '',
      text: '',
      math: '',
      math2: '',
      math3: '',
      speech: '',
      highlight: false,
      isAnswer: false,
      showElements: [],
    }
    setFormData({
      ...formData,
      steps: [...(formData.steps || []), newStep],
    })
  }

  const updateStep = (index: number, field: keyof Step, value: any) => {
    const updated = [...(formData.steps || [])]
    updated[index] = { ...updated[index], [field]: value }
    setFormData({ ...formData, steps: updated })
  }

  const deleteStep = (index: number) => {
    const updated = (formData.steps || []).filter((_, i) => i !== index)
    setFormData({ ...formData, steps: updated })
  }

  const addParameter = () => {
    setParameters([
      ...parameters,
      {
        key: '',
        label: '',
        min: 0,
        max: 10,
        step: 0.1,
        value: 5,
        unit: '',
      },
    ])
  }

  const updateParameter = (index: number, field: keyof Parameter, value: any) => {
    const updated = [...parameters]
    updated[index] = { ...updated[index], [field]: value }
    setParameters(updated)
  }

  const deleteParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg, #0f172a)' }}>
      {/* Top Bar */}
      <div
        className="border-b px-6 py-4 flex items-center justify-between"
        style={{
          borderColor: 'var(--border, #1e293b)',
          backgroundColor: 'var(--surface, #1e293b)',
        }}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm hover:opacity-70 transition"
            style={{ color: 'var(--text-dim, #94a3b8)' }}
          >
            ← Back to JEETribe AI
          </Link>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text, #f1f5f9)' }}>
            Admin Panel
          </h1>
        </div>
        <div className="text-sm" style={{ color: 'var(--text-dim, #94a3b8)' }}>
          {questions.length} custom question{questions.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div
          className="w-64 border-r overflow-y-auto"
          style={{
            borderColor: 'var(--border, #1e293b)',
            backgroundColor: 'var(--surface, #1e293b)',
          }}
        >
          <div className="p-4 space-y-2">
            <button
              onClick={() => setSelectedId(null)}
              className={`w-full text-left px-3 py-2 rounded text-sm transition ${
                !selectedId ? 'font-semibold' : ''
              }`}
              style={{
                backgroundColor: !selectedId ? 'var(--accent, #3b82f6)' : 'transparent',
                color: !selectedId ? 'white' : 'var(--text-dim, #94a3b8)',
              }}
            >
              + New Question
            </button>

            <div className="pt-2 space-y-1">
              {questions.map((q) => (
                <div
                  key={q.id}
                  onClick={() => setSelectedId(q.id)}
                  className={`px-3 py-2 rounded text-sm cursor-pointer transition flex items-center justify-between group ${
                    selectedId === q.id ? 'font-semibold' : ''
                  }`}
                  style={{
                    backgroundColor: selectedId === q.id ? 'var(--accent, #3b82f6)' : 'transparent',
                    color: selectedId === q.id ? 'white' : 'var(--text-dim, #94a3b8)',
                  }}
                >
                  <span className="truncate flex-1">{q.title || 'Untitled'}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteQuestion(q.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 text-xs ml-1"
                    style={{ color: 'var(--red, #ef4444)' }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {showPreview ? (
            <PreviewSection
              question={formData as Topic}
              onClose={() => setShowPreview(false)}
            />
          ) : (
            <div className="max-w-3xl space-y-8">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text, #f1f5f9)' }}>
                  {selectedId ? 'Edit Question' : 'Create New Question'}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPreview(true)}
                    className="px-4 py-2 rounded text-sm font-medium transition hover:opacity-80"
                    style={{
                      backgroundColor: 'var(--surface2, #334155)',
                      color: 'var(--text, #f1f5f9)',
                    }}
                  >
                    Preview
                  </button>
                  <button
                    onClick={importJSON}
                    className="px-4 py-2 rounded text-sm font-medium transition hover:opacity-80"
                    style={{
                      backgroundColor: 'var(--surface2, #334155)',
                      color: 'var(--text, #f1f5f9)',
                    }}
                  >
                    Import JSON
                  </button>
                  <button
                    onClick={exportJSON}
                    className="px-4 py-2 rounded text-sm font-medium transition hover:opacity-80"
                    style={{
                      backgroundColor: 'var(--surface2, #334155)',
                      color: 'var(--text, #f1f5f9)',
                    }}
                  >
                    Export JSON
                  </button>
                </div>
              </div>

              {/* Basic Info Section */}
              <FormSection title="Basic Information">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Title"
                    error={errors.title}
                    required
                  >
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Question title in English"
                      className="w-full px-3 py-2 rounded text-sm border transition"
                      style={{
                        backgroundColor: 'var(--surface2, #334155)',
                        borderColor: errors.title ? 'var(--red, #ef4444)' : 'var(--border, #1e293b)',
                        color: 'var(--text, #f1f5f9)',
                      }}
                    />
                  </FormField>

                  <FormField
                    label="Title (Hindi)"
                    error={errors.titleHi}
                    required
                  >
                    <input
                      type="text"
                      value={formData.titleHi || ''}
                      onChange={(e) => setFormData({ ...formData, titleHi: e.target.value })}
                      placeholder="प्रश्न का शीर्षक"
                      className="w-full px-3 py-2 rounded text-sm border transition"
                      style={{
                        backgroundColor: 'var(--surface2, #334155)',
                        borderColor: errors.titleHi ? 'var(--red, #ef4444)' : 'var(--border, #1e293b)',
                        color: 'var(--text, #f1f5f9)',
                      }}
                    />
                  </FormField>

                  <FormField label="Subject" required>
                    <select
                      value={formData.subject || 'Physics'}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value as any })
                      }
                      className="w-full px-3 py-2 rounded text-sm border transition"
                      style={{
                        backgroundColor: 'var(--surface2, #334155)',
                        borderColor: 'var(--border, #1e293b)',
                        color: 'var(--text, #f1f5f9)',
                      }}
                    >
                      <option>Physics</option>
                      <option>Chemistry</option>
                      <option>Mathematics</option>
                    </select>
                  </FormField>

                  <FormField
                    label="Chapter"
                    error={errors.chapter}
                    required
                  >
                    <input
                      type="text"
                      value={formData.chapter || ''}
                      onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                      placeholder="Chapter name"
                      className="w-full px-3 py-2 rounded text-sm border transition"
                      style={{
                        backgroundColor: 'var(--surface2, #334155)',
                        borderColor: errors.chapter ? 'var(--red, #ef4444)' : 'var(--border, #1e293b)',
                        color: 'var(--text, #f1f5f9)',
                      }}
                    />
                  </FormField>

                  <FormField label="Exam" required>
                    <select
                      value={formData.exam || 'JEE Mains'}
                      onChange={(e) => setFormData({ ...formData, exam: e.target.value as any })}
                      className="w-full px-3 py-2 rounded text-sm border transition"
                      style={{
                        backgroundColor: 'var(--surface2, #334155)',
                        borderColor: 'var(--border, #1e293b)',
                        color: 'var(--text, #f1f5f9)',
                      }}
                    >
                      <option>JEE Mains</option>
                      <option>JEE Advanced</option>
                      <option>NEET</option>
                    </select>
                  </FormField>

                  <FormField label="Difficulty" required>
                    <select
                      value={formData.difficulty || 'Medium'}
                      onChange={(e) =>
                        setFormData({ ...formData, difficulty: e.target.value as any })
                      }
                      className="w-full px-3 py-2 rounded text-sm border transition"
                      style={{
                        backgroundColor: 'var(--surface2, #334155)',
                        borderColor: 'var(--border, #1e293b)',
                        color: 'var(--text, #f1f5f9)',
                      }}
                    >
                      <option>Easy</option>
                      <option>Medium</option>
                      <option>Hard</option>
                    </select>
                  </FormField>

                  <FormField label="Icon">
                    <input
                      type="text"
                      maxLength={2}
                      value={formData.icon || '⚡'}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full px-3 py-2 rounded text-sm border text-center text-lg transition"
                      style={{
                        backgroundColor: 'var(--surface2, #334155)',
                        borderColor: 'var(--border, #1e293b)',
                        color: 'var(--text, #f1f5f9)',
                      }}
                    />
                  </FormField>

                  <FormField label="Color">
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.color || '#3B82F6'}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-12 h-10 rounded border cursor-pointer"
                        style={{ borderColor: 'var(--border, #1e293b)' }}
                      />
                      <input
                        type="text"
                        value={formData.color || '#3B82F6'}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="flex-1 px-3 py-2 rounded text-sm border transition"
                        style={{
                          backgroundColor: 'var(--surface2, #334155)',
                          borderColor: 'var(--border, #1e293b)',
                          color: 'var(--text, #f1f5f9)',
                        }}
                      />
                    </div>
                  </FormField>
                </div>
              </FormSection>

              {/* Simulation Config Section */}
              <FormSection title="Simulation Configuration">
                <div className="space-y-4">
                  <FormField label="Diagram Type">
                    <select
                      value={formData.diagram?.type || 'none'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          diagram: { ...formData.diagram!, type: e.target.value as any },
                        })
                      }
                      className="w-full px-3 py-2 rounded text-sm border transition"
                      style={{
                        backgroundColor: 'var(--surface2, #334155)',
                        borderColor: 'var(--border, #1e293b)',
                        color: 'var(--text, #f1f5f9)',
                      }}
                    >
                      <option value="none">None</option>
                      <option value="atwood">Atwood Machine</option>
                      <option value="projectile">Projectile Motion</option>
                      <option value="pendulum">Pendulum</option>
                      <option value="lens">Lens</option>
                      <option value="circuit">Circuit</option>
                      <option value="gauss">Gauss Law</option>
                    </select>
                  </FormField>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium" style={{ color: 'var(--text, #f1f5f9)' }}>
                        Parameters
                      </h3>
                      <button
                        onClick={addParameter}
                        className="px-3 py-1 rounded text-xs font-medium transition hover:opacity-80"
                        style={{
                          backgroundColor: 'var(--accent, #3b82f6)',
                          color: 'white',
                        }}
                      >
                        + Add Parameter
                      </button>
                    </div>

                    {parameters.length === 0 ? (
                      <p
                        className="text-sm py-4 text-center"
                        style={{ color: 'var(--text-dim, #94a3b8)' }}
                      >
                        No parameters added yet
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {parameters.map((param, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded border space-y-2"
                            style={{
                              backgroundColor: 'var(--surface2, #334155)',
                              borderColor: 'var(--border, #1e293b)',
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="grid grid-cols-3 gap-2 flex-1">
                                <input
                                  type="text"
                                  placeholder="Key"
                                  value={param.key}
                                  onChange={(e) => updateParameter(idx, 'key', e.target.value)}
                                  className="px-2 py-1 rounded text-xs border"
                                  style={{
                                    backgroundColor: 'var(--surface, #1e293b)',
                                    borderColor: 'var(--border, #1e293b)',
                                    color: 'var(--text, #f1f5f9)',
                                  }}
                                />
                                <input
                                  type="text"
                                  placeholder="Label"
                                  value={param.label}
                                  onChange={(e) => updateParameter(idx, 'label', e.target.value)}
                                  className="px-2 py-1 rounded text-xs border"
                                  style={{
                                    backgroundColor: 'var(--surface, #1e293b)',
                                    borderColor: 'var(--border, #1e293b)',
                                    color: 'var(--text, #f1f5f9)',
                                  }}
                                />
                                <input
                                  type="text"
                                  placeholder="Unit"
                                  value={param.unit}
                                  onChange={(e) => updateParameter(idx, 'unit', e.target.value)}
                                  className="px-2 py-1 rounded text-xs border"
                                  style={{
                                    backgroundColor: 'var(--surface, #1e293b)',
                                    borderColor: 'var(--border, #1e293b)',
                                    color: 'var(--text, #f1f5f9)',
                                  }}
                                />
                              </div>
                              <button
                                onClick={() => deleteParameter(idx)}
                                className="ml-2 px-2 py-1 rounded text-xs transition hover:opacity-70"
                                style={{
                                  backgroundColor: 'var(--red, #ef4444)',
                                  color: 'white',
                                }}
                              >
                                Delete
                              </button>
                            </div>
                            <div className="grid grid-cols-5 gap-2">
                              <input
                                type="number"
                                placeholder="Min"
                                value={param.min}
                                onChange={(e) =>
                                  updateParameter(idx, 'min', parseFloat(e.target.value) || 0)
                                }
                                className="px-2 py-1 rounded text-xs border"
                                style={{
                                  backgroundColor: 'var(--surface, #1e293b)',
                                  borderColor: 'var(--border, #1e293b)',
                                  color: 'var(--text, #f1f5f9)',
                                }}
                              />
                              <input
                                type="number"
                                placeholder="Max"
                                value={param.max}
                                onChange={(e) =>
                                  updateParameter(idx, 'max', parseFloat(e.target.value) || 10)
                                }
                                className="px-2 py-1 rounded text-xs border"
                                style={{
                                  backgroundColor: 'var(--surface, #1e293b)',
                                  borderColor: 'var(--border, #1e293b)',
                                  color: 'var(--text, #f1f5f9)',
                                }}
                              />
                              <input
                                type="number"
                                placeholder="Step"
                                value={param.step}
                                onChange={(e) =>
                                  updateParameter(idx, 'step', parseFloat(e.target.value) || 0.1)
                                }
                                className="px-2 py-1 rounded text-xs border"
                                style={{
                                  backgroundColor: 'var(--surface, #1e293b)',
                                  borderColor: 'var(--border, #1e293b)',
                                  color: 'var(--text, #f1f5f9)',
                                }}
                              />
                              <input
                                type="number"
                                placeholder="Value"
                                value={param.value}
                                onChange={(e) =>
                                  updateParameter(idx, 'value', parseFloat(e.target.value) || 5)
                                }
                                className="px-2 py-1 rounded text-xs border"
                                style={{
                                  backgroundColor: 'var(--surface, #1e293b)',
                                  borderColor: 'var(--border, #1e293b)',
                                  color: 'var(--text, #f1f5f9)',
                                }}
                              />
                              <span
                                className="flex items-center justify-center text-xs"
                                style={{ color: 'var(--text-dim, #94a3b8)' }}
                              >
                                {param.unit || 'unit'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </FormSection>

              {/* Steps Section */}
              <FormSection title="Solution Steps">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium" style={{ color: 'var(--text, #f1f5f9)' }}>
                      Steps
                    </h3>
                    <button
                      onClick={addStep}
                      className="px-4 py-2 rounded text-sm font-medium transition hover:opacity-80"
                      style={{
                        backgroundColor: 'var(--green, #10b981)',
                        color: 'white',
                      }}
                    >
                      + Add Step
                    </button>
                  </div>

                  {errors.steps && (
                    <p className="text-sm" style={{ color: 'var(--red, #ef4444)' }}>
                      {errors.steps}
                    </p>
                  )}

                  {formData.steps && formData.steps.length === 0 ? (
                    <p
                      className="text-sm py-4 text-center"
                      style={{ color: 'var(--text-dim, #94a3b8)' }}
                    >
                      No steps added yet. Click "Add Step" to begin.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {formData.steps?.map((step, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded border space-y-3"
                          style={{
                            backgroundColor: 'var(--surface2, #334155)',
                            borderColor: 'var(--border, #1e293b)',
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span
                                  className="text-xs font-semibold px-2 py-1 rounded"
                                  style={{
                                    backgroundColor: 'var(--accent, #3b82f6)',
                                    color: 'white',
                                  }}
                                >
                                  Step {idx + 1}
                                </span>
                                <span className="text-xl">⋮⋮</span>
                              </div>
                            </div>
                            <button
                              onClick={() => deleteStep(idx)}
                              className="px-3 py-1 rounded text-sm transition hover:opacity-70"
                              style={{
                                backgroundColor: 'var(--red, #ef4444)',
                                color: 'white',
                              }}
                            >
                              Delete
                            </button>
                          </div>

                          <div>
                            <label
                              className="text-xs font-medium block mb-1"
                              style={{ color: 'var(--text-dim, #94a3b8)' }}
                            >
                              Label
                            </label>
                            <input
                              type="text"
                              value={step.label}
                              onChange={(e) => updateStep(idx, 'label', e.target.value)}
                              placeholder="e.g., Identify forces"
                              className="w-full px-3 py-2 rounded text-sm border transition"
                              style={{
                                backgroundColor: 'var(--surface, #1e293b)',
                                borderColor: 'var(--border, #1e293b)',
                                color: 'var(--text, #f1f5f9)',
                              }}
                            />
                          </div>

                          <div>
                            <label
                              className="text-xs font-medium block mb-1"
                              style={{ color: 'var(--text-dim, #94a3b8)' }}
                            >
                              Text Content
                            </label>
                            <textarea
                              value={step.text || ''}
                              onChange={(e) => updateStep(idx, 'text', e.target.value)}
                              placeholder="Optional text content for this step"
                              rows={3}
                              className="w-full px-3 py-2 rounded text-sm border transition resize-none"
                              style={{
                                backgroundColor: 'var(--surface, #1e293b)',
                                borderColor: 'var(--border, #1e293b)',
                                color: 'var(--text, #f1f5f9)',
                              }}
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label
                                className="text-xs font-medium block mb-1"
                                style={{ color: 'var(--text-dim, #94a3b8)' }}
                              >
                                Math (LaTeX)
                              </label>
                              <textarea
                                value={step.math || ''}
                                onChange={(e) => updateStep(idx, 'math', e.target.value)}
                                placeholder="e.g., F = ma"
                                rows={2}
                                className="w-full px-3 py-2 rounded text-sm border transition resize-none"
                                style={{
                                  backgroundColor: 'var(--surface, #1e293b)',
                                  borderColor: 'var(--border, #1e293b)',
                                  color: 'var(--text, #f1f5f9)',
                                  fontSize: '0.875rem',
                                }}
                              />
                            </div>
                            <div>
                              <label
                                className="text-xs font-medium block mb-1"
                                style={{ color: 'var(--text-dim, #94a3b8)' }}
                              >
                                Math 2 (LaTeX)
                              </label>
                              <textarea
                                value={step.math2 || ''}
                                onChange={(e) => updateStep(idx, 'math2', e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 rounded text-sm border transition resize-none"
                                style={{
                                  backgroundColor: 'var(--surface, #1e293b)',
                                  borderColor: 'var(--border, #1e293b)',
                                  color: 'var(--text, #f1f5f9)',
                                  fontSize: '0.875rem',
                                }}
                              />
                            </div>
                            <div>
                              <label
                                className="text-xs font-medium block mb-1"
                                style={{ color: 'var(--text-dim, #94a3b8)' }}
                              >
                                Math 3 (LaTeX)
                              </label>
                              <textarea
                                value={step.math3 || ''}
                                onChange={(e) => updateStep(idx, 'math3', e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 rounded text-sm border transition resize-none"
                                style={{
                                  backgroundColor: 'var(--surface, #1e293b)',
                                  borderColor: 'var(--border, #1e293b)',
                                  color: 'var(--text, #f1f5f9)',
                                  fontSize: '0.875rem',
                                }}
                              />
                            </div>
                          </div>

                          <div>
                            <label
                              className="text-xs font-medium block mb-1"
                              style={{ color: 'var(--text-dim, #94a3b8)' }}
                            >
                              Speech (Hinglish Narration)
                            </label>
                            <textarea
                              value={step.speech}
                              onChange={(e) => updateStep(idx, 'speech', e.target.value)}
                              placeholder="e.g., Isme force 10 Newton hai..."
                              rows={3}
                              className="w-full px-3 py-2 rounded text-sm border transition resize-none"
                              style={{
                                backgroundColor: 'var(--surface, #1e293b)',
                                borderColor: 'var(--border, #1e293b)',
                                color: 'var(--text, #f1f5f9)',
                              }}
                            />
                          </div>

                          <div className="flex gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={step.isAnswer || false}
                                onChange={(e) => updateStep(idx, 'isAnswer', e.target.checked)}
                                className="w-4 h-4 rounded"
                              />
                              <span
                                className="text-sm"
                                style={{ color: 'var(--text-dim, #94a3b8)' }}
                              >
                                Is Answer
                              </span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={step.highlight || false}
                                onChange={(e) => updateStep(idx, 'highlight', e.target.checked)}
                                className="w-4 h-4 rounded"
                              />
                              <span
                                className="text-sm"
                                style={{ color: 'var(--text-dim, #94a3b8)' }}
                              >
                                Highlight
                              </span>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </FormSection>

              {/* Save Button */}
              <div className="flex gap-3 pb-8">
                <button
                  onClick={saveQuestion}
                  className="px-6 py-3 rounded font-semibold transition hover:opacity-80"
                  style={{
                    backgroundColor: 'var(--green, #10b981)',
                    color: 'white',
                  }}
                >
                  Save Question
                </button>
                {selectedId && (
                  <button
                    onClick={() => {
                      deleteQuestion(selectedId)
                      setSelectedId(null)
                    }}
                    className="px-6 py-3 rounded font-semibold transition hover:opacity-80"
                    style={{
                      backgroundColor: 'var(--red, #ef4444)',
                      color: 'white',
                    }}
                  >
                    Delete This Question
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FormSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div
      className="p-6 rounded border space-y-4"
      style={{
        backgroundColor: 'var(--surface, #1e293b)',
        borderColor: 'var(--border, #1e293b)',
      }}
    >
      <h2 className="text-lg font-semibold" style={{ color: 'var(--text, #f1f5f9)' }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label
        className="text-sm font-medium block mb-2"
        style={{ color: 'var(--text, #f1f5f9)' }}
      >
        {label}
        {required && <span style={{ color: 'var(--red, #ef4444)' }}> *</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs mt-1" style={{ color: 'var(--red, #ef4444)' }}>
          {error}
        </p>
      )}
    </div>
  )
}

function PreviewSection({
  question,
  onClose,
}: {
  question: Partial<Topic>
  onClose: () => void
}) {
  return (
    <div className="max-w-2xl">
      <button
        onClick={onClose}
        className="mb-6 text-sm hover:opacity-70 transition"
        style={{ color: 'var(--text-dim, #94a3b8)' }}
      >
        ← Back to Editing
      </button>

      <div
        className="p-6 rounded border"
        style={{
          backgroundColor: 'var(--surface, #1e293b)',
          borderColor: 'var(--border, #1e293b)',
        }}
      >
        <div className="flex items-start gap-4 mb-6">
          <div
            className="text-4xl"
            style={{ color: question.color || '#3B82F6' }}
          >
            {question.icon || '⚡'}
          </div>
          <div className="flex-1">
            <h1
              className="text-2xl font-bold mb-2"
              style={{ color: 'var(--text, #f1f5f9)' }}
            >
              {question.title || 'Untitled Question'}
            </h1>
            <p className="text-sm mb-3" style={{ color: 'var(--text-dim, #94a3b8)' }}>
              {question.titleHi}
            </p>
            <div className="flex gap-2 flex-wrap">
              <Badge>{question.subject}</Badge>
              <Badge>{question.exam}</Badge>
              <Badge>{question.difficulty}</Badge>
              <Badge>{question.chapter}</Badge>
            </div>
          </div>
        </div>

        {question.diagram && question.diagram.type !== 'none' && (
          <div className="mb-6 p-4 rounded" style={{ backgroundColor: 'var(--surface2, #334155)' }}>
            <p
              className="text-sm font-medium mb-2"
              style={{ color: 'var(--text, #f1f5f9)' }}
            >
              Diagram: {question.diagram.type}
            </p>
            {Object.keys(question.diagram.params || {}).length > 0 && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(question.diagram.params || {}).map(([key, param]) => (
                  <div key={key} style={{ color: 'var(--text-dim, #94a3b8)' }}>
                    <span className="font-medium">{param.label}:</span> {param.value} {param.unit}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          {question.steps?.map((step, idx) => (
            <div
              key={idx}
              className="p-4 rounded"
              style={{
                backgroundColor: step.isAnswer ? 'var(--green, #10b981)20' : 'var(--surface2, #334155)',
                borderLeft: step.highlight ? '4px solid var(--orange, #f97316)' : 'none',
              }}
            >
              <h3
                className="font-semibold mb-2"
                style={{ color: 'var(--text, #f1f5f9)' }}
              >
                Step {idx + 1}: {step.label}
              </h3>
              {step.text && (
                <p
                  className="text-sm mb-2"
                  style={{ color: 'var(--text-dim, #94a3b8)' }}
                >
                  {step.text}
                </p>
              )}
              {(step.math || step.math2 || step.math3) && (
                <div className="space-y-1 mb-2 p-2 bg-opacity-50" style={{ backgroundColor: 'var(--bg, #0f172a)' }}>
                  {step.math && (
                    <p className="text-xs font-mono" style={{ color: 'var(--orange, #f97316)' }}>
                      {step.math}
                    </p>
                  )}
                  {step.math2 && (
                    <p className="text-xs font-mono" style={{ color: 'var(--orange, #f97316)' }}>
                      {step.math2}
                    </p>
                  )}
                  {step.math3 && (
                    <p className="text-xs font-mono" style={{ color: 'var(--orange, #f97316)' }}>
                      {step.math3}
                    </p>
                  )}
                </div>
              )}
              {step.speech && (
                <p className="text-sm italic" style={{ color: 'var(--text-dim, #94a3b8)' }}>
                  🔊 "{step.speech}"
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="px-2 py-1 rounded text-xs font-medium"
      style={{
        backgroundColor: 'var(--accent, #3b82f6)20',
        color: 'var(--accent, #3b82f6)',
      }}
    >
      {children}
    </span>
  )
}
