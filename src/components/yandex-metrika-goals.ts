/**
 * Цели Яндекс.Метрики (JavaScript-события). Завести в интерфейсе Метрики:
 * - event_apply — отправка заявки на участие (форма на /event/*)
 * - newsletter_subscribe — подписка на рассылку (блок Subscribe)
 * - organizer_goto — переход на сайт организатора (клик /goto/*)
 *
 * Счётчик тот же, что в YandexMetrika / YandexMetrikaCounter.
 */
export const YANDEX_METRIKA_COUNTER_ID = 99029501;

export type YandexMetrikaGoal =
    | 'event_apply'
    | 'newsletter_subscribe'
    | 'organizer_goto';

declare global {
    interface Window {
        ym?: (id: number, action: string, ...args: unknown[]) => void;
    }
}

export function reachGoal(name: YandexMetrikaGoal) {
    if (typeof window === 'undefined' || typeof window.ym !== 'function') {
        return;
    }

    window.ym(YANDEX_METRIKA_COUNTER_ID, 'reachGoal', name);
}

export function isOrganizerGotoHref(href: string | null | undefined) {
    return Boolean(href?.startsWith('/goto/'));
}
