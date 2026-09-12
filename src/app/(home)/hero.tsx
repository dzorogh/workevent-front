const MONTHS = [
  'ЯНВАРЬ', 'ФЕВРАЛЬ', 'МАРТ', 'АПРЕЛЬ', 'МАЙ', 'ИЮНЬ',
  'ИЮЛЬ', 'АВГУСТ', 'СЕНТЯБРЬ', 'ОКТЯБРЬ', 'НОЯБРЬ', 'ДЕКАБРЬ',
];

function currentMonthLabel() {
  const now = new Date();
  return `${MONTHS[now.getMonth()]} '${String(now.getFullYear()).slice(-2)}`;
}

export default function Hero({ monthLabel }: { monthLabel?: string }) {
  const label = monthLabel ?? currentMonthLabel();

  return (
    <div className="relative flex items-start justify-between min-[1200px]:min-h-[152px]">
      <div className="max-w-[820px]">
        <p className="m-0 text-[34px] leading-[38px] min-[1200px]:text-[58px] min-[1200px]:leading-[62px] font-bold tracking-[-0.035em] text-[#090D2B]">
          Найдите событие,
          <br />
          которое двигает вас вперёд.
        </p>
        <p className="m-0 mt-2 text-[18px] leading-7 min-[1200px]:text-[21px] min-[1200px]:leading-7 text-[#657087] max-w-[760px]">
          Конференции, выставки и форумы для вашего профессионального роста
        </p>
      </div>
      <div className="pointer-events-none absolute right-0 top-[-15px] hidden min-[1200px]:flex w-[468px] items-start justify-end gap-5">
        <div className="w-[118px] pt-1 text-[11px] leading-[16px] tracking-[0.14em] uppercase text-[#657087]">
          <div className="mb-3 tracking-[0.18em]">{label}</div>
          <div>больше</div>
          <div>возможностей</div>
          <div>для ваших</div>
          <div>идей</div>
        </div>
        <svg width="152" height="152" viewBox="0 0 152 152" aria-hidden className="shrink-0">
          <defs>
            <mask id="discovery-ticket">
              <rect width="152" height="152" rx="20" fill="white" />
              <circle cx="0" cy="76" r="34" fill="black" />
            </mask>
          </defs>
          <rect width="152" height="152" rx="20" fill="#4545EF" mask="url(#discovery-ticket)" />
        </svg>
        <div className="w-[88px] pt-10 text-[11px] leading-[16px] tracking-[0.14em] uppercase text-[#657087]">
          <div>люди</div>
          <div>знания</div>
          <div>контакты</div>
          <div>развитие</div>
          <div className="mt-3 h-px w-10 bg-[#D4DAE8]" />
        </div>
      </div>
    </div>
  );
}
