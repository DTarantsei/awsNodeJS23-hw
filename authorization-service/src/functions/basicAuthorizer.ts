const generatePolicy = (principalId, resource, effect = "Allow") => ({
  principalId,
  policyDocument: {
    Version: "2012-10-17",
    Statement: [
      {
        Action: "execute-api:Invoke",
        Effect: effect,
        Resource: resource,
      },
    ],
  },
});

export async function basicAuthorizer(event) {
  console.log(event);

  if (!event.headers.authorization) {
    throw new Error("Unauthorized");
  }

  try {
    const encodedCredentials = event.headers.authorization.split(" ")[1];
    const [username, password] = Buffer.from(encodedCredentials, "base64")
      .toString("utf-8")
      .split(":");

    const storedUserPassword = process.env[username];

    const effect =
      !storedUserPassword || storedUserPassword !== password ? "Deny" : "Allow";

    return generatePolicy(encodedCredentials, event.routeArn, effect);
  } catch (e) {
    console.log(e);
  }
}
