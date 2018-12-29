/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class ProductAttributesSchema extends Schema {
  up() {
    this.create('product_attributes', table => {
      table.increments();
      table
        .integer('product_id')
        .unsigned()
        .references('id')
        .inTable('products');
      table
        .integer('attribute_id')
        .unsigned()
        .references('id')
        .inTable('attributes');
      table.string('value', 255).notNullable();
    });
  }

  down() {
    this.drop('product_attributes');
  }
}

module.exports = ProductAttributesSchema;
