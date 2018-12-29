// check user token and role
const Database = use('Database');

/**
 * check if admin
 *
 * @param token
 * @returns {Promise<boolean>}
 */
async function checkAdmin(token) {

    try {
        const isadmin = await Database.table('users')
            .select('users.id', 'users.role')
            .innerJoin('tokens', 'tokens.user_id', 'users.id')
            .where('tokens.token', token);

        if (isadmin[0].role === "ADMIN") {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        return false;
    }
}

/**
 * check owner
 *
 * @param token
 * @param prodId
 * @returns {Promise<boolean>}
 */
async function checkProductOwner(token, prodId) {
    try {
        const isowner = await Database.table('products')
            .select('products.id as product_id', 'users.id as user_id')
            .innerJoin('users', 'users.id', 'products.user_id')
            .innerJoin('tokens', 'tokens.user_id', 'users.id')
            .where('tokens.token', token)
            .where('products.id', prodId);

        if (isowner.length === 0) {
            return false;
        } else {
            return true;
        }
    } catch (e) {
        return false;
    }
}

async function checkAttributeOwner(token, attrId) {
    try {
        const isowner = await Database.table('product_attributes')
            .select('product_attributes.id')
            .innerJoin('products', 'products.id', 'product_attributes.product_id')
            .innerJoin('users', 'users.id', 'products.user_id')
            .innerJoin('tokens', 'tokens.user_id', 'users.id')
            .where('product_attributes.id', attrId)
            .where('tokens.token', token);

        if (isowner.length === 0) {
            return false;
        } else {
            return true;
        }
    } catch (e) {
        return false;
    }
}

module.exports.checkAdmin = checkAdmin;
module.exports.checkProductOwner = checkProductOwner;
module.exports.checkAttributeOwner = checkAttributeOwner;
