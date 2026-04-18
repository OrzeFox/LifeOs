import { useEffect, useState } from 'react';
import { financesApi } from '../../../api/finances';
import type { ExpenseCategory } from '../../../ts/finances';

const useCategories = () => {
  const [customCategories, setCustomCategories] = useState<ExpenseCategory[]>([]);

  const load = async () => {
    try {
      const res = await financesApi.getCategories();
      setCustomCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { load(); }, []);

  const saveCategory = async (name: string) => {
    await financesApi.createCategory(name);
    await load();
  };

  return { customCategories, saveCategory };
};

export default useCategories;
