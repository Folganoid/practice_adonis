const { test, trait } = use('Test/Suite')('CRUD /Product router');

const User = use('App/Models/User');
const Token = use('App/Models/Token');

trait('Test/ApiClient');

const userName = 'TestUser';
const userRole = 'REGULAR';
const userEmail = 'test@test.ii';
const userPass = 'pass';
const userToken = '11111';
const userId = '100';

test('get list of posts', async ({ client }) => {

    await User.create({
        id: userId,
        username: userName,
        role: userRole,
        email: userEmail,
        password: userPass
    });

    await Token.create({
        token: userToken,
        user_id: userId,
        type: "test",
        is_revoked: true
    });

    const response = await client
        .post('/product')
        .send({
            token: userToken,
            name: "1",
            type: "1",
            price: "1",
            user_id: userId
        })
        .end();

    console.log(response.text);

});