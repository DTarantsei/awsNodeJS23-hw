import { getProductById } from "../src/functions/getProductById";

test("getProductById returns 200 OK", async () => {
  const event = {
    pathParameters: {
      productId: "7567ec4b-b10c-48c5-9345-fc73c48a80aa",
    },
  };
  const result = await getProductById(event);

  expect(result.statusCode).toEqual(200);
  expect(result.body).toEqual(
    JSON.stringify({
      description: "Short Product Description1",
      id: "7567ec4b-b10c-48c5-9345-fc73c48a80aa",
      price: 24,
      title: "ProductOne",
    })
  );
});

test("getProductById returns 404 Not Found", async () => {
  const event = {
    pathParameters: {
      productId: "incorrect_id",
    },
  };
  const result = await getProductById(event);

  expect(result.statusCode).toEqual(404);
});
