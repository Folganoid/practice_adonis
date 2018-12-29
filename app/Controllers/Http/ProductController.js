/*
 ## GET
 localhost:3333/product/1   - get one product by id

 localhost:3333/product?
 filterAuthor=user2&
 filterType=mus&
 filterName=a&
 orderBy=name&
 orderDir=desc&
 orderByAttr=price&
 orderAttrDir=desc
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
    let message = '';
    let products = [];
    let attributes = [];
    let productIds = [];

    const filterName = request._all.filterName !== undefined ? request._all.filterName : '%';
    const filterAuthor = request._all.filterAuthor !== undefined ? request._all.filterAuthor : '%';
    const orderByAttr = request._all.orderByAttr !== undefined ? request._all.orderByAttr : false;
    const orderAttrDir = request._all.orderAttrDir !== "desc" ? 1 : 0;
    const orderBy = (request._all.orderBy !== undefined) ? request._all.orderBy : 'id';
    const orderDir = (request._all.orderDir !== undefined) ? ((request._all.orderDir === "desc" || request._all.orderDir === "asc") ? request._all.orderDir : "asc") : "asc";

    try {
      // get products
      products = await Database.table('products')
        .select(
          'products.id',
          'products.name',
          'types.name as typeName',
          'products.created_at',
          'users.username',
        )
        .orderBy(orderBy, orderDir)
        .innerJoin('users', 'users.id', 'products.user_id')
        .innerJoin('types', 'types.id', 'products.type_id')
        .where('products.name', 'like', `%${filterName}%`)
        .where('users.username', 'like', `%${filterAuthor}%`);

      // get attributes
        for(const prod in products) {
          productIds.push(products[prod].id);
        }

        attributes = await Database.table('attributes')
        .select(
                'product_attributes.id',
                'attributes.name',
                'product_attributes.value',
                'product_attributes.product_id as productId',
                'types.name as typeName',
            )
                .innerJoin('product_attributes', 'product_attributes.attribute_id', 'attributes.id')
                .innerJoin('types', 'types.id', 'attributes.type_id')
                .whereIn('product_attributes.product_id', productIds);

        for(const attr in attributes) {
            for (const prod in products) {
                if (attributes[attr].productId === products[prod].id) {
                    if (!products[prod].attributes) products[prod].attributes = [];
                    products[prod].attributes.push(attributes[attr]);
                }
            }
        }

        //sort by attribute
        if (orderByAttr) {
            products.sort(function (a, b) {
              let elA = 0;
              let elB = 0;

              for (const attr in a.attributes) {
                  if (a.attributes[attr].name === orderByAttr) {
                      elA = a.attributes[attr].value;
                      break;
                  }
              }

              for (const attr in b.attributes) {
                  if (b.attributes[attr].name === orderByAttr) {
                      elB = b.attributes[attr].value;
                      break;
                       }
              }

              if (orderAttrDir === 1) {
                  return elA - elB;
              } else {
                  return elA + elB;
              }
            });
        }
    } catch (err) {
      ok = false;
      code = 404;
      message = err;
    }

    // not found
    if (products.length === 0) {
      message = "Not found products";
    }

    return [
      { ok: ok },
      { code: code },
      { message: message},
      { product: products },
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
        let message = '';
        let product = [];
        let attributes = [];

        const productId = request.params.id;

        try {
            product = await Database.table('products')
                .select(
                    'products.id',
                    'products.name',
                    'types.name as typeName',
                    'products.created_at',
                    'users.username',
                )
                .innerJoin('users', 'users.id', 'products.user_id')
                .innerJoin('types', 'types.id', 'products.type_id')
                .where('products.id', productId);


            attributes = await Database.table('attributes')
                .select(
                    'product_attributes.id',
                    'attributes.name',
                    'product_attributes.value',
                    'product_attributes.product_id as productId',
                    'types.name as typeName',
                )
                .innerJoin('product_attributes', 'product_attributes.attribute_id', 'attributes.id')
                .innerJoin('types', 'types.id', 'attributes.type_id')
                .where('product_attributes.product_id', productId);


            if (attributes.length > 0) product[0].attributes = attributes;
        } catch (err) {
            ok = false;
            code = 404;
            message = err;
        }

        // not found
        if (product.length === 0) {
            message = "Not found product with id " + productId;
        }

        return [
            { ok: ok },
            { code: code },
            { message: message},
            { product: product }
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
        const type = request._all.type;
        const updated_at = new Date();

        const isAdmin = await Check.checkAdmin(userToken);
        const isOwner = await Check.checkProductOwner(userToken, productId);

        if (isOwner || isAdmin) {

            let forUpdate = {
                updated_at: updated_at
            };

            if (name && name.length > 0 && name.length < 255) forUpdate.name = name;
            if (type && type.length > 0 && type.length < 255) {

                // get type if exist & create if not
                let typeId = await Database.table('types').select('id').where('name', type);
                if (typeId.length === 0) {
                    typeId = await Database.table('types').insert({name: type}).returning('id');
                    typeId = typeId[0];
                } else {
                    typeId = typeId[0].id;
                }

                forUpdate.type_id = typeId;
            }

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

        if(!name || name.length === 0 || name.length > 255) {
            validate = false;
            message += "Invalid name...";
            code = 404;
            ok = false;
        }

        if(!type || type.length === 0 || type.length > 255) {
            validate = false;
            message += "Invalid type...";
            code = 404;
            ok = false;
        }

        if (validate) {
            let userId = await Database.table('tokens').select('user_id').where('token', userToken);
            if (userId.length > 0) {
                userId = userId[0].user_id;

                // get type if exist & create if not
                let typeId = await Database.table('types').select('id').where('name', type);
                if (typeId.length === 0) {
                    typeId = await Database.table('types').insert({name: type}).returning('id');
                    typeId = typeId[0];
                } else {
                   typeId = typeId[0].id;
                }

                // create product
                const productNew = await Database.table('products').insert({name, type_id: typeId, user_id: userId, created_at}).returning('id');
                message = "create product successfully...";

                //get attributes
                let attributes = {};
                for (const param in request._all) {
                    if(param !== "name" && param !== "token" && param !== "type") {
                        attributes[param] = request._all[param];
                    }
                }

                //get typesIds
                let typeIds = {};
                const typesTmp = await Database.table('types').select('*').whereIn('name', ['string', 'integer']);
                for (const typeKey in typesTmp) {
                    typeIds['type' + typesTmp[typeKey].name] = typesTmp[typeKey].id;
                }

                //get attributeIds
                let attributeIds = {};
                const attrsTmp = await Database.table('attributes').select('*');
                for (const attrKey in attrsTmp) {
                    attributeIds[attrsTmp[attrKey].name] = [attrsTmp[attrKey].id, attrsTmp[attrKey].type_id];
                }


                for(const attrKey in attributes) {
                    // define attribute's type id
                    let typeAttrId = (/^(\d+\.\d+|\d+)$/.test(attributes[attrKey])) ? typeIds['typeinteger'] : typeIds['typestring'];

                    // if attribute not exist in DB
                    if(!attributeIds[attrKey]) {
                        // create
                        const attributeId = await Database.table('attributes').insert({name: attrKey, type_id: typeAttrId}).returning('id');
                        attributeIds[attrKey] = [attributeId[0], typeAttrId];
                    }

                    // check type
                    if (typeAttrId !== attributeIds[attrKey][1]) {
                        message += "attribute " + attrKey + " have invalid type....";
                    }

                    // add attribute value
                    await Database
                        .table('product_attributes')
                        .insert({product_id: productNew[0], attribute_id: attributeIds[attrKey][0], value: attributes[attrKey]});
                }


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
                    .table('product_attributes')
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