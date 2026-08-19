import type { FaqItem } from '@/lib/seo/faq';

export default function FaqSection({
  items,
  title = 'Частые вопросы',
}: {
  items: FaqItem[];
  title?: string;
}) {
  if (items.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <dl className="flex flex-col gap-4">
        {items.map((item) => (
          <div key={item.question} className="flex flex-col gap-1">
            <dt className="font-medium">{item.question}</dt>
            <dd className="text-sm text-muted-foreground">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
