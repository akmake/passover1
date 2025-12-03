import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// פונקציית עזר לחיבור קלאסים (כמו שיש לך ב-Button)
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const DropdownMenu = ({ children }) => {
  return (
    <Menu as="div" className="relative inline-block text-left">
      {children}
    </Menu>
  );
};

export const DropdownMenuTrigger = ({ children, className }) => {
  return (
    <Menu.Button className={cn("inline-flex w-full justify-center focus:outline-none", className)}>
      {children}
    </Menu.Button>
  );
};

export const DropdownMenuContent = ({ children, align = "end", side = "bottom", className }) => {
  // חישוב מיקום בסיסי (Headless UI מטפל ברוב, אבל כיווניות חשובה)
  const alignmentClasses = align === "end" ? "origin-top-left left-0" : "origin-top-right right-0"; // RTL logic: end is usually left in RTL context depending on implementation, here assumes standard dropdown behavior
  
  // תיקון RTL: בדרך כלל ב-RTL, ה-Origin צריך להיות צד ימין אלא אם כן צוין אחרת
  const finalAlign = align === 'end' ? 'right-0 origin-top-right' : 'left-0 origin-top-left';

  return (
    <Transition
      as={Fragment}
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <Menu.Items className={cn(
        "absolute z-50 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none",
        finalAlign,
        className
      )}>
        <div className="py-1">{children}</div>
      </Menu.Items>
    </Transition>
  );
};

export const DropdownMenuItem = ({ children, onClick, className }) => {
  return (
    <Menu.Item>
      {({ active }) => (
        <div
          onClick={onClick}
          className={cn(
            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
            'block px-4 py-2 text-sm cursor-pointer flex items-center w-full',
            className
          )}
        >
          {children}
        </div>
      )}
    </Menu.Item>
  );
};

export const DropdownMenuSeparator = () => {
  return <div className="h-px bg-gray-200 my-1" />;
};