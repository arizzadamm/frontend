import React from 'react';
import styled from 'styled-components';
import { Attack, AttackStats } from '../types/Attack';

const Panel = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 300px;
  background: rgba(26, 26, 46, 0.9);
  border: 1px solid #2a2a3e;
  border-radius: 8px;
  padding: 20px;
  color: #ffffff;
  backdrop-filter: blur(10px);
  z-index: 1000;
`;

const Title = styled.h2`
  margin: 0 0 20px 0;
  color: #ff4444;
  font-size: 18px;
  text-align: center;
  border-bottom: 1px solid #2a2a3e;
  padding-bottom: 10px;
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(42, 42, 62, 0.3);
`;

const StatLabel = styled.span`
  color: #cccccc;
  font-size: 14px;
`;

const StatValue = styled.span`
  color: #ff4444;
  font-weight: bold;
  font-size: 14px;
`;

const Section = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  color: #ff6666;
  font-size: 14px;
  margin: 0 0 10px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ListItem = styled.li`
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 12px;
  color: #cccccc;
`;

const StatusIndicator = styled.div<{ isActive: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.isActive ? '#00ff00' : '#ff4444'};
  margin-right: 8px;
  animation: ${props => props.isActive ? 'pulse 2s infinite' : 'none'};
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

const StatusRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

interface StatisticsPanelProps {
  attacks: Attack[];
  stats: AttackStats;
  isConnected: boolean;
  lastUpdate: Date | null;
}

const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ 
  attacks, 
  stats, 
  isConnected, 
  lastUpdate 
}) => {
  const formatTime = (date: Date | null) => {
    if (!date) return 'Tidak ada';
    return date.toLocaleTimeString('id-ID');
  };

  const getTopCountries = (countries: Array<{ country: string; count: number }> | undefined, limit: number = 5) => {
    if (!Array.isArray(countries)) return [];
    return countries.slice(0, limit);
  };

  return (
    <Panel>
      <Title>🌍 Attack Map Monitor</Title>
      
      <Section>
        <StatusRow>
          <StatusIndicator isActive={isConnected} />
          <StatLabel>
            {isConnected ? 'Terhubung' : 'Terputus'}
          </StatLabel>
        </StatusRow>
        <StatItem>
          <StatLabel>Update Terakhir:</StatLabel>
          <StatValue>{formatTime(lastUpdate)}</StatValue>
        </StatItem>
      </Section>

      <Section>
        <SectionTitle>📊 Statistik Real-time</SectionTitle>
        <StatItem>
          <StatLabel>Total Serangan:</StatLabel>
          <StatValue>{stats.totalAttacks}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Serangan/Menit:</StatLabel>
          <StatValue>{stats.attacksPerMinute.toFixed(1)}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Serangan Aktif:</StatLabel>
          <StatValue>{attacks.length}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Total Hit Hari Ini:</StatLabel>
          <StatValue>{stats?.todayTotal ?? '-'}</StatValue>
        </StatItem>
      </Section>

      <Section>
        <SectionTitle>🎯 Negara Sumber Teratas</SectionTitle>
        <List>
          {getTopCountries(stats?.topSourceCountries).map((item, index) => (
            <ListItem key={index}>
              <span>{item?.country || 'Unknown'}</span>
              <span>{item?.count || 0}</span>
            </ListItem>
          ))}
        </List>
      </Section>

      <Section>
        <SectionTitle>🎯 Negara Target Teratas</SectionTitle>
        <List>
          {getTopCountries(stats?.topTargetCountries).map((item, index) => (
            <ListItem key={index}>
              <span>{item?.country || 'Unknown'}</span>
              <span>{item?.count || 0}</span>
            </ListItem>
          ))}
        </List>
      </Section>

      <Section>
        <SectionTitle>🌐 Hit Hari Ini per Negara</SectionTitle>
        <List>
          {getTopCountries(stats?.todayByCountry, 5).map((item, index) => (
            <ListItem key={index}>
              <span>{item?.country || 'Unknown'}</span>
              <span>{item?.count || 0}</span>
            </ListItem>
          ))}
        </List>
      </Section>

      <Section>
        <SectionTitle>⚡ Jenis Serangan</SectionTitle>
        <List>
          {(stats?.attackTypes || []).slice(0, 3).map((item, index) => (
            <ListItem key={index}>
              <span>{item?.type || 'Unknown'}</span>
              <span>{item?.count || 0}</span>
            </ListItem>
          ))}
        </List>
      </Section>
    </Panel>
  );
};

export default StatisticsPanel;
