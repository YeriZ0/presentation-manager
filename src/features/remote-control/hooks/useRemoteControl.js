import { useContext } from 'react';
import { useStore } from 'zustand';
import { RemoteControlContext } from '../state/remote-control-context.js';

export function useRemoteService() {
    const value = useContext(RemoteControlContext);
    if (!value) throw new Error('La conexión remota no está disponible.');
    return value.service;
}

export function useRemoteControl(selector) {
    const value = useContext(RemoteControlContext);
    if (!value) throw new Error('La conexión remota no está disponible.');
    return useStore(value.store, selector);
}
