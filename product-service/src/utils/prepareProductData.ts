import { v4 as uuid } from "uuid";

export function prepareProductData(data) {
  const { title, description = "", price = 0, count } = data;

  if (typeof data.title !== "string" || !price || !count) {
    console.log(data);
    console.error("Validation Failed");

    return {
      error: {
        statusCode: 400,
        headers: { "Content-Type": "text/plain" },
        body: "Couldn't create the product item: " + JSON.stringify(data),
      },
    };
  }

  return {
    id: uuid(),
    title,
    description,
    price,
    count,
  };
}
