import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { TerminalView } from './views/Terminal';
import { InventoryView } from './views/Inventory';
import { ReportsView } from './views/Reports';
import { CustomersView } from './views/Customers';
import { SettingsView } from './views/Settings';
import { LoginView } from './views/Login';
import { AnimatePresence } from 'motion/react';
import { Smartphone, Battery, Zap, Wrench, ShieldCheck } from 'lucide-react';
import { InventoryItem, Order } from './types';
import { Language, getTranslation } from './lib/i18n';

// Helper to map icon names to components if needed, 
// but since we store components in state, we need to handle serialization.
const iconMap: Record<string, any> = {
  Smartphone,
  Battery,
  Zap,
  Wrench,
  ShieldCheck
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('pos_lang') as Language) || 'en');
  const t = getTranslation(lang);

  const [currentView, setCurrentView] = useState('sales');
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(['Phone Repair', 'Tablet Repair', 'Accessories']);
  const [brands, setBrands] = useState<string[]>(['iPhone', 'Samsung', 'Google', 'Oppo']);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial data from backend API
  useEffect(() => {
    // Check local storage for persistent login and validate expiry
    const savedSessionString = localStorage.getItem('pos_session');
    if (savedSessionString) {
      try {
        const { user, expiresAt } = JSON.parse(savedSessionString);
        if (expiresAt && Date.now() < expiresAt) {
          setCurrentUser(user);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('pos_session');
        }
      } catch (e) {
        console.error('Failed to parse session', e);
      }
    }

    const loadData = async () => {
      try {
        const { api } = await import('./lib/api');
        const [inventoryData, ordersData, settingsData] = await Promise.all([
          api.getInventory(),
          api.getOrders(),
          api.getSettings()
        ]);
        
        if (Array.isArray(ordersData)) {
          let refundedKeys: string[] = [];
          if (settingsData && settingsData.ali_pos_refunded_orders) {
            try {
              refundedKeys = JSON.parse(settingsData.ali_pos_refunded_orders);
            } catch (e) { console.error('Failed to parse refunded keys', e); }
          }
          setOrders(ordersData.map(o => ({
            ...o,
            status: refundedKeys.includes(o.id) ? 'refunded' : 'completed'
          })));
        }
        
        if (Array.isArray(inventoryData)) {
          setInventory(inventoryData.map(item => {
            let parsedBrand = 'Other';
            let parsedModel = item.model;
            if (typeof parsedModel === 'string' && parsedModel.includes('||')) {
              const parts = parsedModel.split('||');
              parsedBrand = parts[0];
              parsedModel = parts[1];
            }
            return {
              ...item,
              brand: parsedBrand,
              model: parsedModel,
              icon: iconMap[item.iconName] || Smartphone
            };
          }));
        }

        if (settingsData && settingsData.ali_pos_categories) {
          try {
            setCategories(JSON.parse(settingsData.ali_pos_categories));
          } catch (e) {
            console.error('Failed to parse categories set', e);
          }
        }

        if (settingsData && settingsData.ali_pos_brands) {
          try {
            setBrands(JSON.parse(settingsData.ali_pos_brands));
          } catch (e) {
            console.error('Failed to parse brands set', e);
          }
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load initial data:', err);
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Automatic Session Expiry Effect
  useEffect(() => {
    if (!isAuthenticated) return;

    const savedSessionString = localStorage.getItem('pos_session');
    if (!savedSessionString) return;

    try {
      const { expiresAt } = JSON.parse(savedSessionString);
      const msUntilExpiry = expiresAt - Date.now();

      if (msUntilExpiry <= 0) {
        handleLogout();
        alert('Your session has expired.');
        return;
      }

      const timer = setTimeout(() => {
        handleLogout();
        alert('Your session has expired. Please log in again.');
      }, msUntilExpiry);

      return () => clearTimeout(timer);
    } catch (e) {
      console.error('Failed to parse session for auto-logout', e);
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('pos_session');
  };

  const handleLang = (l: Language) => {
    setLang(l);
    localStorage.setItem('pos_lang', l);
  };

  const handleLogin = (user: any) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
    const expiresAt = Date.now() + SESSION_DURATION;
    
    localStorage.setItem('pos_session', JSON.stringify({
      user,
      expiresAt
    }));
  };

  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} lang={lang} setLang={handleLang} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'sales':
        return <TerminalView inventory={inventory} setInventory={setInventory} orders={orders} setOrders={setOrders} cart={cart} setCart={setCart} categories={categories} brands={brands} t={t} />;
      case 'inventory':
        return <InventoryView inventory={inventory} setInventory={setInventory} categories={categories} setCategories={setCategories} brands={brands} setBrands={setBrands} t={t} />;
      case 'reports':
        return <ReportsView orders={orders} setOrders={setOrders} t={t} />;
      case 'customers':
        return <CustomersView />;
      case 'settings':
        return <SettingsView onLogout={handleLogout} currentUser={currentUser} onUpdateUser={setCurrentUser} />;
      default:
        return <TerminalView inventory={inventory} setInventory={setInventory} orders={orders} setOrders={setOrders} cart={cart} setCart={setCart} categories={categories} brands={brands} t={t} />;
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView} onLogout={handleLogout} currentUser={currentUser} t={t}>
      <AnimatePresence mode="wait">
        {renderView()}
      </AnimatePresence>
    </Layout>
  );
}
