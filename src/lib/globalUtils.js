// import slugify from 'slugify';

const slugify = require('slugify');

function createEventSlug(title, id) {
  slugify.extend({
    'й': 'y',
    'Й': 'Й',
  })

  return `${slugify(title, {
    lower: true,
    replacement: '-',
    trim: true,
    strict: true,
    locale: 'ru',
  }).slice(0, 60)}-${id}`;
}

module.exports = {
  createEventSlug
}