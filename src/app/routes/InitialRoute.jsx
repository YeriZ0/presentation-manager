import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { MOBILE_BREAKPOINT } from '../../../shared/remote-control/protocol.js';

export function InitialRoute() {
    const [destination] = useState(() =>
        window.innerWidth < MOBILE_BREAKPOINT ? '/controller' : '/presenter',
    );
    return <Navigate to={destination} replace />;
}
