import React, { useEffect, useRef } from 'react';
import { Layout, Row, Col, Card } from 'antd';
import { gsap } from 'gsap';
import BankSelector from '@/components/BankSelector';
import EconomicIndicators from '@/components/EconomicIndicators';
import Chatbot from '@/components/Chatbot';

const { Content } = Layout;

const Index = () => {
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bgRef.current) {
      gsap.to(bgRef.current, {
        background: 'linear-gradient(120deg, #e0e7ff 0%, #f0fdfa 100%)',
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
      });
    }
  }, []);

  return (
    <Layout style={{ minHeight: '100vh', position: 'relative' }}>
      <div
        ref={bgRef}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          background: 'linear-gradient(120deg, #f0fdfa 0%, #e0e7ff 100%)',
          transition: 'background 1s',
        }}
      />
      <Content style={{ position: 'relative', zIndex: 1, padding: '24px 0' }}>
        <Chatbot />
        <Row justify="center" style={{ marginBottom: 32 }}>
          <Col xs={24} sm={20} md={16} lg={12}>
            <Card bordered={false} style={{ textAlign: 'center', borderRadius: 16 }}>
              <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Search Trading Banks</h2>
              <p style={{ fontSize: 18, color: '#555', marginBottom: 24 }}>
                Find and analyze bank stocks with real-time data and comprehensive insights
              </p>
              <BankSelector />
            </Card>
          </Col>
        </Row>
        <Row justify="center">
          <Col xs={24} sm={20} md={16} lg={12}>
            <Card bordered={false} style={{ borderRadius: 16 }}>
              <h2 style={{ fontSize: 28, fontWeight: 600, marginBottom: 16 }}>Economic Indicator Trends</h2>
              <EconomicIndicators />
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default Index;
