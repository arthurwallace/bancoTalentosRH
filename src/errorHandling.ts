import * as yup from "yup";

const headers = {
    "content-type": "application/json",
};

//Error handling
class HttpError extends Error {
    constructor(public statusCode: number, body: Record<string, unknown> = {}) {
        super(JSON.stringify(body));
    }
}

export const handleError = (e: unknown) => {
    if (e instanceof yup.ValidationError) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
                errors: e.errors,
            }),
        };
    }

    if (e instanceof SyntaxError) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: `corpo da requisição inválido : "${e.message}"` }),
        };
    }

    if (e instanceof HttpError) {
        return {
            statusCode: e.statusCode,
            headers,
            body: e.message,
        };
    }

    throw e;
};
