export class CustomError extends Error {
    cause?: number;
    constructor( public message: any, public statuscode?: number) {
        super(message);
        
    }
} 