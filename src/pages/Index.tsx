import React, { useEffect, useState } from 'react';
import { Layout, Row, Col, Card, Typography } from 'antd';
import BankSelector from '@/components/BankSelector';
import EconomicIndicators from '@/components/EconomicIndicators';
import Chatbot from '@/components/Chatbot';
import 'antd/dist/reset.css';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const Index = () => {
  const [stats, setStats] = useState({ banks: 0, avgPerformance: 0, totalVolume: 0 });

  useEffect(() => {
    fetch('/forcastnew.csv')
      .then(res => res.text())
      .then(text => {
        const rows = text.split(/\r?\n/).map(row => row.split(','));
        const header = rows[0];
        let banks = 0;
        for (let i = 0; i < header.length; i++) {
          if (header[i] && header[i] !== '') banks++;
        }
        banks = banks / 2;
        let totalVolume = 0;
        let priceCount = 0;
        let priceSum = 0;
        for (let i = 2; i < rows.length; i++) {
          for (let j = 1; j < header.length; j += 2) {
            const price = parseFloat(rows[i][j]);
            if (!isNaN(price)) {
              totalVolume += price;
              priceSum += price;
              priceCount++;
            }
          }
        }
        const avgPerformance = priceCount > 0 ? (priceSum / priceCount) : 0;
        setStats({ banks: Math.round(banks), avgPerformance, totalVolume });
      });
  }, []);

  return (
    <Layout style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)' }}>
      <Content style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 8px' }}>
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24}>
            <Chatbot />
          </Col>
        </Row>
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24}>
            <Card bordered={false} style={{ marginBottom: 24, background: 'linear-gradient(135deg, #fff 0%, #e0e7ef 100%)' }}>
              <div style={{ textAlign: 'center', padding: '32px 8px' }}>
                <Title level={2} style={{ marginBottom: 8 }}>Search Trading Banks</Title>
                <Paragraph style={{ fontSize: 18, color: '#555', marginBottom: 24 }}>
                  Find and analyze bank stocks with real-time data and comprehensive insights
                </Paragraph>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                  <BankSelector />
                </div>
              </div>
            </Card>
          </Col>
        </Row>
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24}>
            <Card bordered={false} style={{ background: 'linear-gradient(135deg, #fff 0%, #e0e7ef 100%)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <Title level={3} style={{ margin: 0 }}>Economic Indicator Trends</Title>
                <Paragraph style={{ color: '#888', margin: 0 }}>Monitor key economic factors affecting the banking sector</Paragraph>
              </div>
              <EconomicIndicators />
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default Index;
