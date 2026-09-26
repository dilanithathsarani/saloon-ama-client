import {z} from "zod";

const UserUpdateByAdminRequestSchema = z.object({
   
    password: z.never().optional(),
    
});

export type UserUpdateByAdminRequest = z.infer<typeof UserUpdateByAdminRequestSchema>;
export {UserUpdateByAdminRequestSchema};