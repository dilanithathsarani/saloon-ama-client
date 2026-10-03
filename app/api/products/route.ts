import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";
import { z } from "zod";
import { isPrivileged } from "@/utils/authentication";
import ProductsCreationRequestSchema, { MediaArraySchema } from "@/types/dto/ProductsCreationRequest";
import prisma from "@/lib/prisma";
import { da } from "zod/locales";
import getPaginationInfo from "@/utils/pageInfoRetrieval";
import { ProductStatus } from "@/app/generated/prisma/enums";
import { ProductsUpdateRequestSchema } from "@/types/dto/ProductUpdateRequest";

export async function GET(request: NextRequest) {
    const params = getPaginationInfo(request);

    const totalProducts = await prisma.product.count();
    const totalPages = Math.ceil(totalProducts / params.pageSize);

    const products = await prisma.product.findMany({
        skip: (params.pageNumber - 1) * params.pageSize,
        take: params.pageSize,
        include: {
            media: true,
        },
    });

    return NextResponse.json({
        message: "Products retrieved successfully",
        products: products,
        pagination: {
            pageNumber: params.pageNumber,
            pageSize: params.pageSize,
            totalPages: totalPages,
            totalCount: totalProducts,
        },
    });
}

export async function POST(request: NextRequest) {
   const hasPrivilege = await isPrivileged(request, "products:add");

   if(hasPrivilege){
    try{
        const body = await request.json();

        const parsedBody = ProductsCreationRequestSchema.parse(body)

        await prisma.product.create({
          data: {
            sku: parsedBody.sku,
            name: parsedBody.name,
            description: parsedBody.description,
            altNames: parsedBody.altNames,
            stock: parsedBody.stock,
            status: parsedBody.status,
            price: parsedBody.price,
            compareAt: parsedBody.compareAt,
            brand: parsedBody.brand,
            model: parsedBody.model,
            media: {
              create: parsedBody.media
            }
          }
        });

        return NextResponse.json(
            {
                message: "Product created successfully"
            },
            {
                status :201
            }
        )

    }catch(error){
        if(error instanceof z.ZodError){
            return NextResponse.json(
                { message: error.issues[0]?.message?? "Invalid request body" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }  

   }else{
      return NextResponse.json(
         { message: "You do not have the required privilege to add a product" },
         { status: 403 }
      );
   }

}

export async function DELETE(request: NextRequest) {

    const hasPrivilege = await isPrivileged(request, "products:delete");

    if(!hasPrivilege){
        return NextResponse.json(
            { message: "You do not have the required privilege to delete a product" },
            { status: 403 }
        );
    }

    const id=request.nextUrl.searchParams.get("id");

    if(id==null){
        return NextResponse.json(
            { message: "Product ID is required" },
            { status: 400 }
        );
    }

    try{
        const existingProduct = await prisma.product.findUnique({
        where: {
            id: id
        }
    });

    if(existingProduct==null){
        return NextResponse.json(
            { message: "Product not found" },
            { status: 404 }
        );
    }

    await prisma.product.update({
        where: {
            id: id
        },
        data: {
            status: ProductStatus.DELETED
        }
    });

    return NextResponse.json(
        { message: "Product deleted successfully" },
        { status: 200 }
    );

    }catch(error){
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PUT(request : NextRequest){
    const hasPrivilege = await isPrivileged(request, "products:update");

    if(!hasPrivilege){
        return NextResponse.json(
            { message: "You do not have the required privilege to edit a product" },
            { status: 403 }
        );
    }

    const id=request.nextUrl.searchParams.get("id");

    if(id==null){
        return NextResponse.json(
            { message: "Product ID is required" },
            { status: 400 }
        );
    }

    try{
        const body = await request.json();

        const parsedBody = ProductsUpdateRequestSchema.parse(body)

        const existingProduct = await prisma.product.findUnique({
            where: {
                id: id
            }
        });

        if(existingProduct==null){
            return NextResponse.json(
                { message: "Product not found" },
                { status: 404 }
            );
        }

        await prisma.product.update({
            where: {
                id: id
            },
            data: {
                sku: parsedBody.sku || existingProduct.sku,
                name: parsedBody.name || existingProduct.name,
                description: parsedBody.description || existingProduct.description,
                altNames: parsedBody.altNames || existingProduct.altNames,
                stock: parsedBody.stock || existingProduct.stock,
                status: parsedBody.status || existingProduct.status,
                price: parsedBody.price || existingProduct.price,
                compareAt: parsedBody.compareAt || existingProduct.compareAt,
                brand: parsedBody.brand || existingProduct.brand,
                model: parsedBody.model || existingProduct.model,
            }
        });

        if(parsedBody.media != null && parsedBody.media.length > 0){
const parsedMediaArray = MediaArraySchema.parse(parsedBody.media);

            await prisma.media.deleteMany({
                where: {
                    productId: id
                }
            });
            await prisma.product.update({
                where: {
                    id: id
                },
                data: {
                    media: {
                        create: parsedMediaArray
                    }
                }
            });
        }

        return NextResponse.json(
            { message: "Product updated successfully" },
            { status: 200 }
        );
    }
    catch(error){
        if(error instanceof z.ZodError){
            return NextResponse.json(
                { message: error.issues[0]?.message?? "Invalid request body" },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }

} 