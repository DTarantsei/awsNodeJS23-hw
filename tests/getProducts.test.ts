import { getProducts } from "../src/functions/getProducts";
import { products } from "../src/mocks/constants";

test.skip("getProducts returns 200 OK", async () => {
  const result = await getProducts();

  expect(result.statusCode).toEqual(200);
  expect(result.body).toEqual(JSON.stringify(products));
});
