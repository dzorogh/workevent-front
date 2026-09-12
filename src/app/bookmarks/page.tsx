import { Metadata } from 'next';
import BookmarksPage from './bookmarks-page';

export const metadata: Metadata = {
    title: 'Закладки',
    description: 'Мероприятия, сохранённые на этом устройстве.',
    robots: { index: false, follow: false },
};

export default function Page() {
    return <BookmarksPage />;
}
