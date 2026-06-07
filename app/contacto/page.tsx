'use client'

import { useState } from 'react'
import { SectionHeading } from '@/components/common/SectionHeading'

export default function ContactoPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
  })

  return (
    <section className="px-6 py-16 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-8">
          <SectionHeading
            eyebrow="Pagina Contacto"
            title="Una entrada clara para mensajes, alianzas o pedidos."
            description="Dejamos el formulario listo en interfaz. Luego podemos conectarlo a Supabase, correo o a la API que prefieras."
          />

          <div className="space-y-4 rounded-[2rem] border border-earth-200 bg-white p-6 shadow-card text-earth-600">
            <p>
              <span className="font-semibold text-earth-900">Correo:</span> ejemplo@amara.com
            </p>
            <p>
              <span className="font-semibold text-earth-900">Instagram:</span> @amara.calma
            </p>
            <p>
              <span className="font-semibold text-earth-900">Horario:</span> Lunes a sabado, 9:00
              a.m. a 6:00 p.m.
            </p>
          </div>
        </div>

        <form className="rounded-[2.5rem] border border-earth-200 bg-white p-8 shadow-soft">
          <div className="grid gap-6">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-earth-700">Nombre</span>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-2xl border border-earth-200 bg-sand-50 px-4 py-3 outline-none transition focus:border-sage-500"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-earth-700">Correo</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-2xl border border-earth-200 bg-sand-50 px-4 py-3 outline-none transition focus:border-sage-500"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-earth-700">Mensaje</span>
              <textarea
                rows={6}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full rounded-2xl border border-earth-200 bg-sand-50 px-4 py-3 outline-none transition focus:border-sage-500"
              />
            </label>

            <button
              type="button"
              className="inline-flex w-fit rounded-full bg-earth-900 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-earth-800"
            >
              Enviar mensaje
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
