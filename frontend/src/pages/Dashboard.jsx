import { useEffect, useState } from 'react';
import { getMenuItems } from '../services/menuService.js';

export default function Dashboard() {
  const [menu, setMenu] = useState({
    items: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const loadMenu = async () => {
      const result = await getMenuItems();
      
      setMenu({
        items: result.success ? result.data : [],
        loading: false,
        error: result.success ? null : result.error
      });
    };

    loadMenu();
  }, []);

  if (menu.loading) return <div>Cargando menú...</div>;
  if (menu.error) return <div>Error: {menu.error}</div>;

  return (
    <div>
      {menu.items.map(item => (
        <div key={item._id}>{item.name}</div>
      ))}
    </div>
  );
}