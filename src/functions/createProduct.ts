import { DynamoDB } from "aws-sdk";
import { v4 as uuid } from "uuid";

const dynamoDb = new DynamoDB.DocumentClient();

export async function createProduct(event) {
  console.log(`createProduct event: ${event}`);

  try {
    const data = JSON.parse(event.body);

    const { title, description = "", price = 0, count } = data;

    if (typeof data.title !== "string" || !price || !count) {
      console.error("Validation Failed");

      return {
        statusCode: 400,
        headers: { "Content-Type": "text/plain" },
        body: "Couldn't create the product item.",
      };
    }

    const newProductId = uuid();
    const productParams = {
      TableName: process.env.PRODUCT_TABLE_NAME,
      Item: {
        id: newProductId,
        title,
        description,
        price: Number(price),
      },
    };

    const stockParams = {
      TableName: process.env.STOCK_TABLE_NAME,
      Item: {
        product_id: newProductId,
        count,
      },
    };

    const stockItemCreation = dynamoDb.put(stockParams).promise();
    const productItemCreation = dynamoDb.put(productParams).promise();

    return Promise.all([stockItemCreation, productItemCreation])
      .then(() => ({
        statusCode: 200,
        body: JSON.stringify(productParams.Item),
      }))
      .catch((error) => {
        console.error(error);

        return {
          statusCode: error.statusCode || 501,
          headers: { "Content-Type": "text/plain" },
          body: "Couldn't create the product.",
        };
      });
  } catch (e) {
    console.log(e);

    return {
      statusCode: 500,
      headers: { "Content-Type": "text/plain" },
      body: "Internal Server Error",
    };
  }
}
