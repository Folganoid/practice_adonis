/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.0/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route');
const Database = use('Database');

Route.get('/', () => ({ status: 'Ok', version: '1.0.0' }));

Route.get('/test', async () => {
    return await Database.table('users').select('*');
});

Route.post('/login', 'AuthController.login');
