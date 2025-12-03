import React from 'react';
const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto py-6">
      <div className="container mx-auto text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} קייטרינג פלוס. כל הזכויות שמורות.</p>
      </div>
    </footer>
  );
};
export default Footer;