'use client'

type MoodIntensitySliderProps = {
  value: number
  onChange: (value: number) => void
  subtleLabel: string
  intenseLabel: string
}

export function MoodIntensitySlider({
  value,
  onChange,
  subtleLabel,
  intenseLabel,
}: MoodIntensitySliderProps) {
  return (
    <div className="space-y-3">
      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-rose-100 accent-earth-800"
        aria-valuemin={1}
        aria-valuemax={10}
        aria-valuenow={value}
      />
      <div className="flex justify-between text-xs text-earth-500">
        <span>{subtleLabel}</span>
        <span className="font-semibold text-earth-700">{value}/10</span>
        <span>{intenseLabel}</span>
      </div>
    </div>
  )
}
