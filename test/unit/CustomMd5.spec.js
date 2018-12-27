'use strict'

const { test } = use('Test/Suite')('CustomMd5 Servise test');
const CustomMd5 = use('App/Services/CustomMd5');

test('validate password generator', async ({ assert }) => {
    const validation = await CustomMd5.getPass("qwerty");
    assert.isTrue(typeof validation === "string" && validation.length === 32);
});

test('compare passwords true', async ({ assert }) => {
    const validation = await CustomMd5.compare("qwerty", "d8578edf8458ce06fbc5bb76a58c5ca4");
    assert.isTrue(validation);
});

test('compare passwords false', async ({ assert }) => {
    const validation = await CustomMd5.compare("qwerty", "qwerty");
    assert.isFalse(validation);
});

test('generate random token', async ({ assert }) => {
    const validation = await CustomMd5.generateToken(255);
    assert.isTrue(validation.length === 255 && typeof validation === "string");
});


