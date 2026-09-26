import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getUser, isPrivileged } from "@/utils/authentication";
import bcrypt from "bcryptjs";
import type { UserRegistrationRequest } from "@/types/dto/UserRegistrationRequest"; 
import { UserRegistrationRequestSchema } from "@/types/dto/UserRegistrationRequest";
import { tr } from "zod/locales";


export async function GET(request: NextRequest) {
        const havePrivilege = await isPrivileged(request, "users : read")

        if(!havePrivilege) {
            return NextResponse.json({message:"You do not have the required privilege to access this resource."}, {status:403});
        }

        const pageNumberIntString = request.nextUrl.searchParams.get("pageNumber")|| "1";
        const pageSizeIntString = request.nextUrl.searchParams.get("pageSize")|| "10";

        const pageNumber = parseInt(pageNumberIntString)
        const pageSize =parseInt(pageSizeIntString) 

        const usersCount = await prisma.user.count(); 
        const totalPages = Math.ceil(usersCount / pageSize);

        if(pageNumber > totalPages){
            return NextResponse.json({message:"Page number exceeds total pages"}, {status:400});
        }

        const users = await prisma.user.findMany({
            skip: (pageNumber - 1) * pageSize,
            take: pageSize,
            select : {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                status: true,
                lastLogin: true,
                createdAt: true,
                privileges: true
            }
        });

   return NextResponse.json({
       message: "Users retrieved successfully",
       users : users
   }) 
}

export async function POST(request: NextRequest) {
    const body = await request.json();

    
    try{
        const parsedBody = UserRegistrationRequestSchema.parse(body);

        const existingUser = await prisma.user.findUnique({
        where: {
            email: body.email
        }
    });

    if(existingUser != null){
        return NextResponse.json({message:"User with this email already exists"}, {status:400});    
    }
    const passwordHsh = await bcrypt.hash(body.password, 12);

    await prisma.user.create({
        data: {
            email: body.email,  
            firstName: body.firstName,
            lastName: body.lastName,
            password: passwordHsh,
            phone: body.phone || null,
        }
    });

    return NextResponse.json({message:"User created successfully"}, {status:201});
    }
    catch(error){
        return NextResponse.json({message:"Error creating user", error:error}, {status:500});
    }
}

export async function PUT(request: NextRequest) {
    const id = request.nextUrl.searchParams.get("id");

    const requestUser = await getUser(request);

    if(requestUser == null){
        return NextResponse.json({message:"Unauthorized"}, {status:401});
    }

    const body = await request.json();

    if(requestUser.id == id){

        const user = await prisma.user.findUnique({
            where: {
                id: id 
            }
        });
        if(user == null){
            return NextResponse.json({message:"User not found"}, {status:404});
        }

        await prisma.user.update({
            where: {
                id: id
            },
            data: {
                email: body.email || user.email,
                firstName: body.firstName || user.firstName,
                lastName: body.lastName || user.lastName,
                phone: body.phone || user.phone,
                profileImage: body.profileImage || user.profileImage
            }

        });

        return NextResponse.json({message:"User updated successfully"}, {status:200});

    }else{
        const havePrivilege = await isPrivileged(request, "users:edit")

        if(!havePrivilege) {
            return NextResponse.json({message:"You do not have the required privilege to access this resource."}, {status:403});
        }

        const user = await prisma.user.findUnique({
            where: {
                id: id  || "0000"
            }
        });
        if(user == null){
            return NextResponse.json({message:"User not found"}, {status:404});
        }

        await prisma.user.update({
            where: {
                id: id|| "0000"
            },
            data: {
                email: body.email || user.email,
                firstName: body.firstName || user.firstName,
                lastName: body.lastName || user.lastName,
                phone: body.phone || user.phone,
                profileImage: body.profileImage || user.profileImage,
                role: body.role || user.role,
                privileges: body.privileges || user.privileges,
                status: body.status || user.status
            }

        });

        return NextResponse.json({message:"User updated successfully"}, {status:200});
    }
}