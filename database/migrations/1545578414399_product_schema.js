/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class ProductSchema extends Schema {
  up() {
    this.create('products', table => {
      table.increments();
      table.string('name', 255).notNullable();
      table
        .integer('type_id')
        .unsigned()
        .references('id')
        .inTable('types');
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users');
      table.timestamps();
    });
  }

  down() {
    this.drop('products');
  }
}

module.exports = ProductSchema;
