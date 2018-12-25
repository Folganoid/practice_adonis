/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class Product extends Model {

    attributes() {
        return this.hasMany('App/Models/Attribute');
    }

    users() {
        return this.hasMany('App/Models/User');
    }

}

module.exports = Product;
