import { DynamoDB, SNS } from "aws-sdk";
import { v4 as uuid } from "uuid";

import { prepareProductData } from "../utils/prepareProductData";

export async function catalogBatchProcess(event) {
  const sns = new SNS({ region: "us-east-1" });
  const dynamoDb = new DynamoDB.DocumentClient();

  console.log(`catalogBatchProcess event: ${event}`);

  try {
    const products = event.Records.map((record) =>
      prepareProductData(JSON.parse(record.body))
    );

    const productsToCreate = products
      .filter((item) => !item?.error)
      .map(({ id, title, description, price, count }) => [
        {
          Put: {
            TableName: process.env.PRODUCT_TABLE_NAME,
            Item: {
              id,
              title,
              description,
              price,
            },
          },
        },
        {
          Put: {
            TableName: process.env.STOCK_TABLE_NAME,
            Item: {
              product_id: id,
              count,
            },
          },
        },
      ])
      .flat();

    if (productsToCreate.length) {
      await dynamoDb
        .transactWrite({ TransactItems: productsToCreate })
        .promise();
    }

    const messages = products.map((data) => {
      return {
        Id: uuid(),
        Message: JSON.stringify(
          data?.error
            ? { status: "Failed", message: data.error }
            : { status: "Created", message: data }
        ),
        Subject: "New Products creation",
      };
    });

    await sns
      .publishBatch({
        TopicArn: process.env.SNS_REF,
        PublishBatchRequestEntries: messages,
      })
      .promise();
  } catch (e) {
    console.log(e);

    return {
      statusCode: 500,
      headers: { "Content-Type": "text/plain" },
      body: "Internal Server Error",
    };
  }
}
