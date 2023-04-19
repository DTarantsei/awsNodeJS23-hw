import { importProductsFile } from "../src/functions/importProductsFile";

const mockedGetSignedUrl = jest.fn();

jest.mock("aws-sdk", () => {
  return {
    S3: jest.fn(() => ({
      getSignedUrl: mockedGetSignedUrl,
    })),
    config: {
      update: jest.fn(),
    },
  };
});

describe("importProductsFile", () => {
  it("has to mock getSignedUrl with fake url response", async () => {
    mockedGetSignedUrl.mockReturnValue({ url: "preparedURLvalue" });

    process.env.BUCKET = "test1";
    const event = {
      queryStringParameters: {
        name: "testFileName.csv",
      },
    };
    const response = await importProductsFile(event);

    expect(JSON.parse(response.body)["url"]).toEqual("preparedURLvalue");
    expect(mockedGetSignedUrl).toHaveBeenCalledWith("putObject", {
      Bucket: "test1",
      Expires: 3600,
      Key: `uploaded/${event.queryStringParameters.name}`,
    });
  });

  it("should handle error when file not provided", async () => {
    process.env.BUCKET = "test1";
    const event = {
      queryStringParameters: {},
    };

    const response = await importProductsFile(event);

    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual("File name not provided");
  });

  it("should handle error when server error", async () => {
    mockedGetSignedUrl.mockImplementation(() => {
      throw new Error("Internal server error");
    });

    process.env.BUCKET = "test1";
    const event = {
      queryStringParameters: {
        name: "testFileName",
      },
    };

    const response = await importProductsFile(event);

    expect(response.statusCode).toEqual(500);
    expect(response.body).toEqual("Internal server error");
  });
});
