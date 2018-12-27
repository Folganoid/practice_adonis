'use strict'

const { test } = use('Test/Suite')('Command "user" functionality test');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const Database = use('Database');
const Suite = use('Test/Suite')('trash cleaner');
const { after } = Suite;

const userName = 'TestRegularUser';
const userRole = 'REGULAR';
const userEmail = 'test@test.test';
const userPass = 'pass';

let userId;
let userToken;

test('create regular user test', async ({ assert }) => {
    const { stdout, stderr } = await exec(`adonis user ${userName} ${userEmail} ${userRole} ${userPass}`);
    assert.isTrue(stdout.indexOf("User TestRegularUser created successfully") > -1 );
});

test('check test user and token', async ({ assert }) => {

    const user = await Database
        .table('users')
        .select('users.id', 'users.username', 'users.email', 'users.role', 'tokens.token')
        .innerJoin('tokens', 'users.id', 'tokens.user_id')
        .where('users.username', `${userName}`)
        .where('users.email', `${userEmail}`)
        .where('users.role', `${userRole}`);

    userId = user[0].id;
    userToken = user[0].token;

    assert.isTrue(
        user[0].username === userName &&
        user[0].email === userEmail &&
        user[0].role === userRole &&
        user[0].token.length === 255
    );
});

// delete user
after(async () => {
    await Database.table('tokens').where('token', userToken).delete();
    await Database.table('users').where('id', userId).delete();
});

