const { test, trait } = use('Test/Suite')('CRUD /Product router');

const User = use('App/Models/User');
const Token = use('App/Models/Token');
const Database = use('Database');

trait('Test/ApiClient');

const userName = 'TestUser';
const userRole = 'REGULAR';
const userEmail = 'test@test.test';
const userPass = 'pass';
const userToken = '111';
const userId = '100';

test('PUT & DELETE product', async ({ client, assert }) => {

    // create test user
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

    // create types integer & string if nit exist
    let strId = await Database.table('types').select('id').where('name', "string");
    let intId = await Database.table('types').select('id').where('name', "integer");

    if (strId.length === 0) {
        await Database.table('types').insert({name: "string"});
    }
    if (intId.length === 0) {
        await Database.table('types').insert({name: "integer"});
    }

    // create product through POST-request
    await client
        .post('/product')
        .send({
            token: userToken,
            name: "testProduct",
            type: "testType",
            testAttribute: "111test111"
        })
        .end();

    // define id
    let productId = await client
        .get('/product?filterName=testProduct')
        .end();
    productId = JSON.parse(productId.text);
    productId = productId[3].product[0].id;

    // change product name
    await client
        .put('/product/' + productId)
        .send({
            token: userToken,
            name: "testProduct222"
        })
        .end();

    // check updated product name
    let productGet = await client
        .get('/product/' + productId)
        .end();
    productGet = JSON.parse(productGet.text);
    let check1 = (productGet[3].product[0].name === "testProduct222");

    let productDelete = await client
        .delete('/product/' + productId)
        .send({token: userToken})
        .end();

    // check delete product
    productGet = await client
        .get('/product/' + productId)
        .end();
    productGet = JSON.parse(productGet.text);
    let check2 = (productGet);
    check2 = (check2[3].product.length === 0);

    // check product attributes
    let check3 = await Database.table('product_attributes')
        .select('*')
        .where('product_id', productId);
    check3 = (check3.length === 0);

    //delete test attributes
    await Database
        .table('attributes')
        .where('name', 'LIKE', 'testAttribute%')
        .delete();

    //delete test type
    await Database
        .table('types')
        .where('name', 'LIKE', 'testType')
        .delete();

    // delete test user
    await Database
        .table('tokens')
        .where('token', userToken)
        .delete();
    await Database
        .table('users')
        .where('id', userId)
        .delete();

    // final check
    assert.isTrue(
        check1 && check2 && check3
    );
});