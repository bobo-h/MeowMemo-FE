import React, { useState } from 'react';
import "./style/admin.style.css";
import AdminProduct from './component/AdminProduct/AdminProduct';
import AdminUser from './component/AdminUser/AdminUser';
import AdminMenu from './component/AdminMenu/AdminMenu';
import AdminPayment from './component/AdminPayment/AdminPayment'
import AdminDiary from './component/AdminDiary/AdminDiary'
import Button2 from '../../common/components/Button2';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars , faHouse} from "@fortawesome/free-solid-svg-icons";


const AdminPage = () => {
  const [selectedComponent, setSelectedComponent] = useState('products');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const renderSelectedComponent = () => {
    switch (selectedComponent) {
      case 'products':
        return <AdminProduct />;
      case 'users':
        return <AdminUser />;
      case 'payment':
        return <AdminPayment />;
      case 'diary':
        return <AdminDiary />;
      default:
        return <div>Select a menu item</div>;
    }
  };

  const goToMainPage = () => {
    navigate("/")
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="admin-page">
      {isSidebarOpen && (
        <AdminMenu
          setSelectedComponent={setSelectedComponent}
          selectedComponent={selectedComponent}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
      )}
      <div className="admin-content">
        <div className="" >
          {!isSidebarOpen && (
            <button
              className="open-menu-button"
              onClick={() => setIsSidebarOpen(true)}
            >
              <FontAwesomeIcon icon={faBars} />
            </button>
          )}
            <button
              className="open-menu-button"
              onClick={goToMainPage}
            >
             <FontAwesomeIcon icon={faHouse} />
            </button>
         </div>
        <div className="content-component">
          {renderSelectedComponent()}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
