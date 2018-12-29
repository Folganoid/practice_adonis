/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class AttributeSchema extends Schema {
  up() {
    this.create('attributes', table => {
      table.increments();
      table.string('name', 255).notNullable();
      table
        .integer('type_id')
        .unsigned()
        .references('id')
        .inTable('types');
    });
  }

  down() {
    this.drop('attributes');
  }
}

module.exports = AttributeSchema;
