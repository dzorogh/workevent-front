import React from 'react';
import { Api } from "@/lib/api"
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { compile, run } from '@mdx-js/mdx'
import * as runtime from 'react/jsx-runtime'
import Image from 'next/image'
import { getIdFromSlug, createSlugWithId } from '@/lib/utils';
import { notFound, permanentRedirect } from 'next/navigation';
import H1 from '@/components/ui/h1';

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

export default async function BlogPostPage({ params }: { params: Promise<{ post: string }> }) {
    const { post } = await params;
    const postData = await getPost(Number(getIdFromSlug(post)));

    if (!postData) {
        notFound();
    }

    const correctSlug = createSlugWithId(postData.data.title, postData.data.id);
    if (post !== correctSlug) {
        permanentRedirect(`/blog/${correctSlug}`);
    }

    // Compile the MDX source code to a function body
    const code = String(
        await compile(postData?.data?.content ?? '', { outputFormat: 'function-body' })
    )

    // Run the compiled code with the runtime and get the default export
    const { default: Content } = await run(code, {
        ...runtime,
        baseUrl: import.meta.url,
    })

    const createdAt = postData?.data?.created_at ? new Date(postData.data.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

    return (
        <div className="flex flex-col gap-10">
            <div className="flex justify-between items-center">
                <Button variant="brand" asChild>
                    <Link href="/blog">
                        Назад к блогу
                    </Link>
                </Button>
            </div>

            <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg flex flex-col gap-4">
                <H1 className="">{postData?.data?.title}</H1>
                <div className="text-sm text-muted-foreground">Опубликовано {createdAt}</div>
                <div className="relative aspect-video w-full border-secondary border rounded-lg overflow-hidden bg-muted">
                    <Image src={postData?.data?.cover || ''} alt="Blog Post" sizes="1600px" fill />
                </div>
                <div className="prose max-w-none text-md">
                    <Content />
                </div>
            </div>
        </div>
    );
}