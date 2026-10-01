import { RemoteError } from '../../../shared/remote-control/errors.js';

/** Atomic asynchronous repository contract with isolated record copies */
export function createMemorySessionRepository() {
    const sessions = new Map();
    const codes = new Map();

    function save(session, previous) {
        const owner = session.code && codes.get(session.code.value);
        if (owner && owner !== session.id)
            throw new RemoteError('CODE_COLLISION');
        if (previous?.code) codes.delete(previous.code.value);
        if (session.code) codes.set(session.code.value, session.id);
        sessions.set(session.id, structuredClone(session));
    }

    return {
        async create(session, maxSessions) {
            if (sessions.size >= maxSessions)
                throw new RemoteError('SERVER_BUSY');
            if (sessions.has(session.id)) throw new RemoteError('CONFLICT');
            save(session);
            return structuredClone(session);
        },
        async get(id) {
            return structuredClone(sessions.get(id) ?? null);
        },
        async findByCode(code) {
            return structuredClone(sessions.get(codes.get(code)) ?? null);
        },
        async update(id, version, next) {
            const previous = sessions.get(id);
            if (!previous || previous.version !== version)
                throw new RemoteError('CONFLICT');
            const saved = { ...next, version: version + 1 };
            save(saved, previous);
            return structuredClone(saved);
        },
        async remove(id, version) {
            const previous = sessions.get(id);
            if (version !== undefined && previous?.version !== version)
                throw new RemoteError('CONFLICT');
            if (previous?.code) codes.delete(previous.code.value);
            sessions.delete(id);
        },
        async list() {
            return [...sessions.values()].map((value) =>
                structuredClone(value),
            );
        },
    };
}
