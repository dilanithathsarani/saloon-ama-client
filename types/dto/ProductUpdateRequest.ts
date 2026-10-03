import { MediaType, ProductStatus } from "@/app/generated/prisma/enums";
import z, { optional } from "zod";

const ProductCreationEnum = z.enum(ProductStatus);
const MediaTypeEnum = z.enum(MediaType);

export const ProductsUpdateRequestSchema = z.object({
    sku: z.string().max(50).optional(),
    name: z.string().max(100).optional(),
    description: z.string().optional(),
    altNames: z.array(z.string()).max(100).optional(),
    stock: z.number().int().min(0).optional(),
    status: ProductCreationEnum.optional(),
    price: z.number().min(0).optional(),
    compareAt : z.number().min(0).optional(),
    brand : z.string().max(100).optional(),
    model: z.string().max(100).optional(),
    media: z.array(z.object({
        url: z.url(),   
        type: MediaTypeEnum,
    }).optional()),
});

export type ProductsUpdateRequest = z.infer<typeof ProductsUpdateRequestSchema>;

export default ProductsUpdateRequestSchema