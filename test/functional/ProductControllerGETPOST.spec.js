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

const testValue = '9999999999.99';

test('POST & GET product', async ({ client, assert }) => {

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
    let responsePost = await client
        .post('/product')
        .send({
            token: userToken,
            name: "testProduct",
            type: "testType",
            price: testValue,
            weight: testValue,
            testAttribute1: testValue,
            testAttribute2: testValue,
            testAttribute3: testValue
        })
        .end();

    responsePost = JSON.parse(responsePost.text);

    let productGet = await client
        .get('/product?filterName=testProduct')
        .end();

    productGet = JSON.parse(productGet.text);

    // // response example
    // [
    //     {"ok":true},
    //     {"code":200},
    //     {"message":""},
    //     {"product":[
    //         {
    //             "id":42,
    //             "name":"testProduct",
    //             "typeName":"test",
    //             "created_at":"2018-12-30T12:11:40.322Z",
    //             "username":"TestUser",
    //             "attributes":[
    //                 {
    //                     "id":104,
    //                     "name":"price",
    //                     "value":"99.99",
    //                     "productId":42,
    //                     "typeName":"integer"},
    //                 {
    //                     "id":105,
    //                     "name":"weight",
    //                     "value":"1000",
    //                     "productId":42,
    //                     "typeName":"integer"},
    //                 {
    //                     "id":106,
    //                     "name":"testAttribute1",
    //                     "value":"alpha",
    //                     "productId":42,
    //                     "typeName":"string"},
    //                 {
    //                     "id":107,
    //                     "name":"testAttribute2",
    //                     "value":"beta",
    //                     "productId":42,
    //                     "typeName":"string"},
    //                 {
    //                     "id":108,
    //                     "name":"testAttribute3",
    //                     "value":"charlie",
    //                     "productId":42,
    //                     "typeName":"string"}
    //             ]
    //         }
    //     ]}
    // ]

    let check = false;

    try {
        check = (
            responsePost[0].ok === true &&
            responsePost[1].code === 200 &&

            productGet[0].ok === true &&
            productGet[1].code === 200 &&
            productGet[3].product[0].name === 'testProduct' &&
            productGet[3].product[0].username === userName &&
            productGet[3].product[0].attributes.length === 5 &&

            productGet[3].product[0].attributes[0].value === testValue &&
            productGet[3].product[0].attributes[1].value === testValue &&
            productGet[3].product[0].attributes[2].value === testValue &&
            productGet[3].product[0].attributes[3].value === testValue &&
            productGet[3].product[0].attributes[4].value === testValue
        );
    } catch (err) {}



    //delete test product_attributes
    await Database
        .table('product_attributes')
        .where('value', testValue)
        .delete();

    //delete test attributes
    await Database
        .table('attributes')
        .where('name', 'LIKE', 'testAttribute%')
        .delete();

    // delete test product
    await Database
        .table('products')
        .where('name', 'LIKE', 'testProduct')
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
        check
    );

});