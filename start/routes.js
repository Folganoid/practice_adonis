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

//TODO delete this
Route.get('/users', async () => {
    return await Database.table('users').select('*');
});

// products
Route.get('/product', 'ProductController.getProduct');
Route.get('/product/:id', 'ProductController.getProductOne');
Route.put('/product', 'ProductController.updateProduct');
Route.post('/product', 'ProductController.addProduct');

// attributes
Route.get('/attribute/:productId', 'AttributeController.getAttribute');
Route.put('/attribute', 'AttributeController.updateAttribute');
Route.post('/attribute', 'AttributeController.addAttribute');
