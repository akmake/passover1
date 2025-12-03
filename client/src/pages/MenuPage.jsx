// client/src/pages/MenuPage.jsx

import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/api';
import ProductCard from '@/components/ProductCard';
import PackageCard from '@/components/PackageCard';
import { LoaderCircle, AlertTriangle, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { CATEGORY_DETAILS } from '@/config/constants';

const ALL_TAB_KEY = 'all';

const MenuPage = () => {
  const { t, i18n } = useTranslation();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState(ALL_TAB_KEY);
  const location = useLocation();

  // ======================= התיקון המרכזי כאן =======================
  // ה-useEffect הזה רץ פעם אחת בלבד כדי לטעון את כל המוצרים והחבילות.
  // הוא לא תלוי יותר בשינוי השפה (הורדנו את i18n.language מהתלויות).
  useEffect(() => {
    const fetchMenuItems = async () => {
      setError('');
      setLoading(true);
      try {
        const [productsResponse, packagesResponse] = await Promise.all([
          api.get('/api/products'),
          api.get('/api/packages'),
        ]);
        // השרת שולח את שתי השפות, והמידע נשמר כמו שהוא ב-State
        const products = (productsResponse.data || []).map(p => ({ ...p, type: 'product' }));
        const packages = (packagesResponse.data || []).map(pkg => ({ ...pkg, type: 'package' }));
        setMenuItems([...products, ...packages]);
      } catch {
        // חשוב להשאיר את t כאן, כדי שהודעת השגיאה תהיה מתורגמת אם היא מופיעה
        setError(t('menuPage.errorLoading'));
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, [t]); // התלות היחידה היא ב-t, למקרה שהשפה משתנה לפני שהטעינה הסתיימה
  // ======================= סוף התיקון המרכזי =======================

  const categoriesSorted = useMemo(() => {
    const set = new Set();
    for (const it of menuItems) {
      const key = it.type === 'package' ? 'package' : it.category;
      if (key) set.add(key);
    }
    return [...set].sort((a, b) => {
      const oa = CATEGORY_DETAILS[a]?.order ?? 99;
      const ob = CATEGORY_DETAILS[b]?.order ?? 99;
      return oa - ob;
    });
  }, [menuItems]);

  useEffect(() => {
    const hash = location.hash?.slice(1);
    if (!hash) return;
    if (hash === ALL_TAB_KEY || categoriesSorted.includes(hash)) {
      setActiveTab(hash);
    }
  }, [location.hash, categoriesSorted]);

  const countsByCategory = useMemo(() => {
    const counts = { [ALL_TAB_KEY]: menuItems.length };
    for (const key of categoriesSorted) counts[key] = 0;
    for (const it of menuItems) {
      const key = it.type === 'package' ? 'package' : it.category;
      if (key && counts[key] != null) counts[key] += 1;
    }
    return counts;
  }, [menuItems, categoriesSorted]);

  const itemsByCategoryFiltered = useMemo(() => {
    const map = {};
    const q = query.trim().toLowerCase();
    const currentLang = i18n.language; // זהה את השפה הנוכחית

    for (const key of categoriesSorted) map[key] = [];
    for (const it of menuItems) {
      const key = it.type === 'package' ? 'package' : it.category;
      if (!key) continue;

      // בצע חיפוש על השדה המתורגם הנכון
      const displayName = it.name?.[currentLang] || it.name?.he || '';
      if (q && !displayName.toLowerCase().includes(q)) continue;
      
      if (map[key]) {
          map[key].push(it);
      }
    }
    for (const k of Object.keys(map)) {
      if (!map[k]?.length) delete map[k];
    }
    return map;
  }, [menuItems, categoriesSorted, query, i18n.language]);

  const visibleItems = useMemo(() => {
    const currentLang = i18n.language;
    if (activeTab === ALL_TAB_KEY) return [];
    let base = menuItems.filter(
      it => (it.type === 'package' ? 'package' : it.category) === activeTab
    );
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      base = base.filter(it => {
        const displayName = it.name?.[currentLang] || it.name?.he || '';
        return displayName.toLowerCase().includes(q);
      });
    }
    return base;
  }, [menuItems, activeTab, query, i18n.language]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    if (key === ALL_TAB_KEY) {
      history.replaceState(null, '', location.pathname);
    } else {
      history.replaceState(null, '', `#${key}`);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoaderCircle className="h-12 w-12 animate-spin text-slate-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl rounded-md border border-red-200 bg-red-50 p-6 text-center">
        <div className="mb-2 inline-flex items-center gap-2 text-red-700">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-medium">{error}</span>
        </div>
        <button
          onClick={() => window.location.reload()} // הפתרון הפשוט ביותר במקרה של שגיאת רשת
          className="mt-3 rounded-md bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
        >
          {t('menuPage.retry')}
        </button>
      </div>
    );
  }

  // --- UI ---
  return (
    <div className="mx-auto max-w-7xl px-4 pb-10">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">{t('menuPage.title')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('menuPage.subtitle')}</p>
        </div>
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            dir={i18n.dir()}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('menuPage.searchPlaceholder')}
            className="w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 py-2 text-slate-900 outline-none transition focus:border-slate-400"
          />
        </div>
      </div>

      <div className="mb-6 border-b border-slate-200">
        <div className="no-scrollbar -mx-4 overflow-x-auto px-4">
          <div className="flex gap-6">
            <TabButton
              label={t('menuPage.allTab')}
              count={countsByCategory[ALL_TAB_KEY] ?? 0}
              active={activeTab === ALL_TAB_KEY}
              onClick={() => handleTabChange(ALL_TAB_KEY)}
            />
            {categoriesSorted.map((key) => (
              <TabButton
                key={key}
                label={t(`categories.${key}`)}
                count={countsByCategory[key] ?? 0}
                active={activeTab === key}
                onClick={() => handleTabChange(key)}
              />
            ))}
          </div>
        </div>
      </div>

      {activeTab === ALL_TAB_KEY ? (
        Object.keys(itemsByCategoryFiltered).length === 0 ? (
          <div className="mx-auto max-w-2xl rounded-md border border-slate-200 bg-white p-8 text-center text-slate-600">
            {t('menuPage.noItemsFound')}
          </div>
        ) : (
          categoriesSorted
            .filter((cat) => itemsByCategoryFiltered[cat]?.length)
            .map((cat) => (
              <section key={cat} className="mb-14">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-900">
                    {t(`categories.${cat}`)}
                    <span className="ml-2 align-middle text-sm font-normal text-slate-500">
                      ({itemsByCategoryFiltered[cat].length})
                    </span>
                  </h2>
                  <div className="h-px flex-grow rounded-full bg-slate-200 ml-4" />
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {itemsByCategoryFiltered[cat].map((item) =>
                    item.type === 'product' ? (
                      <ProductCard key={`prod-${item._id}`} product={item} />
                    ) : (
                      <PackageCard key={`pkg-${item._id}`} mealPackage={item} />
                    )
                  )}
                </div>
              </section>
            ))
        )
      ) : (
        visibleItems.length === 0 ? (
          <div className="mx-auto max-w-2xl rounded-md border border-slate-200 bg-white p-8 text-center text-slate-600">
            {t('menuPage.noItemsFound')}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleItems.map((item) =>
              item.type === 'product' ? (
                <ProductCard key={`prod-${item._id}`} product={item} />
              ) : (
                <PackageCard key={`pkg-${item._id}`} mealPackage={item} />
              )
            )}
          </div>
        )
      )}
    </div>
  );
};

const TabButton = ({ label, count, active, onClick }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center gap-2 border-b-2 px-1.5 pb-2 text-sm transition
      ${active ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
  >
    <span>{label}</span>
    <span className={`rounded-full px-1.5 text-[11px] ${active ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'}`}>
      {count}
    </span>
  </button>
);

export default MenuPage;