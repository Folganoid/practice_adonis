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

// test
Route.get('/', () => ({ status: 'Ok', version: '1.0.0' }));

// products
Route.get('/product', 'ProductController.getProduct');
Route.get('/product/:id', 'ProductController.getProductOne');
Route.post('/product', 'ProductController.addProduct');
Route.put('/product/:id', 'ProductController.updateProduct');
Route.delete('/product/:id', 'ProductController.deleteProduct');

// attributes
Route.get('/attribute/:productId', 'AttributeController.getAttribute');
Route.post('/attribute/:id', 'AttributeController.addAttribute');
Route.put('/attribute/:id', 'AttributeController.updateAttribute');
Route.delete('/attribute/:id', 'AttributeController.deleteAttribute');
