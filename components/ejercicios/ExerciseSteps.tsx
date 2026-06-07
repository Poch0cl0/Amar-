'use client'

import type { Lang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n'
import type { ExerciseStep } from '@/lib/exercises'
import { getStepInstruction } from '@/lib/exercises'
import { ExerciseIcon } from '@/components/ejercicios/ExerciseIcon'

type ExerciseStepsProps = {
  steps: ExerciseStep[]
  lang: Lang
  expanded: boolean
}

export function ExerciseSteps({ steps, lang, expanded }: ExerciseStepsProps) {
  const copy = getTranslations(lang).ejercicios

  return (
    <div
      className={`grid transition-all duration-300 ease-in-out ${
        expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
      }`}
    >
      <div className="overflow-hidden">
        <ol className="space-y-3 border-t border-earth-100 px-6 pb-6 pt-4">
          {steps.map((step, index) => (
            <li key={`step-${index}`} className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-200 text-xs font-semibold text-earth-800">
                {index + 1}
              </span>

              <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-earth-700">
                <ExerciseIcon name={step.icon} className="h-4 w-4" />
              </span>

              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm leading-relaxed text-earth-700">
                  {getStepInstruction(step, lang)}
                </p>
                {step.duration_sec ? (
                  <span className="mt-1 inline-flex rounded-full bg-rose-50 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-rose-500">
                    {step.duration_sec} {copy.seconds}
                  </span>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
