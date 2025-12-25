import { useState, useEffect } from "react";
import "./App.css";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import CardGrid from "./components/card/CardGrid";
import AIChatInterface from "./components/chat/AIChatInterface";
import { initializeModels } from "./services/modelService";
import { CardProvider } from "./components/card/CardContext";

function App() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isMouseInSidebar, setIsMouseInSidebar] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [modelsInitialized, setModelsInitialized] = useState(false);

  // Initialize models on app startup
  useEffect(() => {
    const initApp = async () => {
      try {
        await initializeModels();
        setModelsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize app models:', error);
      }
    };
    
    initApp();
  }, []);

  // Control sidebar display logic
  const handleMouseEnter = () => {
    setSidebarVisible(true);
    setIsMouseInSidebar(true);
  };

  const handleSidebarMouseLeave = () => {
    setIsMouseInSidebar(false);
    setSidebarVisible(false);
  };

  const handleButtonMouseLeave = () => {
    setTimeout(() => {
      setIsMouseInSidebar((prev) => {
        if (!prev) {
          setSidebarVisible(false);
        }
        return prev;
      });
    }, 300);
  };

  const toggleSidebar = () => {
    setSidebarVisible((prev) => !prev);
    setIsMouseInSidebar((prev) => !prev);
  };

  const toggleChat = () => {
    setChatVisible((prev) => !prev);
  };

  const handleToggleBtnMouseEnter = () => {
    setSidebarVisible(true);
  };

  const handleToggleBtnMouseLeave = () => {
    if (!isMouseInSidebar) {
      setSidebarVisible(false);
    }
  };

  return (
    <div
      className="App"
      style={{
        paddingTop: 60,
        minHeight: "95vh",
        minWidth: "90vw",
        backgroundColor: "#f5f7fa",
      }}
    >
      {/* Top navigation */}
      <Header
        onSidebarHover={handleMouseEnter}
        onButtonMouseLeave={handleButtonMouseLeave}
        onOpenAIChat={toggleChat}
      />

      <Sidebar
        visible={sidebarVisible}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
        onToggle={toggleSidebar}
        onToggleBtnMouseEnter={handleToggleBtnMouseEnter}
        onToggleBtnMouseLeave={handleToggleBtnMouseLeave}
      />
      <CardProvider>
      <CardGrid />
      </CardProvider>
      <AIChatInterface 
        visible={chatVisible} 
        onVisibleChange={setChatVisible}
        modelsReady={modelsInitialized}
      />
    </div>
  );
}

export default App;
