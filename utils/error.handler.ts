export interface ApiErrorArgs {
    message: string,
    code: number,
    status: string
}

export class ApiError extends Error {

    code: number
    status: string

    constructor(args: ApiErrorArgs) {
        super(args.message)
        this.code = args.code
        this.status = args.status
    }
}

export function createError(args: ApiErrorArgs) {
    return new ApiError(args);
}