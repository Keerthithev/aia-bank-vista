import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import 'antd/dist/reset.css'; // For Ant Design v5+

createRoot(document.getElementById("root")!).render(<App />);
