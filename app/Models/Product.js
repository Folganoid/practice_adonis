/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Product extends Model {

    attributes() {
        return this.hasMany('App/Models/Attribute');
    }

}

module.exports = Product;
