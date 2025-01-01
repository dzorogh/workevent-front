import React from 'react';
import Api from '@/lib/api';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { compile, run } from '@mdx-js/mdx'
import * as runtime from 'react/jsx-runtime'
import Image from 'next/image'

const getPost = async (id: number) => {
    const response = await Api.GET(`/v1/posts/{post}`, {
        params: {
            path: {
                post: id,
            },
        },
    });
    return response.data;
}

export default async function BlogPostPage({ params }: { params: { post: string } }) {
    const post = await getPost(Number(params.post));

    // Compile the MDX source code to a function body
    const code = String(
        await compile(post?.data?.content ?? '', { outputFormat: 'function-body' })
    )

    // Run the compiled code with the runtime and get the default export
    const { default: Content } = await run(code, {
        ...runtime,
        baseUrl: import.meta.url,
    })

    return (
        <div className="flex flex-col gap-10">
            <div className="flex justify-between items-center">
                <Button variant="brand" asChild>
                    <Link href="/blog">
                        Назад к блогу
                    </Link>
                </Button>
            </div>

            <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg">
                <h1 className="text-4xl font-bold mb-4">{post?.data?.title}</h1>
                <p className="text-gray-600 mb-4">Опубликовано {new Date(post?.data?.created_at || '').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <div className="relative aspect-video w-full border-secondary border rounded-lg overflow-hidden bg-muted">
                    <Image src={post?.data?.cover || ''} alt="Blog Post" sizes="1600px" fill />
                </div>
                <div className="prose max-w-none text-md">
                    <Content />
                </div>
            </div>
        </div>
    );
}