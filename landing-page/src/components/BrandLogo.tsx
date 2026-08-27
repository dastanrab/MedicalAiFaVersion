type BrandLogoProps = {
  compact?: boolean
  inverted?: boolean
}

export function BrandLogo({ compact = false, inverted = false }: BrandLogoProps) {
  return (
    <a
      href="#intro"
      aria-label="مدیرا AI، بازگشت به ابتدای صفحه"
      className="focus-ring flex items-center gap-3 rounded-xl"
    >
      <span
        className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl ${
          compact ? 'h-10 w-10' : 'h-11 w-11'
        } ${inverted ? 'bg-white' : 'bg-blue-50'}`}
      >
        <img src="/logo.svg" alt="" className="h-8 w-8 object-contain object-top" aria-hidden="true" />
      </span>
      <span className="leading-tight">
        <span className={`block text-base font-extrabold ${inverted ? 'text-white' : 'text-blue-950'}`}>
          مدیرا AI
        </span>
        {!compact && (
          <span className={`block text-[10px] font-semibold ${inverted ? 'text-blue-100' : 'text-slate-400'}`}>
            همراه مسیر سلامت
          </span>
        )}
      </span>
    </a>
  )
}
