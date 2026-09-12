import { NextRequest } from "next/server";
import * as jose from "jose";
import { RequestUserType } from "@/types/requestUser";

export async function getUser(request : NextRequest) :Promise<RequestUserType | null>{
    const loginToken = request.cookies.get("token")?.value;

    const secretText = process.env.JOSE_SECRET;
    const secret = new TextEncoder().encode(secretText);

    try{
        const tokenData = await jose.jwtVerify(loginToken || "", secret);
        const user: RequestUserType = tokenData.payload as unknown as RequestUserType;
        return user;
    } catch (error) {
        console.error("Error verifying JWT:", error);
        return null;
    }
}

export async function isPrivileged(request : NextRequest , privilege : string): Promise<boolean> {
    const user : RequestUserType | null = await getUser(request);
    if (!user) {
        return false;
    }
    
    if(user.privileges.includes(privilege)){
        return true;
    }else{
        return false;
    }
}