
import React, { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { SCHOOL_SIDEBAR } from '@/constants/sidebar';
import type { NavItem, Scope } from '@/types/navigation';
import { useCan } from '@/hooks/useCan';

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-200 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
);

const SidebarItem: React.FC<{
  item: NavItem;
  isActive: (path: string) => boolean;
  isParentActive: (item: NavItem) => boolean;
  handleToggle: (label: string) => void;
  openItems: Set<string>;
}> = ({ item, isActive, isParentActive, handleToggle, openItems }) => {
  const can = useCan();
  const hasChildren = item.children && item.children.length > 0;
  const isOpen = openItems.has(item.label);

  if (item.scope && !can(item.scope)) {
      return null;
  }

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => handleToggle(item.label)}
          className={`w-full flex justify-between items-center px-4 py-2 text-sm rounded-md text-left ${isParentActive(item) ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-600 dark:text-gray-300'} hover:bg-gray-100 dark:hover:bg-gray-700`}
        >
          <span>{item.label}</span>
          <ChevronDownIcon className={isOpen ? 'rotate-180' : ''} />
        </button>
        {isOpen && (
          <div className="pl-4 mt-1 space-y-1">
            {item.children.map(child => (
              <SidebarItem key={child.label} item={child} isActive={isActive} isParentActive={isParentActive} handleToggle={handleToggle} openItems={openItems} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      to={item.path || '#'}
      className={`block px-4 py-2 text-sm rounded-md ${isActive(item.path || '') ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-semibold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
    >
      {item.label}
    </Link>
  );
};

const Sidebar: React.FC = () => {
    const { siteId } = useParams();
    const location = useLocation();
    const [openItems, setOpenItems] = useState<Set<string>>(new Set());

    if (!siteId) return null;

    const isActive = (path: string) => location.pathname === path.replace(':siteId', siteId);
    
    const isParentActive = (parent: NavItem): boolean => {
        if (!parent.children) return false;
        return parent.children.some(child => child.path && isActive(child.path) || isParentActive(child));
    };

    const handleToggle = (label: string) => {
        setOpenItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(label)) {
                newSet.delete(label);
            } else {
                newSet.add(label);
            }
            return newSet;
        });
    };

    // Automatically open parent of active child on load
    React.useEffect(() => {
        const activeParent = SCHOOL_SIDEBAR.find(item => isParentActive(item));
        if (activeParent) {
            setOpenItems(prev => new Set(prev).add(activeParent.label));
        }
    }, [location.pathname]);


    return (
        <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="h-16 flex items-center justify-center text-2xl font-bold text-indigo-600 dark:text-indigo-400 border-b border-gray-200 dark:border-gray-700">
                FaithEdu
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                {SCHOOL_SIDEBAR.map((item, index) => (
                    <div key={`${item.label}-${index}`}>
                       {item.children ? (
                           // It's a group with a title
                           <div>
                               <h3 className="px-2 pt-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{item.label}</h3>
                               <div className="mt-2 space-y-1">
                                {item.children.map(child => (
                                    <SidebarItem key={child.label} item={child} isActive={isActive} isParentActive={isParentActive} handleToggle={handleToggle} openItems={openItems} />
                                ))}
                               </div>
                           </div>
                       ) : (
                           // It's a single top-level link
                           <SidebarItem item={item} isActive={isActive} isParentActive={isParentActive} handleToggle={handleToggle} openItems={openItems} />
                       )}
                    </div>
                ))}
            </nav>
        </aside>
    );
}

export default Sidebar;
