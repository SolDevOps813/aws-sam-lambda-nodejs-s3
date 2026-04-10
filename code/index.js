// dependencies
const { 
  S3Client, 
  GetObjectCommand, 
  PutObjectCommand 
} = require("@aws-sdk/client-s3");
const util = require("util");
const sharp = require("sharp");

// create S3 client (region picked up automatically in Lambda)
const s3 = new S3Client();

exports.handler = async (event) => {
  console.log(
    "Reading options from event:\n",
    util.inspect(event, { depth: 5 })
  );

  const srcBucket = event.Records[0].s3.bucket.name;
  const srcKey = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\+/g, " ")
  );

  const dstBucket = `${srcBucket}-resized`;
  const dstKey = `resized-${srcKey}`;

  // Infer image type
  const typeMatch = srcKey.match(/\.([^.]*)$/);
  if (!typeMatch) {
    console.log("Could not determine image type.");
    return;
  }

  const imageType = typeMatch[1].toLowerCase();
  if (!["jpg", "jpeg", "png"].includes(imageType)) {
    console.log(`Unsupported image type: ${imageType}`);
    return;
  }

  try {
    // ---- Download object from S3 ----
    const getCmd = new GetObjectCommand({
      Bucket: srcBucket,
      Key: srcKey,
    });

    const response = await s3.send(getCmd);

    // Convert stream → Buffer
    const chunks = [];
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }
    const imageBuffer = Buffer.concat(chunks);

    // ---- Resize using sharp ----
    const resizedBuffer = await sharp(imageBuffer)
      .resize(200)
      .toBuffer();

    // ---- Upload resized image ----
    const putCmd = new PutObjectCommand({
      Bucket: dstBucket,
      Key: dstKey,
      Body: resizedBuffer,
      ContentType: `image/${imageType}`,
    });

    await s3.send(putCmd);

    console.log(
      `Successfully resized ${srcBucket}/${srcKey} and uploaded to ${dstBucket}/${dstKey}`
    );
  } catch (err) {
    console.error("Error processing image:", err);
    throw err;
  }
};
