import { DynamoDB } from "aws-sdk";

const dynamoDb = new DynamoDB.DocumentClient();

export async function getProducts() {
  console.log(`getProducts event`);

  try {
    const productsParams = {
      TableName: process.env.PRODUCT_TABLE_NAME,
    };

    return dynamoDb
      .scan(productsParams)
      .promise()
      .then((result) => {
        const parsedItem = JSON.stringify(result.Items);

        return {
          statusCode: 200,
          body: !parsedItem ? [] : parsedItem,
        };
      })
      .catch((error) => {
        console.error(error);

        return {
          statusCode: error.statusCode || 501,
          headers: { "Content-Type": "text/plain" },
          body: "Couldn't fetch the products.",
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
