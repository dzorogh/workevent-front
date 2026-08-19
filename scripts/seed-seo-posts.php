#!/usr/bin/env php
<?php
/**
 * @deprecated Use content/*.md and npm run content:apply. This script is a fallback only.
 *
 * Bulk upsert blog posts (App\Models\Post) from JSON seed file.
 *
 * Usage (inside Laravel / backend container):
 *   php /tmp/seed-seo-posts.php /tmp/posts-seed.json
 *   LARAVEL_ROOT=/var/www/html php scripts/seed-seo-posts.php ./seo/posts-seed.json
 *
 * Public POST /api/v1/posts is 405 — write via this script, not the API.
 *
 * Table `posts`: id, title, content, user_id, created_at, updated_at, deleted_at.
 * No slug / published columns. Cover is Spatie media collection `cover`.
 *
 * Environment:
 *   LARAVEL_ROOT — Laravel app path (default: cwd, then /var/www/html)
 *   SEED_POST_USER_ID — author user id (default: donor post user or 1)
 */

declare(strict_types=1);

use App\Models\Post;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

function bootstrapLaravel(): void
{
    $candidates = array_filter([
        getenv('LARAVEL_ROOT') ?: null,
        getcwd() ?: null,
        '/var/www/html',
    ]);

    foreach ($candidates as $root) {
        if (is_file($root . '/artisan')) {
            require $root . '/vendor/autoload.php';
            $app = require $root . '/bootstrap/app.php';
            $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
            return;
        }
    }

    fwrite(STDERR, "Laravel root not found. Set LARAVEL_ROOT or cd to backend directory.\n");
    exit(1);
}

function resolveAuthorId(): int
{
    $fromEnv = getenv('SEED_POST_USER_ID');
    if ($fromEnv !== false && $fromEnv !== '' && ctype_digit((string) $fromEnv)) {
        return (int) $fromEnv;
    }

    $fromPost = Post::query()->whereNotNull('user_id')->value('user_id');
    if ($fromPost) {
        return (int) $fromPost;
    }

    $firstUser = User::query()->orderBy('id')->value('id');
    if ($firstUser) {
        return (int) $firstUser;
    }

    fwrite(STDERR, "No user_id for posts. Set SEED_POST_USER_ID.\n");
    exit(1);
}

function donorCoverPost(?int $exceptId = null): ?Post
{
    return Post::query()
        ->when($exceptId, fn ($q) => $q->where('id', '!=', $exceptId))
        ->whereHas('media', fn ($q) => $q->where('collection_name', 'cover'))
        ->orderByDesc('id')
        ->first();
}

function ensureCover(Post $post, ?string $coverUrl): void
{
    if ($post->getFirstMedia('cover')) {
        return;
    }

    $donor = donorCoverPost($post->id);
    $media = $donor?->getFirstMedia('cover');
    if ($media) {
        $media->copy($post, 'cover');
        return;
    }

    if ($coverUrl) {
        $post->addMediaFromUrl($coverUrl)->toMediaCollection('cover');
    }
}

function upsertPost(string $title, string $content, ?string $coverUrl, int $userId): Post
{
    if (!Auth::check()) {
        Auth::loginUsingId($userId);
    }

    $post = Post::query()->where('title', $title)->first();
    if ($post) {
        $post->content = $content;
        $post->save();
    } else {
        $post = Post::query()->create([
            'title' => $title,
            'content' => $content,
        ]);
    }

    ensureCover($post->fresh(), $coverUrl);

    return $post->fresh();
}

bootstrapLaravel();

$jsonPath = $argv[1] ?? null;
if (!$jsonPath || !is_file($jsonPath)) {
    fwrite(STDERR, "Usage: php seed-seo-posts.php /path/to/posts-seed.json\n");
    exit(1);
}

$seed = json_decode(file_get_contents($jsonPath), true, 512, JSON_THROW_ON_ERROR);
$posts = $seed['posts'] ?? [];
if ($posts === []) {
    fwrite(STDERR, "No posts[] in seed file.\n");
    exit(1);
}

$userId = resolveAuthorId();
if (!User::query()->whereKey($userId)->exists()) {
    fwrite(STDERR, "User {$userId} not found.\n");
    exit(1);
}

Auth::loginUsingId($userId);

$upserted = 0;
foreach ($posts as $entry) {
    $title = trim((string) ($entry['title'] ?? ''));
    $content = trim((string) ($entry['content'] ?? ''));
    if ($title === '' || $content === '') {
        echo "SKIP: empty title or content\n";
        continue;
    }

    $coverUrl = isset($entry['coverUrl']) && is_string($entry['coverUrl']) && $entry['coverUrl'] !== ''
        ? $entry['coverUrl']
        : null;

    $post = upsertPost($title, $content, $coverUrl, $userId);
    $cover = $post->getFirstMediaUrl('cover');
    echo "OK post id={$post->id} cover=" . ($cover !== '' ? 'yes' : 'no') . " title={$title}\n";
    $upserted++;
}

echo "Done. Upserted {$upserted} posts.\n";
