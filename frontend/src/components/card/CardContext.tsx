import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { generateDefaultCards } from '../../types/card';
import type { Card } from '../../types/card';

// 定义Context的类型（数据 + 修改方法）
interface CardContextType {
    cards: Card[]; // 所有卡片数据
    updateCard: (updatedCard: Card) => void; // 更新单张卡片
    addCard: (newCard: Card) => void; // 新增卡片（扩展）
    deleteCard: (cardId: string) => void; // 删除卡片（扩展）
    resetCards: () => void; // 重置为默认数据（扩展）
}

// 创建Context（默认值为undefined，用Provider提供实际值）
const CardContext = createContext<CardContextType | undefined>(undefined);

// Context Provider组件：包裹需要使用卡片数据的组件
export const CardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // 初始化数据：使用generateDefaultCards生成默认数据
    const [cards, setCards] = useState<Card[]>(generateDefaultCards());

    /**
     * 更新卡片（核心：支持动态刷新）
     * @param updatedCard 编辑后的卡片数据
     */
    const updateCard = (updatedCard: Card) => {
        setCards(prevCards =>
            prevCards.map(card =>
                card.id === updatedCard.id ? { ...card, ...updatedCard } : card
            )
        );

        // ===================== 前后端协同扩展点（先注释）=====================
        /*
        // 1. 后端接口调用：更新卡片
        const updateCardAPI = async () => {
          try {
            const response = await fetch(`/api/cards/${updatedCard.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                // 扩展：添加认证信息
                // 'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                title: updatedCard.title,
                content: updatedCard.content,
                updatedAt: new Date().toISOString(), // 前端更新时间戳
                // 扩展：传递修改人、修改日志等字段
                // modifier: localStorage.getItem('username'),
                // changeLog: '更新标题/内容'
              })
            });
    
            if (!response.ok) throw new Error('更新失败');
            const result = await response.json();
            console.log('后端更新成功:', result);
    
            // 扩展：后端返回新数据后，同步前端状态（可选）
            // setCards(prev => prev.map(c => c.id === result.id ? result : c));
          } catch (error) {
            console.error('更新卡片失败:', error);
            // 扩展：错误处理（提示用户、回滚数据、重试机制）
            // message.error('更新失败，请重试');
            // setCards(prev => prev.map(c => c.id === updatedCard.id ? originalCard : c));
          }
        };
        // updateCardAPI(); // 调用后端接口
        */
        // ====================================================================
    };

    /**
     * 新增卡片（扩展点）
     */
    const addCard = (newCard: Card) => {
        setCards(prev => [newCard, ...prev]);
        // ===================== 前后端协同扩展点（先注释）=====================
        /*
        const addCardAPI = async () => {
          // 后端新增接口逻辑：POST /api/cards
        };
        // addCardAPI();
        */
        // ====================================================================
    };

    /**
     * 删除卡片（扩展点）
     */
    const deleteCard = (cardId: string) => {
        setCards(prev => prev.filter(card => card.id !== cardId));
        // ===================== 前后端协同扩展点（先注释）=====================
        /*
        const deleteCardAPI = async () => {
          // 后端删除接口逻辑：DELETE /api/cards/${cardId}
        };
        // deleteCardAPI();
        */
        // ====================================================================
    };

    /**
     * 重置为默认数据（扩展点）
     */
    const resetCards = () => {
        setCards(generateDefaultCards());
    };

    // 提供Context值
    const contextValue: CardContextType = {
        cards,
        updateCard,
        addCard,
        deleteCard,
        resetCards
    };

    return (
        <CardContext.Provider value={contextValue}>
            {children}
        </CardContext.Provider>
    );
};

// 自定义Hook：简化Context调用（避免重复判断undefined）
export const useCardContext = () => {
    const context = useContext(CardContext);
    if (!context) {
        throw new Error('useCardContext must be used within a CardProvider');
    }
    return context;
};