
import React from 'react';
import Layout from '@/components/Layout';
import Welcome from '@/components/Welcome';
import FAQs from '@/components/FAQs';
import KudiChat from '@/components/KudiChat';
import LawyersMap from '@/components/LawyersMap';

const Index = () => {
  const [currentPage, setCurrentPage] = React.useState<'welcome' | 'faqs' | 'chat' | 'map'>('welcome');
  const [chatQuestion, setChatQuestion] = React.useState<string>('');

  const handleGetStarted = () => {
    setCurrentPage('faqs');
  };

  const handleExplainWithAI = (question: string) => {
    setChatQuestion(question);
    setCurrentPage('chat');
  };

  const handleNavigate = (page: 'welcome' | 'faqs' | 'chat' | 'map') => {
    if (page !== 'chat') {
      setChatQuestion(''); // Clear question when not going to chat
    }
    setCurrentPage(page);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'welcome':
        return <Welcome onGetStarted={handleGetStarted} />;
      case 'faqs':
        return <FAQs onExplainWithAI={handleExplainWithAI} />;
      case 'chat':
        return <KudiChat initialQuestion={chatQuestion} />;
      case 'map':
        return <LawyersMap />;
      default:
        return <Welcome onGetStarted={handleGetStarted} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={handleNavigate}>
      {renderCurrentPage()}
    </Layout>
  );
};

export default Index;
