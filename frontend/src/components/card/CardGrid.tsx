import React from 'react';
import CardComponent from './Card';
import { useCardContext } from './CardContext'; 
const CardGrid: React.FC = () => {
  // 从Context获取卡片数据（修改后自动刷新）
  const { cards } = useCardContext();

  return (
    <div className="card-grid-container">
      <header className="card-grid-header">
        <h2>Knowledge Cards</h2>
        <p className="header-subtitle">Your personalized knowledge management hub</p>
      </header>

      <div className="card-grid">
        {cards.map((card) => (
          <CardComponent
            key={card.id}
            card={card}
          />
        ))}
      </div>

      <style>{`
        .card-grid-container {
          max-width: 1440px;
          margin: 0 auto;
          padding: 40px 24px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #f8fafc;
          min-height: calc(100vh - 80px);
        }

        .card-grid-header {
          margin-bottom: 32px;
          text-align: left;
        }

        .card-grid-header h2 {
          font-size: 32px;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 8px 0;
        }

        .header-subtitle {
          font-size: 16px;
          color: #64748b;
          margin: 0;
        }

        .card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
          row-gap: 32px;
        }

        @media (max-width: 768px) {
          .card-grid-container {
            padding: 24px 16px;
          }

          .card-grid-header h2 {
            font-size: 24px;
          }

          .card-grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 16px;
            row-gap: 24px;
          }
        }

        @media (max-width: 480px) {
          .card-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default CardGrid;