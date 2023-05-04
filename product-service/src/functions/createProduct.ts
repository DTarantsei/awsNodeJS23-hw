import { DynamoDB } from "aws-sdk";

import { prepareProductData } from "../utils/prepareProductData";

export async function createProduct(event) {
  const dynamoDb = new DynamoDB.DocumentClient();

  console.log(`createProduct event: ${event}`);

  try {
    const data = JSON.parse(event.body);

    const preparedData = prepareProductData(data);

    if (preparedData?.error) {
      return preparedData.error;
    }

    const { title, description, price, id: newProductId, count } = preparedData;

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
