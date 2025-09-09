import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
// import AttackMap from './components/AttackMap';
import AttackMapSimple from './components/AttackMapSimple';
import StatisticsPanel from './components/StatisticsPanel';
import { useWebSocket } from './hooks/useWebSocket';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: #0a0a0a;
    color: #ffffff;
    overflow: hidden;
  }

  html, body, #root {
    height: 100%;
  }
`;

const AppContainer = styled.div`
  width: 100%;
  height: 100vh;
  position: relative;
  background: radial-gradient(ellipse at center, #1a1a2e 0%, #0a0a0a 100%);
`;

const Header = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1000;
  background: rgba(26, 26, 46, 0.9);
  border: 1px solid #2a2a3e;
  border-radius: 8px;
  padding: 15px 20px;
  backdrop-filter: blur(10px);
`;

const Title = styled.h1`
  color: #ff4444;
  font-size: 24px;
  margin: 0;
  text-shadow: 0 0 10px rgba(255, 68, 68, 0.5);
`;

const Subtitle = styled.p`
  color: #cccccc;
  font-size: 14px;
  margin: 5px 0 0 0;
  opacity: 0.8;
`;

const ErrorMessage = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 68, 68, 0.9);
  color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  z-index: 2000;
  border: 1px solid #ff4444;
`;

const LoadingMessage = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #ff4444;
  font-size: 18px;
  text-align: center;
  z-index: 2000;
`;

const Pulse = styled.div`
  width: 20px;
  height: 20px;
  background: #ff4444;
  border-radius: 50%;
  margin: 10px auto;
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.1); }
    100% { opacity: 1; transform: scale(1); }
  }
`;

function App() {
  const { attacks, isConnected, lastUpdate, error, stats } = useWebSocket({
    url: process.env.REACT_APP_WEBSOCKET_URL,
    reconnectInterval: 3000,
    maxReconnectAttempts: 10
  });

  if (error && !isConnected) {
    return (
      <>
        <GlobalStyle />
        <AppContainer>
          <ErrorMessage>
            <h3>🚨 Koneksi Gagal</h3>
            <p>{error}</p>
            <p>Pastikan backend server berjalan di port 3001</p>
          </ErrorMessage>
        </AppContainer>
      </>
    );
  }

  if (!isConnected && !error) {
    return (
      <>
        <GlobalStyle />
        <AppContainer>
          <LoadingMessage>
            <Pulse />
            <p>Menghubungkan ke server...</p>
            <p>Memuat data serangan real-time</p>
          </LoadingMessage>
        </AppContainer>
      </>
    );
  }

  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <Header>
          <Title>🌍 Bappenas Attack Map</Title>
          <Subtitle>Real-time Cyber Attack Visualization By CSIRT BAPPENAS</Subtitle>
        </Header>
        
        <AttackMapSimple attacks={attacks} />
        
        <StatisticsPanel 
          attacks={attacks}
          stats={stats}
          isConnected={isConnected}
          lastUpdate={lastUpdate}
        />
      </AppContainer>
    </>
  );
}

export default App;