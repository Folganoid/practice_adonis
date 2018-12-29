/*
 ##POST
 localhost:3333/attribute/{productId}?token=Ji4da..&attributeId=1&value=111             - create attribute

 ##PUT
 localhost:3333/attribute/{attributeId}?token=Ji4da..&value=222&productId=2             - update product params

 ##DELETE
 localhost:3333/attribute/1?token=Ji4da..                                 - delete attribute by id

*/

const Database = use('Database');
const Check = require('../../Services/CheckUserRights');

class AttributeController {

    async updateAttribute({ request }) {
        let ok = true;
        let code = 200;
        let message = "";

        const userToken = request._all.token;
        const id = request.params.id;
        const productId = request._all.productId;
        const value = request._all.value;
        const updated_at = new Date();

        const isAdmin = await Check.checkAdmin(userToken);
        const isOwner = await Check.checkAttributeOwner(userToken, id);

        if (isOwner || isAdmin) {

            let forUpdate = {};

            if (value && value.length > 0 && value.length < 255) forUpdate.value = value;
            if (productId && productId > 0) forUpdate.product_id = productId;

            try {
                await Database
                    .table('product_attributes')
                    .where('id', id)
                    .update(forUpdate);

                message = "attribute was updated successfully";
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

    async addAttribute({ request }) {

        let ok = true;
        let code = 200;
        let message = "";

        const userToken = request._all.token;
        const productId = request.params.id;
        const attributeId = request._all.attributeId;
        const value = request._all.value;

        const isAdmin = await Check.checkAdmin(userToken);
        const isOwner = await Check.checkProductOwner(userToken, productId);

        if (isOwner || isAdmin) {

            // validate
            let validate = true;

            if(!value || value.length === 0 || value.length > 254) {
                validate = false;
                message += "Invalid value...";
                code = 404;
                ok = false;
            }

            if(!attributeId || attributeId <= 0) {
                validate = false;
                message += "Invalid attribute id...";
                code = 404;
                ok = false;
            }

            try {
                await Database.table('product_attributes').insert({product_id: productId, attribute_id: attributeId, value});
                message = "create attribute successfully";
            } catch (e) {
                ok = false;
                code = 500;
                message = e;
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

    async deleteAttribute({ request }) {
        let ok = true;
        let code = 200;
        let message = "";

        const userToken = request._all.token;
        const id = request.params.id;

        const isAdmin = await Check.checkAdmin(userToken);
        const isOwner = await Check.checkAttributeOwner(userToken, id);

        if (isOwner || isAdmin) {
            try {
                await Database
                    .table('product_attributes')
                    .where('id', id)
                    .delete();

                message = "attribute was deleted successfully";
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

module.exports = AttributeController;