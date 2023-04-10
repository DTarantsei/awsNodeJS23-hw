import { products } from "../mocks/constants";

export async function getProducts() {
  return {
    statusCode: 200,
    body: JSON.stringify(products),
  };
}
