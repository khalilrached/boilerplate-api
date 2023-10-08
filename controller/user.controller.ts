import { Router,Request,Response } from "express";

export class UserController {
    
    static router(): Router {
        const router = Router();
        return router;
    }

    static async hello(req: Request,res:Response,next:any) {
	    return res.json({
		    "message":"hello world"
	    })
    }

} 
