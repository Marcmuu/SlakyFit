import { useState, type ReactNode } from 'react'
import { useAppStore } from '../../data/store'
import PageHeader from '../../components/PageHeader'
import Card from '../../components/Card'
import Button from '../../components/Button'

export default function ProfileScreen() {
  const { profile, updateProfile } = useAppStore()
  const [form, setForm] = useState(profile)
  const [saved, setSaved] = useState(false)

  function save() {
    updateProfile(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div>
      <PageHeader title="Perfil" onBack />
      <div className="px-4 flex flex-col gap-4">
        <Card className="flex flex-col gap-3">
          <Field label="Nombre">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
          </Field>
          <Field label="Edad">
            <input
              type="number"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: Number(e.target.value) })}
              className="input"
            />
          </Field>
          <Field label="Altura (cm)">
            <input
              type="number"
              value={form.heightCm}
              onChange={(e) => setForm({ ...form, heightCm: Number(e.target.value) })}
              className="input"
            />
          </Field>
          <Field label="Peso (kg)">
            <input
              type="number"
              value={form.weightKg}
              onChange={(e) => setForm({ ...form, weightKg: Number(e.target.value) })}
              className="input"
            />
          </Field>
          <Field label="Experiencia">
            <textarea
              value={form.experience}
              onChange={(e) => setForm({ ...form, experience: e.target.value })}
              rows={3}
              className="input resize-none"
            />
          </Field>
        </Card>
        <Button size="lg" onClick={save}>
          {saved ? 'Guardado ✓' : 'Guardar cambios'}
        </Button>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs text-base-500">{label}</span>
      {children}
    </label>
  )
}
