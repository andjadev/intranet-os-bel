import * as migration_20261029_144754_initial from './20261029_144754_initial';
import * as migration_20261030_145933_link_categories from './20261030_145933_link_categories';
import * as migration_20261030_145951_drop_link_group from './20261030_145951_drop_link_group';

export const migrations = [
  {
    up: migration_20261029_144754_initial.up,
    down: migration_20261029_144754_initial.down,
    name: '20261029_144754_initial',
  },
  {
    up: migration_20261030_145933_link_categories.up,
    down: migration_20261030_145933_link_categories.down,
    name: '20261030_145933_link_categories',
  },
  {
    up: migration_20261030_145951_drop_link_group.up,
    down: migration_20261030_145951_drop_link_group.down,
    name: '20261030_145951_drop_link_group'
  },
];
