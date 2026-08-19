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
import { Metadata } from 'next';
import { truncateText } from '@/lib/utils';
import removeMarkdown from "remove-markdown";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { JsonLd } from '@/lib/seo/jsonld';
import { buildArticleJsonLd, buildBreadcrumbJsonLd, buildFaqPageJsonLd } from '@/lib/seo/jsonld-builders';
import { buildMetadata } from '@/lib/seo/metadata';
import { SITE_URL } from '@/lib/seo/constants';
import { extractFaqFromMarkdown } from '@/lib/seo/faq';

type Props = {
    params: Promise<{ post: string }>
};

export const revalidate = 1800;

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { post } = await params;
    const postData = await getPost(Number(getIdFromSlug(post)));

    if (!postData?.data) {
        return { title: 'Статья не найдена — Workevent' };
    }

    const slug = createSlugWithId(postData.data.title, postData.data.id);
    const description = truncateText(removeMarkdown(postData.data.content ?? ''), 150);

    return buildMetadata(null, {
        title: `${postData.data.title} — Workevent`,
        description,
        canonicalPath: `/blog/${slug}`,
        openGraph: {
            type: 'article',
            title: postData.data.title,
            description,
            url: `${SITE_URL}/blog/${slug}`,
            images: postData.data.cover ? [{ url: postData.data.cover }] : undefined,
        },
        twitter: {
            title: postData.data.title,
            description,
            images: postData.data.cover ? [postData.data.cover] : undefined,
        },
    });
}

export default async function BlogPostPage({ params }: { params: Promise<{ post: string }> }) {
    const { post } = await params;
    const postData = await getPost(Number(getIdFromSlug(post)));

    if (!postData?.data) {
        notFound();
    }

    const correctSlug = createSlugWithId(postData.data.title, postData.data.id);
    if (post !== correctSlug) {
        permanentRedirect(`/blog/${correctSlug}`);
    }

    const code = String(
        await compile(postData.data.content ?? '', { outputFormat: 'function-body' })
    )

    const { default: Content } = await run(code, {
        ...runtime,
        baseUrl: import.meta.url,
    })

    const createdAt = postData.data.created_at ? new Date(postData.data.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
    const postUrl = `${SITE_URL}/blog/${correctSlug}`;
    const faqJsonLd = buildFaqPageJsonLd(extractFaqFromMarkdown(postData.data.content));

    return (
        <div className="flex flex-col gap-10">
            <JsonLd
                data={[
                    buildArticleJsonLd(postData.data),
                    buildBreadcrumbJsonLd([
                        { name: 'Главная', url: SITE_URL },
                        { name: 'Блог', url: `${SITE_URL}/blog` },
                        { name: postData.data.title, url: postUrl },
                    ]),
                    ...(faqJsonLd ? [faqJsonLd] : []),
                ]}
            />

            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Главная</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/blog">Блог</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{postData.data.title}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex justify-between items-center">
                <Button variant="primary" asChild>
                    <Link href="/blog">
                        Назад к блогу
                    </Link>
                </Button>
            </div>

            <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg flex flex-col gap-4">
                <H1 className="">{postData.data.title}</H1>
                <div className="text-sm text-muted-foreground">Опубликовано {createdAt}</div>
                <Image
                    src={postData.data.cover}
                    alt={postData.data.title}
                    className="aspect-video object-contain border-secondary border rounded-lg overflow-hidden bg-muted"
                    width={800}
                    height={450}
                    sizes="(max-width: 768px) 100vw, 800px"
                    priority
                />
                <div className="prose max-w-none text-md">
                    <Content />
                </div>
            </div>
        </div>
    );
}
