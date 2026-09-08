import { NextRequest } from "next/server";
import * as jose from "jose";

export async function getUser(request : NextRequest) {
    const loginToken = request.cookies.get("token")?.value;

    const secretText = process.env.JOSE_SECRET;
    const secret = new TextEncoder().encode(secretText);

    try{
        const user = await jose.jwtVerify(loginToken || "", secret);
        return user.payload;
    } catch (error) {
        console.error("Error verifying JWT:", error);
        return null;
    }
}

export async function isPrivileged(request : NextRequest , privilege : string) {
    const user = await getUser(request);
    if (!user) {
        return false;
    }
    
    if(user.privileges.includes(privilege)){
        return true;
    }else{
        return false;
    }
}