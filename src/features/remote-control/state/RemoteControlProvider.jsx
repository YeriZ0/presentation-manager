import { useEffect, useState } from 'react';
import { RemoteControlContext } from './remote-control-context.js';
import { createRemoteControlStore } from './remote-control-store.js';
import { createSocketIoTransport } from '../adapters/socket-io-client.js';
import { createSessionCredentials } from '../adapters/session-credentials.js';
import { createPresenterConnectionService } from '../services/presenter-connection-service.js';
import { createControllerConnectionService } from '../services/controller-connection-service.js';
import { createBrowserScheduler } from '../../../lib/browser-scheduler.js';

function requestId() {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)), (value) =>
        value.toString(16).padStart(2, '0'),
    ).join('');
}

export function RemoteControlProvider({ role, reader, actions, children }) {
    const [value] = useState(() => {
        const store = createRemoteControlStore(role);
        const transport = createSocketIoTransport();
        const scheduler = createBrowserScheduler();
        const service =
            role === 'presenter'
                ? createPresenterConnectionService({
                      transport,
                      reader,
                      actions,
                      store,
                      clock: {
                          now: () => performance.timeOrigin + performance.now(),
                      },
                      scheduler,
                  })
                : createControllerConnectionService({
                      transport,
                      store,
                      scheduler,
                      idFactory: requestId,
                      credentialStore: createSessionCredentials(
                          () => window.sessionStorage,
                      ),
                  });
        return { store, service };
    });
    useEffect(() => {
        value.service.start();
        const onPageHide = () => {
            if (role === 'presenter') value.service.end();
            else value.service.suspend();
        };
        const onPageShow = (event) => {
            if (event.persisted && role === 'controller')
                value.service.reconnect();
        };
        window.addEventListener('pagehide', onPageHide);
        window.addEventListener('pageshow', onPageShow);
        return () => {
            window.removeEventListener('pagehide', onPageHide);
            window.removeEventListener('pageshow', onPageShow);
            value.service.scheduleDispose();
        };
    }, [value, role]);
    return (
        <RemoteControlContext.Provider value={value}>
            {children}
        </RemoteControlContext.Provider>
    );
}
