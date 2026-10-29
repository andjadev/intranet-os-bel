import * as migration_20261028_150130_initial from './20261028_150130_initial';
import * as migration_20261029_144757_password_login from './20261029_144757_password_login';

export const migrations = [
  {
    up: migration_20261028_150130_initial.up,
    down: migration_20261028_150130_initial.down,
    name: '20261028_150130_initial',
  },
  {
    up: migration_20261029_144757_password_login.up,
    down: migration_20261029_144757_password_login.down,
    name: '20261029_144757_password_login'
  },
];
