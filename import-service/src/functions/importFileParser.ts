import csv = require("csv-parser");
import { S3, SQS } from "aws-sdk";

export async function importFileParser(event) {
  const sqs = new SQS({ region: "us-east-1" });
  const s3 = new S3({ signatureVersion: "v4", region: "us-east-1" });

  try {
    const { object, bucket } = event.Records[0].s3;

    const bucketName = bucket.name;
    const bucketKey = object.key;

    const s3Stream = s3
      .getObject({ Bucket: bucketName, Key: bucketKey })
      .createReadStream();

    const processCsvPromise = new Promise((resolve) => {
      s3Stream
        .pipe(csv())
        .on("data", (data) => {
          const body = JSON.stringify(data);

          sqs.sendMessage(
            {
              MessageBody: body,
              QueueUrl: process.env.SQS_URL,
            },
            (err) => {
              if (err) {
                console.log("AWS Error: " + err);
              } else {
                console.log("Send message result: " + body);
              }
            }
          );
        })
        .on("end", async () => {
          await s3
            .copyObject({
              Bucket: bucketName,
              CopySource: `${bucketName}/${bucketKey}`,
              Key: bucketKey.replace("uploaded", "parsed"),
            })
            .promise();

          await s3
            .deleteObject({
              Bucket: bucketName,
              Key: bucketKey,
            })
            .promise();

          resolve();
        });
    });

    await processCsvPromise;

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/plain" },
      body: "File parsed and moved.",
    };
  } catch (error) {
    console.log(error);

    return {
      statusCode: 500,
      headers: { "Content-Type": "text/plain" },
      body: "Internal server error.",
    };
  }
}
