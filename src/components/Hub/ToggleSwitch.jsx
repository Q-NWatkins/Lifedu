export default function ToggleSwitch({ label, description, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border-4 border-black bg-lime-50 px-4 py-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
      <span>
        <span className="block text-sm font-black text-black">{label}</span>
        {description && (
          <span className="mt-0.5 block text-xs font-semibold text-black/60">{description}</span>
        )}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`
          relative h-8 w-14 shrink-0 rounded-full border-4 border-black transition-colors
          ${checked ? 'bg-green-400' : 'bg-stone-300'}
        `}
      >
        <span
          className={`
            absolute top-0.5 left-0.5 h-5 w-5 rounded-full border-2 border-black bg-white
            transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}
          `}
        />
      </button>
    </label>
  );
}
