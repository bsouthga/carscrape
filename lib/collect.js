import edmunds from './api';
import args    from 'yargs';

// example
edmunds(require('./credentials.json'))
  .get('inventory/v2/inventories', {
    zipcode: 94062,
    make:    'BMW',
    model:   'i3',
    status:  'new'
  })
  .then(data => console.log(data))
  .catch(err => console.log(err.stack));
