import * as migration_20261029_144754_initial from './20261029_144754_initial';
import * as migration_20261030_145933_link_categories from './20261030_145933_link_categories';
import * as migration_20261030_145951_drop_link_group from './20261030_145951_drop_link_group';
import * as migration_20261102_110628_slava_category_icon from './20261102_110628_slava_category_icon';
import * as migration_20261102_112631_link_files from './20261102_112631_link_files';
import * as migration_20261102_151038_storage_fields from './20261102_151038_storage_fields';

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
    name: '20261030_145951_drop_link_group',
  },
  {
    up: migration_20261102_110628_slava_category_icon.up,
    down: migration_20261102_110628_slava_category_icon.down,
    name: '20261102_110628_slava_category_icon',
  },
  {
    up: migration_20261102_112631_link_files.up,
    down: migration_20261102_112631_link_files.down,
    name: '20261102_112631_link_files',
  },
  {
    up: migration_20261102_151038_storage_fields.up,
    down: migration_20261102_151038_storage_fields.down,
    name: '20261102_151038_storage_fields'
  },
];
