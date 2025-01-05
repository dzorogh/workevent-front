import React from 'react';
import { Api } from "@/lib/api"
import H1 from '@/components/ui/h1';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { createSlugWithId } from '@/lib/utils';

const getPosts = async () => {
    const response = await Api.GET('/v1/posts');
    return response.data;
}

export const revalidate = false;

export default async function BlogPage() {
    const posts = await getPosts();

    return (
        <div className="flex flex-col gap-10">
            <H1>Блог</H1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts?.data?.map(post => (
                    <Link href={`/blog/${createSlugWithId(post.title, post.id)}`} key={post.id} className="rounded-lg flex flex-col gap-4">
                        <div className="relative aspect-video w-full border-secondary border rounded-lg overflow-hidden bg-muted">
                            <Image src={post.cover} alt={post.title} sizes="500px" fill />
                        </div>
                        <div className="flex flex-col gap-4">
                            <h2 className="text-2xl font-semibold mb-0">{post.title}</h2>
                            <div className="text-sm text-muted-foreground">{new Date(post.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                            <div>
                                <Button variant="brand">
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