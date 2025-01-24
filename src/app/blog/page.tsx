import React from 'react';
import { Api } from "@/lib/api"
import H1 from '@/components/ui/h1';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { createSlugWithId } from '@/lib/utils';
import { Route } from 'next';
import { Metadata } from 'next';
import EventCoverImage from '@/components/event-cover-image';

const getPosts = async () => {
    const response = await Api.GET('/v1/posts');
    return response.data;
}

export const revalidate = false;

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Блог и новости проекта Workevent',
        description: 'Блог на сайте Workevent. Статьи о деловых мероприятиях, полезные советы для организаторов, отзывы участников, новости и обзоры',
    };
}

export default async function BlogPage() {
    const posts = await getPosts();

    return (
        <div className="flex flex-col gap-10">
            <H1>Блог</H1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts?.data?.map(post => (
                    <Link href={`/blog/${createSlugWithId(post.title, post.id)}` as Route} key={post.id} className="rounded-lg flex flex-col gap-4">
                        <EventCoverImage cover={post.cover} title={post.title} />

                        <div className="flex flex-col gap-4">
                            <h2 className="text-2xl font-semibold mb-0">{post.title}</h2>
                            <div className="text-sm text-muted-foreground">{post.created_at ? new Date(post.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Дата неизвестна'}</div>
                            <div>
                                <Button variant="primary">
                                    Читать
                                </Button>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}