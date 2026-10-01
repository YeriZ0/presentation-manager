export class RemoteError extends Error {
    constructor(code) {
        super(code);
        this.name = 'RemoteError';
        this.code = code;
    }
}

export function failure(error) {
    return {
        ok: false,
        error: error instanceof RemoteError ? error.code : 'INTERNAL_ERROR',
    };
}

export function success(data = null) {
    return { ok: true, data };
}
