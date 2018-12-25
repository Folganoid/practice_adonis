class ProductController {
    async getProduct({ request }) {
        return [
            { key: 1 },
            { key: 2 },
            { key: 3 },
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