import { NextRequest } from "next/server";
import * as jose from "jose";

async function getUser(request : NextRequest) {
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