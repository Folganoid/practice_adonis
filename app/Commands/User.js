const { Command } = require('@adonisjs/ace');
const Database = use('Database');
const CustomMd5 = require('../Services/CustomMd5');

class User extends Command {
  static get signature() {
    return `user
    { username? : Name of the user }
    { email? : email }
    { role? : User role }
    { password? : User password }
    `;
  }

  static get description() {
    return 'Manual create user';
  }

  async handle(args, options) {
      console.log(CustomMd5.getPass('password'));
    const username = (!args.username) ? await this.ask('Enter user name') : args.username;
    const email = (!args.email) ? await this.ask('Enter user email') : args.email;

    let password;
    if (!args.password) {
        password = await this.ask('Enter password');
        const password2 = await this.ask('Confirm password');

        // check confirm
        if (password !== password2) {
            this.info("Passwords is don't match");
            return process.exit();
        }
    } else {
        password = args.password;
    }

    const createdAt = new Date();
    const role = (!args.role) ? await this.ask('Enter role', 'REGULAR') : args.role;

    const emailAlreadyExist = await Database.from('users').where('email', email);
    const usernameAlreadyExist = await Database.from('users').where('username', username);

    // check already exist user or email
    if (emailAlreadyExist.length > 0 || usernameAlreadyExist.length > 0) {
        this.info("Username or email already exist");
        return process.exit();
    }

    const userId = await Database.insert({
        username,
        email,
        password: CustomMd5.getPass(password),
        role,
        created_at: createdAt

    }).into('users').returning('id');

    await Database.insert({
        user_id: parseInt(userId),
        token: CustomMd5.generateToken(255),
        type: 'main',
        is_revoked: true,
        created_at: createdAt
    }).into('tokens').returning('id');

    this.info(`User ${username} created successfully`);
    return process.exit();
  }
}

module.exports = User;
