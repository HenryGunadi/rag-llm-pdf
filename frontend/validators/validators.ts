import { z } from "zod";

export const pdfFileSchema = z.custom<File>(
    (file) => {
        return file instanceof File && file.type === "application/pdf" && file.size <= 5 * 1024 * 1024;
    },
    {
        message: "Only PDF Files under 5mb are allowed",
    }
);
