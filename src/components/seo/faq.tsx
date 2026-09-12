import type { FaqItem } from '@/lib/seo/faq';
import { discoverySectionTitleClass } from '@/lib/discovery-ui';

export default function FaqSection({
  items,
  title = 'Частые вопросы',
}: {
  items: FaqItem[];
  title?: string;
}) {
  if (items.length === 0) return null;

  return (
    <section className="flex flex-col gap-5">
      <h2 className={discoverySectionTitleClass}>{title}</h2>
      <dl className="grid grid-cols-1 gap-3 min-[900px]:grid-cols-3">
        {items.map((item) => (
          <div key={item.question} className="flex flex-col rounded-[16px] bg-white px-5 py-5">
            <dt className="text-[16px] font-semibold leading-snug text-[#090D2B]">{item.question}</dt>
            <dd className="mt-2 text-[14px] leading-6 text-[#657087]">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
