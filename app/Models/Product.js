/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class Product extends Model {
  users() {
    return this.hasMany('App/Models/User');
  }

  types() {
    return this.hasMany('App/Models/Type');
  }
}

module.exports = Product;
