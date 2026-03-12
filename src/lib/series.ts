import type { CollectionEntry } from 'astro:content';

export function slugifySeries(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

export function getSeriesGroups(posts: CollectionEntry<'posts'>[]) {
    const groups = new Map<string, { name: string; posts: CollectionEntry<'posts'>[] }>();

    for (const post of posts) {
        if (!post.data.series) continue;
        const slug = slugifySeries(post.data.series.name);
        if (!groups.has(slug)) {
            groups.set(slug, { name: post.data.series.name, posts: [] });
        }
        groups.get(slug)!.posts.push(post);
    }

    for (const group of groups.values()) {
        group.posts.sort((a, b) => a.data.series!.order - b.data.series!.order);
    }

    return groups;
}
