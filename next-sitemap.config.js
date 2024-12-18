/** @type {import('next-sitemap').IConfig} */
// import { createEventSlug } from './src/lib/globalUtils.mjs';
const { createEventSlug } = require('./src/lib/globalUtils.js');

module.exports = {
    siteUrl: 'https://workevent.ru',
    generateRobotsTxt: true,
    transform: async (config, path) => {
        if (path.includes('/event/')) {
            const eventId = path.split('/event/')[1]
            const event = await fetch(`https://admin.workevent.ru/api/v1/events/${eventId}`)
            const eventData = await event.json()
            const eventTitle = eventData.data.title
            const slug = createEventSlug(eventTitle, eventId)
            return {
                loc: `https://workevent.ru/event/${slug}`,
                changefreq: config.changefreq,
                priority: config.priority,
                lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
            }
        }

        return {
            loc: path,
            changefreq: config.changefreq,
            priority: config.priority,
            lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
            alternateRefs: config.alternateRefs ?? [],
        }
    },
}