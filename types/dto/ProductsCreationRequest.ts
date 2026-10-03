import { MediaType, ProductStatus } from "@/app/generated/prisma/enums";
import z from "zod";

const ProductCreationEnum = z.enum(ProductStatus);
const MediaTypeEnum = z.enum(MediaType);

export const MediaArraySchema = z.array(z.object({
    url: z.url(),
    type: MediaTypeEnum,
}));

export const ProductsCreationRequestSchema = z.object({
    sku: z.string().max(50),
    name: z.string().max(100),
    description: z.string(),
    altNames: z.array(z.string()).max(100).optional().default([]),
    stock: z.number().int().min(0),
    status: ProductCreationEnum.optional().default("ACTIVE"),
    price: z.number().min(0),
    compareAt : z.number().min(0).optional(),
    brand : z.string().max(100).optional(),
    model: z.string().max(100).optional(),
    media: MediaArraySchema,
});

export type ProductsCreationRequest = z.infer<typeof ProductsCreationRequestSchema>;

export default ProductsCreationRequestSchema

