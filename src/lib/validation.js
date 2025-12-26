import Product from '@/models/Product';

/**
 * Validates existence and stock of products in MongoDB.
 * @param {Array} items - Array of { productId, quantity }
 * @returns {Promise<{ valid: boolean, errors: Array, snapshots: Object }>}
 */
export async function validateProducts(items) {
    const errors = [];
    const snapshots = {};

    for (const item of items) {
        try {
            const product = await Product.findById(item.productId);
            if (!product) {
                errors.push(`Product not found: ${item.productId}`);
                continue;
            }

            if (!product.isActive) {
                errors.push(`Product is no longer active: ${product.name}`);
                continue;
            }

            if (product.stock < item.quantity) {
                errors.push(`Insufficient stock for ${product.name}: Available ${product.stock}, requested ${item.quantity}`);
            }

            // Capture snapshot for OrderItem
            snapshots[item.productId] = {
                name: product.name,
                images: product.images,
                description: product.description,
                price: product.price // Current price at time of validation
            };
        } catch (error) {
            errors.push(`Error validating product ${item.productId}: ${error.message}`);
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        snapshots
    };
}
