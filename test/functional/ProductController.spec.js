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