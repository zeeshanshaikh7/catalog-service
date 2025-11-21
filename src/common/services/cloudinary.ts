/* eslint-disable @typescript-eslint/no-unused-vars */
import { v2 as cloudinary } from "cloudinary";
import config from "config";
import { FileData, FileStorage } from "../types/storage";

export class CloudinaryStorage implements FileStorage {
    private folder = "uploads";

    constructor() {
        cloudinary.config({
            cloud_name: config.get("cloudinary.cloudName"),
            api_key: config.get("cloudinary.apiKey"),
            api_secret: config.get("cloudinary.apiSecret"),
        });
    }

    async upload(data: FileData): Promise<void> {
        try {
            const buffer = Buffer.from(data.fileData);

            await new Promise((res, rej) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        public_id: data.filename,
                        folder: this.folder,
                        resource_type: "auto",
                    },
                    (error) => {
                        if (error) {
                            rej(error);
                        } else {
                            res(null);
                        }
                    },
                );

                uploadStream.end(buffer);
            });
        } catch (error) {
            throw new Error("Cloudinary upload failed");
        }
    }

    async delete(filename: string): Promise<void> {
        try {
            const id = `${this.folder}/${filename}`;
            const res = (await cloudinary.uploader.destroy(id)) as {
                result?: string | undefined;
            };

            if (res.result !== "ok" && res.result !== "not found") {
                throw new Error("Cloudinary delete failed");
            }
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : String(error);
            throw new Error("Cloudinary delete error: " + message);
        }
    }

    getObjectUri(filename: string): string {
        return cloudinary.url(`${this.folder}/${filename}`, {
            secure: true,
        });
    }
}
