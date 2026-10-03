import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";
import { z } from "zod";
import { isPrivileged } from "@/utils/authentication";
import ProductsCreationRequestSchema from "@/types/dto/ProductsCreationRequest";
import prisma from "@/lib/prisma";
import { da } from "zod/locales";

export async function GET(request: NextRequest) {

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