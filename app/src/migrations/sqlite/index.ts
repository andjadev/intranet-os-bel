import * as migration_20261028_150130_initial from './20261028_150130_initial';
import * as migration_20261029_144757_password_login from './20261029_144757_password_login';
import * as migration_20261030_145939_link_categories from './20261030_145939_link_categories';
import * as migration_20261030_145956_drop_link_group from './20261030_145956_drop_link_group';

export const migrations = [
  {
    up: migration_20261028_150130_initial.up,
    down: migration_20261028_150130_initial.down,
    name: '20261028_150130_initial',
  },
  {
    up: migration_20261029_144757_password_login.up,
    down: migration_20261029_144757_password_login.down,
    name: '20261029_144757_password_login',
  },
  {
    up: migration_20261030_145939_link_categories.up,
    down: migration_20261030_145939_link_categories.down,
    name: '20261030_145939_link_categories',
  },
  {
    up: migration_20261030_145956_drop_link_group.up,
    down: migration_20261030_145956_drop_link_group.down,
    name: '20261030_145956_drop_link_group'
  },
];
