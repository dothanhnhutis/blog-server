import { UploadApiOptions, v2 as cloudinary } from "cloudinary";
import { BadRequestError } from "../error-handler";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export function isBase64DataURL(value: string) {
  const base64Regex = /^data:image\/[a-z]+;base64,/;
  return base64Regex.test(value);
}

export function isUrl(value: string) {
  const url =
    /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)/;
  return url.test(value);
}

export async function getAllImageCloudinary() {
  const images = await cloudinary.search
    .expression("folder:ich/*")
    .sort_by("created_at", "desc")
    .max_results(500)
    .execute();
  return images;
}

export async function uploadImageCloudinary(base64: string) {
  if (!isBase64DataURL(base64))
    throw new BadRequestError("image upload must be base64 string");
  const options: UploadApiOptions = {
    resource_type: "image",
    use_filename: true,
    unique_filename: false,
    overwrite: true,
    // transformation: [{ width: 1000, height: 752, crop: "scale" }],
    folder: "ich",
    tags: ["avatar"],
  };
  const { public_id, asset_id, width, height, secure_url, tags } =
    await cloudinary.uploader.upload(base64, options);
  return { public_id, asset_id, width, height, secure_url, tags };
}

export async function deleteImageCloudinary(id: string) {
  await cloudinary.uploader.destroy(id);
}

// const aws = require('aws-sdk');
// const multer = require('multer');
// const multerS3 = require('multer-s3');

// const s3 = new aws.S3({
//   accessKeyId: 'access_key_id',
//   secretAccessKey: 'secret_access_key',
//   region: '<your_region>'
// });

// const fileUploader = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: '<your_bucket_name>',
//     acl: 'public-read',
//     metadata: function (req, file, cb) {

//       cb(null, {fieldName: file.fieldname});
//     },
//     key: function (req, file, cb) {
//       cb(null, Date.now().toString())
//     }
//   })
// });
