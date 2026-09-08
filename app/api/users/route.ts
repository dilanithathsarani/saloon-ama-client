import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getUser, isPrivileged } from "@/utils/authentication";

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