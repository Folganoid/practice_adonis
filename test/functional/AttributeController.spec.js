const { test, trait } = use('Test/Suite')('CRUD /attribute router');

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

const testValue = '9999999999.99';
const testValue2 = '888.88';
const testValue3 = '7777';

test('POST, GET, DELETE attributes', async ({ client, assert }) => {

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
    try {

        let strId = await Database.table('types').select('id').where('name', "string");
        let intId = await Database.table('types').select('id').where('name', "integer");

        if (strId.length === 0) {
            await Database.table('types').insert({name: "string"});
        }
        if (intId.length === 0) {
            await Database.table('types').insert({name: "integer"});
        }
    } catch(e) {}

    // create product with attributes through POST-request
    await client
        .post('/product')
        .send({
            token: userToken,
            name: "testProduct",
            type: "testType",
            price: testValue
        })
        .end();

    // get and check attributes exist
    let productId = await Database.table('products')
        .select('*')
        .where('name', "testProduct");
    productId = productId[0].id

    // create single attribute
    await client
        .post('/attribute/'+ productId)
        .send({
            token: userToken,
            name: "test",
            value: testValue2
        })
        .end();

    // get and check attributes exist
    let attributes = await Database.table('product_attributes')
        .select('*')
        .whereIn('value', [testValue2, testValue]);

    let check1 = (attributes.length === 2);

    let attribute1Id = attributes[0].id;
    let attribute2Id = attributes[1].id;

    let check2 = (attribute1Id !== attribute2Id);

    await client
        .put('/attribute/'+ attribute1Id)
        .send({
            token: userToken,
            productId: productId,
            value: testValue3
        })
        .end();

    // get and check attributes exist
    attributes = await Database.table('product_attributes')
        .select('*')
        .where('value', testValue3);

    let check3 = (attributes.length === 1);


    await Database
        .table('product_attributes')
        .where('product_id', productId)
        .delete();

    await Database
        .table('attributes')
        .whereIn('id', [attribute1Id, attribute2Id])
        .delete();

    // delete test product
    await Database
        .table('products')
        .where('id', productId)
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