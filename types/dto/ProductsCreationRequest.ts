import z from "zod";

const ProductCreationEnum = z.enum(["ACTIVE", "INACTIVE", "DELETED"]);
const MediaTypeEnum = z.enum(["IMAGE", "VIDEO"]);

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
    media: z.array(z.object({
        url: z.url(),   
        type: MediaTypeEnum,
    })),
});

export type ProductsCreationRequest = z.infer<typeof ProductsCreationRequestSchema>;

export default ProductsCreationRequestSchema