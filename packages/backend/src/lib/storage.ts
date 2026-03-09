import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from './env.js';

export const s3Client = new S3Client({
  endpoint: env.R2_ENDPOINT,
  region: 'auto',
  forcePathStyle: true,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY,
    secretAccessKey: env.R2_SECRET_KEY,
  },
});

export async function uploadFile(
  key: string,
  body: Buffer | ReadableStream | string,
  contentType: string,
): Promise<void> {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

export async function getSignedDownloadUrl(
  key: string,
  expiresIn = 3600,
): Promise<string> {
  return getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: env.R2_BUCKET,
      Key: key,
    }),
    { expiresIn },
  );
}

export async function deleteFile(key: string): Promise<void> {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: env.R2_BUCKET,
      Key: key,
    }),
  );
}
