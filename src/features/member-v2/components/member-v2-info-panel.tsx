import { Separator } from '@/components/ui/separator'

type MiniInfoProps = {
  title: string
  value: string
  description: string
}

export function MemberV2InfoPanel() {
  return (
    <section className="surface-card p-5 sm:p-6">
      <div className="grid gap-4 md:grid-cols-3">
        <MiniInfo
          title="Formula"
          value="Credit × Percentage ÷ 100"
          description="Interest is calculated from member credit and percentage."
        />

        <MiniInfo
          title="Data type"
          value="Prime / MemberV2"
          description="This is only for credit members. No jinis is included."
        />

        <MiniInfo
          title="Safety"
          value="User scoped"
          description="Every query is filtered by logged-in userId from your auth session."
        />
      </div>
    </section>
  )
}

function MiniInfo({ title, value, description }: MiniInfoProps) {
  return (
    <div className="surface-muted rounded-[var(--radius-lg)] p-4 transition-colors duration-200 hover:border-primary/20">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="mt-1 font-semibold tracking-tight text-foreground">{value}</p>

      <Separator className="my-3 opacity-60" />

      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  )
}
