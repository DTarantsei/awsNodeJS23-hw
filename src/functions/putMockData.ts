import { DynamoDB } from "aws-sdk";
import { products, stocks } from "../mocks/constants";

const dynamoDb = new DynamoDB.DocumentClient();

export async function putMockData() {
  try {
    return Promise.all([
      ...products.map((product) =>
        dynamoDb
          .put({
            TableName: process.env.PRODUCT_TABLE_NAME,
            Item: product,
          })
          .promise()
      ),
      ...stocks.map((stock) =>
        dynamoDb
          .put({
            TableName: process.env.STOCK_TABLE_NAME,
            Item: stock,
          })
          .promise()
      ),
    ]).then(() => ({
      statusCode: 200,
      headers: { "Content-Type": "text/plain" },
      body: "Mock data created!",
    }));
  } catch (error) {
    console.log(error);

    return {
      statusCode: 500,
      headers: { "Content-Type": "text/plain" },
      body: "Internal Server Error",
    };
  }
}
