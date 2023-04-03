import { products } from "../mocks/constants";

export async function getProductById(event) {
    const { productId } = event.pathParameters;
    const [product] = products.filter(({ id }) => id === productId);

    if (!product) {
        return {
            statusCode: 404,
            body: JSON.stringify(`Product with ${productId} not found.`),
        }
    }

    return {
        statusCode: 200,
        body:JSON.stringify(product),
    };
}