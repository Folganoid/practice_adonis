/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class AttributeSchema extends Schema {
  up() {
    this.create('attributes', table => {
      table.increments();
      table.string('name', 50).notNullable();
      table.string('value', 50).notNullable();
      table
        .integer('product_id')
        .unsigned()
        .references('id')
        .inTable('products');
      table.timestamps();
    });
  }

  down() {
    this.drop('attributes');
  }
}

module.exports = AttributeSchema;
