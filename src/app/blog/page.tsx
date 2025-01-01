import React from 'react';
import Api from '@/lib/api';
import H1 from '@/components/ui/h1';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const getPosts = async () => {
    const response = await Api.GET('/v1/posts');
    return response.data;
}

export default async function BlogPage() {
    const posts = await getPosts();

    return (
        <div className="flex flex-col gap-10">
            <H1>Блог</H1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts?.data?.map(post => (
                    <Link href={`/blog/${post.id}`} key={post.id} className="rounded-lg flex flex-col gap-4">
                        <img src={post.cover} alt={post.title} className="w-full aspect-video object-cover rounded-lg" />
                        <div className="">
                            <h2 className="text-2xl font-semibold mb-2">{post.title}</h2>
                            <p className="text-gray-600 mb-4">{post.content}</p>
                            <p className="text-gray-500 mb-4">Опубликовано {new Date(post.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            <Button variant="brand">
                                Читать далее
                            </Button>
                        </div>
                    </Link>  
                ))}
            </div>
        </div>
    );
}