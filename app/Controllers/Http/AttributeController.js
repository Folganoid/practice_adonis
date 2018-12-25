class AttributeController {
    async getAttribute({ request }) {
        return [
            { key: 1 },
            { key: 2 },
            { key: 3 },
        ];
    }

    async updateAttribute({ request }) {
        return [
            { key: 1 },
            { key: 2 },
            { key: 3 },
        ];
    }

    async addAttribute({ request }) {
        return [
            { key: 1 },
            { key: 2 },
            { key: 3 },
        ];
    }

    async deleteAttribute({ request }) {
        return [
            { key: 1 },
            { key: 2 },
            { key: 3 },
        ];
    }
}

module.exports = AttributeController;