import styles from "./page.module.css";
import ChatInterface from "@/components/ChatInterface";
import MemoryPanel from "@/components/MemoryPanel";

export default function Home() {
  return (
    <div className={styles.container}>
      {/* Main Chat Area */}
      <main className={styles.mainColumn}>
        <header className={`${styles.header} glass-panel`}>
          <h1>The Pundit</h1>
          <p>World Cup 2026 Predictions powered by Walrus Memory</p>
        </header>

        <ChatInterface />
      </main>

      {/* Sidebar Area */}
      <aside className={styles.sidebar}>
        <MemoryPanel />
      </aside>
    </div>
  );
}
