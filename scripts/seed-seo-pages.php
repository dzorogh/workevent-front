#!/usr/bin/env php
<?php
/**
 * Bulk upsert SEO landing pages (city + industry + schedule) from JSON seed file.
 *
 * Usage (inside Laravel / backend container):
 *   php scripts/seed-seo-pages.php /var/www/html/../pages-seed-priority.json
 *   php scripts/seed-seo-pages.php ./seo/pages-seed-priority.json
 *
 * Environment:
 *   LARAVEL_ROOT — path to Laravel app (default: current working directory)
 */

declare(strict_types=1);

use App\Models\City;
use App\Models\Industry;
use App\Models\Page;
use Illuminate\Support\Str;

function bootstrapLaravel(): void
{
    $root = getenv('LARAVEL_ROOT') ?: getcwd();
    if (!is_file($root . '/artisan')) {
        fwrite(STDERR, "Laravel root not found. Set LARAVEL_ROOT or cd to backend directory.\n");
        exit(1);
    }

    require $root . '/vendor/autoload.php';
    $app = require_once $root . '/bootstrap/app.php';
    $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
}

function cityPath(City $city): string
{
    $slug = Str::slug($city->title, '-', 'ru');
    $slug = mb_substr($slug, 0, 60);
    $slug = rtrim($slug, '-');

    return '/city/' . $slug . '-' . $city->id;
}

function upsertPage(string $path, string $title, string $content, array $metadata): Page
{
    $page = Page::query()->updateOrCreate(
        ['path' => $path],
        [
            'title' => $title,
            'content' => $content,
        ],
    );

    $page->metadata()->updateOrCreate(
        [],
        [
            'title' => $metadata['title'] ?? null,
            'h1' => $metadata['h1'] ?? null,
            'description' => $metadata['description'] ?? null,
            'keywords' => $metadata['keywords'] ?? null,
            'robots' => $metadata['robots'] ?? 'index,follow',
            'canonical_url' => $metadata['canonicalUrl'] ?? null,
        ],
    );

    return $page->fresh('metadata');
}

function resolveCities(array $seedCityTitles): \Illuminate\Support\Collection
{
    $byTitle = City::query()
        ->whereIn('title', $seedCityTitles)
        ->get()
        ->keyBy('title');

    $ordered = collect();
    foreach ($seedCityTitles as $title) {
        if ($byTitle->has($title)) {
            $ordered->push($byTitle->get($title));
        }
    }

    if ($ordered->count() >= 8) {
        return $ordered->take(8);
    }

    $extra = City::query()
        ->withCount(['events as active_events_count' => function ($query) {
            $query->active();
        }])
        ->orderByDesc('active_events_count')
        ->orderBy('title')
        ->whereNotIn('id', $ordered->pluck('id'))
        ->limit(8 - $ordered->count())
        ->get();

    return $ordered->merge($extra)->take(8);
}

bootstrapLaravel();

$jsonPath = $argv[1] ?? null;
if (!$jsonPath || !is_file($jsonPath)) {
    fwrite(STDERR, "Usage: php seed-seo-pages.php /path/to/pages-seed-priority.json\n");
    exit(1);
}

$seed = json_decode(file_get_contents($jsonPath), true, 512, JSON_THROW_ON_ERROR);
$pages = $seed['pages'] ?? [];
$created = 0;

$cityTitles = collect($pages)
    ->where('type', 'city')
    ->pluck('cityTitle')
    ->filter()
    ->values()
    ->all();

$cities = resolveCities($cityTitles);
$cityByTitle = $cities->keyBy('title');

foreach ($pages as $entry) {
    if (($entry['type'] ?? '') === 'city') {
        $cityTitle = $entry['cityTitle'] ?? null;
        if (!$cityTitle || !$cityByTitle->has($cityTitle)) {
            echo "SKIP city (not in DB): {$cityTitle}\n";
            continue;
        }

        $city = $cityByTitle->get($cityTitle);
        $path = cityPath($city);
        upsertPage($path, $entry['title'], $entry['content'], $entry['metadata'] ?? []);
        echo "OK city: {$path}\n";
        $created++;
        continue;
    }

    if (($entry['type'] ?? '') === 'industry') {
        $slug = $entry['industrySlug'] ?? null;
        if (!$slug) {
            echo "SKIP industry: missing slug\n";
            continue;
        }

        $industry = Industry::query()->where('slug', $slug)->first();
        if (!$industry) {
            echo "SKIP industry (not in DB): {$slug}\n";
            continue;
        }

        $path = '/industry/' . $slug;
        upsertPage($path, $entry['title'], $entry['content'], $entry['metadata'] ?? []);
        echo "OK industry: {$path}\n";
        $created++;
        continue;
    }

    if (($entry['type'] ?? '') === 'schedule') {
        $path = $entry['path'] ?? null;
        if (!$path || !str_starts_with($path, '/schedule/')) {
            echo "SKIP schedule: missing or invalid path\n";
            continue;
        }

        $industrySlug = $entry['industrySlug'] ?? null;
        if ($industrySlug && !Industry::query()->where('slug', $industrySlug)->exists()) {
            echo "SKIP schedule (industry not in DB): {$path}\n";
            continue;
        }

        upsertPage($path, $entry['title'], $entry['content'], $entry['metadata'] ?? []);
        echo "OK schedule: {$path}\n";
        $created++;
    }
}

echo "Done. Upserted {$created} pages.\n";
