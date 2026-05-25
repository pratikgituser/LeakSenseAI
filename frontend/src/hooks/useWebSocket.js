import { useState, useEffect } from 'react';

export function useWebSocket(url) {
  const [data, setData] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('🟢 WebSocket Connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const parsed = JSON.parse(event.data);
      if (parsed.type === 'SIMULATION_TICK') {
        setData(parsed.data);
      }
    };

    ws.onclose = () => {
      console.log('🔴 WebSocket Disconnected');
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [url]);

  return { data, isConnected };
}