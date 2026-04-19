import { useCategories, useCreateCategory } from '../hooks/useCategories';
import { useState } from 'react';
import { Icon } from '../../../components/Icon';
import styles from '../EventsPage.module.css';

interface Props {
  selected: string | undefined;
  onChange: (id: string | undefined) => void;
}

export const CategoryFilter = ({ selected, onChange }: Props) => {
  const { data: categories } = useCategories();
  const createCategory = useCreateCategory();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#4EDEA3');

  const handleCreate = async () => {
    if (!name.trim()) return;
    await createCategory.mutateAsync({ name: name.trim(), color });
    setName(''); setAdding(false);
  };

  return (
    <div className={styles.filterBar}>
      <button
        type="button"
        onClick={() => onChange(undefined)}
        className={`${styles.pill} ${!selected ? styles.pillActive : ''}`}
      >
        Todas
      </button>
      {categories?.map(cat => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onChange(cat.id)}
          className={`${styles.pill} ${selected === cat.id ? styles.pillActive : ''}`}
          style={{ borderColor: cat.color }}
        >
          <span className={styles.swatch} style={{ background: cat.color }} />
          {cat.name}
        </button>
      ))}
      {adding ? (
        <div className={styles.addCategory}>
          <input
            className={styles.inputSm}
            placeholder="Nombre"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <input type="color" value={color} onChange={e => setColor(e.target.value)} />
          <button type="button" onClick={handleCreate} className={styles.addBtn}>OK</button>
          <button type="button" onClick={() => setAdding(false)} className={styles.addBtn}>X</button>
        </div>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className={styles.pill}>
          <Icon name="add" size={14} /> Nueva
        </button>
      )}
    </div>
  );
};
