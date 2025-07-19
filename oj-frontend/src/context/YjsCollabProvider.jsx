import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { useAuth } from './AuthContext';

const YjsCollabContext = createContext(null);

export const YjsCollabProvider = ({ children, roomId }) => {
    const { user } = useAuth();

    const { ydoc, provider } = useMemo(() => {
        if (!roomId) return { ydoc: null, provider: null };

        const doc = new Y.Doc();
        const serverUrl = import.meta.env.VITE_YJS_SERVER_URL;

        const wsProvider = new WebsocketProvider(
            serverUrl,
            roomId,
            doc,
            {}
        );
        wsProvider.connect(); 

        return { ydoc: doc, provider: wsProvider };
    }, [roomId]);

    const [connectionStatus, setConnectionStatus] = useState('disconnected');

    useEffect(() => {
        console.log("YjsProvider useEffect run:", { providerReady: !!provider, userReady: !!user, currentStatus: connectionStatus });

        if (!provider || !user) {
            console.log("YjsProvider useEffect: Provider or user not ready for awareness setup.");
            return;
        }

        const awareness = provider.awareness;

        const handleStatus = (event) => { 
          console.log("Yjs Provider Status Update: Received status event -", event); 
          setConnectionStatus(event.status); 
          console.log("Yjs Provider Status Update: State set to -", event.status); 
        };
        provider.on('status', handleStatus);
        if (provider.ws?.readyState === WebSocket.OPEN) {
            console.log("YjsProvider: WebSocket already open, setting status to 'connected'.");
            setConnectionStatus('connected');
        } else {
            console.log("YjsProvider: WebSocket not yet open or not initialized, relying on 'status' event.");
        }


        const setupAwarenessTimeout = setTimeout(() => {
            console.log("YjsProvider: Setting local awareness field for user after delay:", {
                userName: user.UserName,
                email: user.email,
                userId: user._id,
                isHost: !window.location.href.includes('join')
            });
            awareness.setLocalStateField('user', {
                name: user.UserName || user.email || 'Anonymous',
                email: user.email || 'no-email@example.com',
                id: user._id || 'anon-id-' + Math.random().toString(36).substring(7),
                color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
                isHost: !window.location.href.includes('join')
            });
        }, 100);

        console.log("YjsProvider useEffect: Provider and user ready, attaching handlers. Scheduling awareness setup.");

        return () => {
            console.log("YjsProvider useEffect: Cleaning up provider.");
            clearTimeout(setupAwarenessTimeout);
            provider.off('status', handleStatus);
            provider.disconnect();
            ydoc.destroy();
        };
    }, [provider, ydoc, user]);

    const contextValue = useMemo(() => ({
        ydoc,
        awareness: provider?.awareness,
        connectionStatus,
    }), [ydoc, provider, connectionStatus]);

    return (
        <YjsCollabContext.Provider value={contextValue}>
            {children}
        </YjsCollabContext.Provider>
    );
};

export const useYjsCollab = () => {
    const context = useContext(YjsCollabContext);
    if (!context) {
        return { ydoc: null, awareness: null, connectionStatus: 'disconnected' };
    }
    return context;
};