import { DynamoDB } from "aws-sdk";

const dynamoDb = new DynamoDB.DocumentClient();

export async function getProductById(event) {
  console.log(`getProductsById event: ${event}`);

  try {
    const { productId } = event.pathParameters;

    const productParams = {
      TableName: process.env.PRODUCT_TABLE_NAME,
      Key: {
        id: productId,
      },
    };

    const stockParams = {
      TableName: process.env.STOCK_TABLE_NAME,
      Key: {
        product_id: productId,
      },
    };

    const productDataPromise = await dynamoDb.get(productParams).promise();
    const stockDataPromise = await dynamoDb.get(stockParams).promise();

    return Promise.all([productDataPromise, stockDataPromise])
      .then(([product, stockData]) => ({
        statusCode: 200,
        body: JSON.stringify({
          ...product.Item,
          count: stockData.Item.count,
        }),
      }))
      .catch((error) => {
        console.error(error);

        return {
          statusCode: error.statusCode || 501,
          headers: { "Content-Type": "text/plain" },
          body: "Couldn't fetch the product item.",
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
