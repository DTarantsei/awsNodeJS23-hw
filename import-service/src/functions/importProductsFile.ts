import { S3 } from "aws-sdk";

export async function importProductsFile(event) {
  const s3 = new S3({ signatureVersion: "v4", region: "us-east-1" });

  const fileName = event.queryStringParameters.name;

  if (!fileName) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "text/plain" },
      body: "File name not provided",
    };
  }

  try {
    const url = s3.getSignedUrl("putObject", {
      Bucket: process.env.BUCKET,
      Key: `uploaded/${fileName}`,
      Expires: 3600,
    });

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Required for CORS support to work
        "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS
      },
      body: JSON.stringify(url),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: error.message,
    };
  }
}
