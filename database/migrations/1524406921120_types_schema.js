/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class TypesSchema extends Schema {
  up() {
    this.create('types', table => {
      table.increments();
      table.string('name', 255).notNullable();
    });
  }

  down() {
    this.drop('types');
  }
}

module.exports = TypesSchema;
