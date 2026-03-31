"use client";

import { Search, SortAsc } from "lucide-react";
import { useRouter } from "next/navigation";
import styles from "../app/(public)/catalogo/page.module.css";

interface CatalogControlsProps {
  initialQuery: string;
  initialSort: string;
  typeFilter: string;
}

export default function CatalogControls({ initialQuery, initialSort, typeFilter }: CatalogControlsProps) {
  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = formData.get("q") as string;
    
    // Build URL manually to maintain all filters
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (typeFilter !== "Todos") params.set("type", typeFilter);
    if (initialSort !== "newest") params.set("sort", initialSort);
    
    router.push(`/catalogo?${params.toString()}`);
  };

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams();
    if (initialQuery) params.set("q", initialQuery);
    if (typeFilter !== "Todos") params.set("type", typeFilter);
    if (sort !== "newest") params.set("sort", sort);
    
    router.push(`/catalogo?${params.toString()}`);
  };

  return (
    <div className={styles.searchSortContainer}>
      <div className={styles.searchWrapper}>
        <Search size={18} className={styles.searchIcon} />
        <form onSubmit={handleSearch}>
          <input 
            type="text" 
            name="q" 
            placeholder="Buscar por modelo (ex: Cruze, Civic...)" 
            defaultValue={initialQuery}
            className={styles.searchInput}
          />
        </form>
      </div>

      <div className={styles.sortWrapper}>
        <SortAsc size={18} color="var(--text-light)" />
        <select 
          name="sort" 
          defaultValue={initialSort}
          className={styles.sortSelect}
          onChange={(e) => handleSortChange(e.target.value)}
        >
          <option value="newest">Mais Recentes</option>
          <option value="price_asc">Menor Preço</option>
          <option value="price_desc">Maior Preço</option>
        </select>
      </div>
    </div>
  );
}
