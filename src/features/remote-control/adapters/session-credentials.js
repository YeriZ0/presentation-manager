const KEY = 'armadillo:controller:v1';

export function createSessionCredentials(getStorage) {
    return {
        load() {
            try {
                const value = JSON.parse(getStorage().getItem(KEY));
                if (
                    value?.role !== 'controller' ||
                    typeof value.sessionId !== 'string' ||
                    !value.sessionId ||
                    value.sessionId.length > 128 ||
                    typeof value.token !== 'string' ||
                    !/^[a-f0-9]{64}$/.test(value.token) ||
                    typeof value.generation !== 'string' ||
                    !value.generation ||
                    value.generation.length > 128
                )
                    return null;
                return value;
            } catch {
                return null;
            }
        },
        save(value) {
            try {
                getStorage().setItem(
                    KEY,
                    JSON.stringify({
                        sessionId: value.sessionId,
                        token: value.token,
                        role: value.role,
                        generation: value.generation,
                        recoveryMs: value.recoveryMs,
                    }),
                );
            } catch {
                /* In-memory recovery remains available if storage is disabled */
            }
        },
        clear() {
            try {
                getStorage().removeItem(KEY);
            } catch {
                /* Storage may be unavailable */
            }
        },
    };
}
