import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getUser, isPrivileged } from "@/utils/authentication";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
        const havePrivilege = await isPrivileged(request, "users : read")

        if(!havePrivilege) {
            return NextResponse.json({message:"You do not have the required privilege to access this resource."}, {status:403});
        }
    
        const users = await prisma.user.findMany(
            {
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
            }
        );

    return NextResponse.json({
        message: "Users retrieved successfully",
        users : users
    }) 
}

export async function POST(request: NextRequest) {
    const body = await request.json();

    if(!body.email || !body.firstName || !body.lastName || !body.password){
        return NextResponse.json({message:"Missing required fields"}, {status:400});
    } 
    
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

export async function PUT(request: NextRequest) {
    const id = request.nextUrl.searchParams.get("id");

    const requestUser = await getUser(request);

    if(requestUser == null){
        return NextResponse.json({message:"Unauthorized"}, {status:401});
    }

    if(requestUser.id == id){

    }else{
        
    }
}