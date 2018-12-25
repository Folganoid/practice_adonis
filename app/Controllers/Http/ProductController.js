/*
 localhost:3333/product/1   - get one product by id

 localhost:3333/product?
 filterAuthor=user2&
 filterType=mus&
 filterName=a&
 orderBy=price&
 orderDir=desc
 (or variations without)    - get filtered and sorted products by params
*/

const Database = use('Database');

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
            prod[0].attributes = attributes;
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

    async updateProduct({ request }) {
        return [
            { key: 1 },
            { key: 2 },
            { key: 3 },
        ];
    }

    async addProduct({ request }) {
        return [
            { key: 1 },
            { key: 2 },
            { key: 3 },
        ];
    }
}

module.exports = ProductController;