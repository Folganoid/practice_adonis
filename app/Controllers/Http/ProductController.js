/*
 ## GET
 localhost:3333/product/1   - get one product by id

 localhost:3333/product?
 filterAuthor=user2&
 filterType=mus&
 filterName=a&
 orderBy=price&
 orderDir=desc
 (or variations without)    - get filtered and sorted products by params

 ##POST
 localhost:3333/product?token=Ji4da..&name=vine&type=food&price=23.13   - create product

 ##PUT
 localhost:3333/product/1?token=Ji4da..&price=23.13                     - update product params

 ##DELETE
 localhost:3333/product/1?token=Ji4da..                                 - delete product by id

*/

const Database = use('Database');
const Check = require('../../Services/CheckUserRights');

class ProductController {

    /**
     * get several products
     *
     * @param request
     * @returns {Promise<{key: number}[]>}
     */
    async getProduct({ request }) {
        let ok = true;
        let code = 200;
        let message = "";
        let prod = [];
        const filterName = (request._all.filterName !== undefined) ? request._all.filterName : "%";
        const filterAuthor = (request._all.filterAuthor !== undefined) ? request._all.filterAuthor : "%";
        const filterType = (request._all.filterType !== undefined) ? request._all.filterType : "%";
        const orderBy = (request._all.orderBy !== undefined) ? request._all.orderBy : 'id';
        const orderDir = (request._all.orderDir !== undefined) ? ((request._all.orderDir === "desc" || request._all.orderDir === "asc") ? request._all.orderDir : "asc") : "asc";

        try {

            // get products
            prod = await Database
                .table('products')
                .select('products.id', 'products.name', 'products.type', 'products.price', 'products.created_at', 'users.username')
                .orderBy(orderBy, orderDir)
                .innerJoin('users', 'users.id', 'products.user_id')
                .where('products.name', "like", `%${filterName}%`)
                .where('products.type', "like", `%${filterType}%`)
                .where('users.username', "like", `%${filterAuthor}%`);

            // get attributs
            let attributesId = [];
            for (let prodKey in prod) {
                attributesId.push(prod[prodKey].id);
            }

            const attributes = await Database.table('attributes').select('*').whereIn('id', attributesId);

            for (let attrKey in attributes) {
                for (let prodKey in prod) {
                    if (attributes[attrKey].product_id && attributes[attrKey].product_id === prod[prodKey].id) {
                        if (!prod[prodKey].attributes) prod[prodKey].attributes = [];
                        prod[prodKey].attributes.push(attributes[attrKey]);
                    }
                }
            }
        } catch (err) {
            ok = false;
            code = 404;
            message = err;
        }

        // not found
        if (prod.length === 0) {
            message = "Not found products";
        }

        return [
            { ok: ok },
            { code: code },
            { message: message},
            { product: prod }
        ];
    }

    /**
     * get one product by id
     *
     * @param request
     * @returns {Promise<*[]>}
     */
    async getProductOne({ request }) {

        let ok = true;
        let code = 200;
        let message = "";
        let prod = [];
        const productId = request.params.id;

        try {
            prod = await Database.table('products').select('*').where('id', productId);
            const attributes = await Database.table('attributes').select('*').where('product_id', productId);
            if (attributes.length > 0) prod[0].attributes = attributes;
        } catch (err) {
            ok = false;
            code = 404;
            message = err;
        }

        // not found
        if (prod.length === 0) {
            message = "Not found product with id " + productId;
        }

        return [
            { ok: ok },
            { code: code },
            { message: message},
            { product: prod }
        ];
    }

    /**
     * update product
     *
     * @param request
     * @returns {Promise<{key: number}[]>}
     */
    async updateProduct({ request }) {

        let ok = true;
        let code = 200;
        let message = "";

        const userToken = request._all.token;
        const productId = request.params.id;
        const name = request._all.name;
        const price = parseFloat(request._all.price);
        const type = request._all.type;
        const updated_at = new Date();

        const isAdmin = await Check.checkAdmin(userToken);
        const isOwner = await Check.checkProductOwner(userToken, productId);

        if (isOwner || isAdmin) {

            let forUpdate = {
                updated_at: updated_at
            };

            if (name && name.length > 0 && name.length < 80) forUpdate.name = name;
            if (type && type.length > 0 && type.length < 80) forUpdate.type = type;
            if (price && typeof price === 'number' && price > 0) forUpdate.price = price;

            try {
                await Database
                    .table('products')
                    .where('id', productId)
                    .update(forUpdate);

                message = "product was updated successfully";
            } catch (err) {
                code = 500;
                ok = false;
                message = err;
            }

        } else {
            ok = false;
            code = 401;
            message = "Permission denied";
        }

        return [
            { ok: ok },
            { code: code },
            { message: message }
        ];
    }

    /**
     * create product
     *
     * @param request
     * @returns {Promise<{key: number}[]>}
     */
    async addProduct({ request }) {

        let ok = true;
        let code = 200;
        let message = "";

        const userToken = request._all.token;
        const name = request._all.name;
        const price = parseFloat(request._all.price);
        const type = request._all.type;
        const created_at = new Date();

        //validate
        let validate = true;
        if (!userToken) {
            validate = false;
            message = "Request don't have token...";
            code = 404;
            ok = false;
        }

        if(!name || name.length === 0 || name.length > 80) {
            validate = false;
            message += "Invalid name...";
            code = 404;
            ok = false;
        }

        if(!price || typeof price !== 'number' || price <= 0) {
            validate = false;
            message += "Invalid price...";
            code = 404;
            ok = false;
        }

        if(!type || type.length === 0 || type.length > 80) {
            validate = false;
            message += "Invalid type...";
            code = 404;
            ok = false;
        }

        if (validate) {
            let userId = await Database.table('tokens').select('user_id').where('token', userToken);
            if (userId.length > 0) {
                userId = userId[0].user_id;

                await Database.table('products').insert({name, price, type, created_at, user_id: userId});
                message = "create product successfully";

            } else {
                ok = false;
                code = 401;
                message = "Permission denied";
            }
        }

        return [
            { ok: ok },
            { code: code },
            { message: message }
        ];
    }

    /**
     * delete product by id
     *
     * @param request
     * @returns {Promise<*[]>}
     */
    async deleteProduct({ request }) {

        let ok = true;
        let code = 200;
        let message = "";

        const userToken = request._all.token;
        const productId = request.params.id;

        const isAdmin = await Check.checkAdmin(userToken);
        const isOwner = await Check.checkProductOwner(userToken, productId);

        if (isOwner || isAdmin) {
            try {

                await Database
                    .table('attributes')
                    .where('product_id', productId)
                    .delete();

                await Database
                    .table('products')
                    .where('id', productId)
                    .delete();

                message = "product and linked attributes was deleted successfully";
            } catch (err) {
                code = 500;
                ok = false;
                message = err;
            }
        } else {
            ok = false;
            code = 401;
            message = "Permission denied";
        }

        return [
            { ok: ok },
            { code: code },
            { message: message }
        ];
    }
}

module.exports = ProductController;