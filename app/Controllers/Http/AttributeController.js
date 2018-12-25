const Database = use('Database');
const Check = require('../../Services/CheckUserRights');

class AttributeController {

    async updateAttribute({ request }) {
        let ok = true;
        let code = 200;
        let message = "";

        const userToken = request._all.token;
        const attributeId = request.params.id;
        const name = request._all.name;
        const value = request._all.value;
        const updated_at = new Date();

        const isAdmin = await Check.checkAdmin(userToken);
        const isOwner = await Check.checkAttributeOwner(userToken, attributeId);

        if (isOwner || isAdmin) {

            let forUpdate = {
                updated_at: updated_at
            };

            if (name && name.length > 0 && name.length < 80) forUpdate.name = name;
            if (value && value.length > 0 && value.length < 255) forUpdate.value = value;

            try {
                await Database
                    .table('attributes')
                    .where('id', attributeId)
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
        const name = request._all.name;
        const value = request._all.value;
        const created_at = new Date();

        const isAdmin = await Check.checkAdmin(userToken);
        const isOwner = await Check.checkProductOwner(userToken, productId);

        if (isOwner || isAdmin) {

            // validate
            let validate = true;
            if(!name || name.length === 0 || name.length > 80) {
                validate = false;
                message += "Invalid name...";
                code = 404;
                ok = false;
            }

            if(!value || value.length === 0 || value.length > 254) {
                validate = false;
                message += "Invalid value...";
                code = 404;
                ok = false;
            }

            try {
                await Database.table('attributes').insert({name, value, product_id: productId, created_at});
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
        const attributeId = request.params.id;

        const isAdmin = await Check.checkAdmin(userToken);
        const isOwner = await Check.checkAttributeOwner(userToken, attributeId);

        if (isOwner || isAdmin) {
            try {

                await Database
                    .table('attributes')
                    .where('id', attributeId)
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