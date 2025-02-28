import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Tab, Tabs } from "react-bootstrap";
import UserTable from "./component/AdminUserTable";
import UserCard from "./component/AdminUserCard";
import UserLevelEditDialog from "./component/UserLevelEditDialog";
import {
  setSelectedUser,
  deleteAllEligibleUsers,
  clearStates,
  searchUsers,
} from "../../../../features/admin/adminSlice";
import { useDispatch, useSelector } from "react-redux";
import Button from "./../../../../common/components/Button";
import CustomModal from "../../../../common/components/CustomModal";

const AdminUser = () => {
  const [sortBy, setSortBy] = useState("");
  const [activeTab, setActiveTab] = useState("allUser");
  const [showDialog, setShowDialog] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // 검색
  const [searchResults, setSearchResults] = useState({
    allUser: [],
    ineligibleUser: [],
    eligibleUser: [],
    allAdmin: [],
  });

  const selectedUser = useSelector((state) => state.admin.selectedUser);
  const { error, success, message, totalUserNum } = useSelector(
    (state) => state.admin
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (success && activeTab === "eligibleUsers") {
      setModalContent(message);
      setShowModal(true);
    } else if (error && activeTab === "eligibleUsers") {
      setModalContent("삭제에 실패하였습니다.");
      setShowModal(true);
    }
    return () => dispatch(clearStates());
  }, [success, error, message, activeTab]);

  const handleEditUser = (user) => {
    dispatch(setSelectedUser(user));
    setShowDialog(true);
  };

  const handleDeleteAllEligibleUsers = () => {
    dispatch(deleteAllEligibleUsers());
  };

  const handleSearchClick = () => {
    dispatch(searchUsers({ searchTerm, userType: activeTab })).then((res) => {
      const results = res.payload;
      setSearchResults((prev) => ({
        ...prev,
        [activeTab]: results && results.length > 0 ? results : null,
      }));
    });
  };

  return (
    <div className="admin-user-page">
      <Container>
        {showModal && (
          <CustomModal
            message={modalContent}
            onClose={() => {
              setShowModal(false);
              dispatch(clearStates());
            }}
          />
        )}
        <Row>
          <Col md={2}>
            <h2>User</h2>
          </Col>
          <Col xs={9} md={2}>
            <Form.Control
              type="text"
              placeholder="이메일 또는 이름으로 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Col>
          <Col xs={3} md={1}>
            <Button
              className="admin-user-page__btn"
              onClick={handleSearchClick}
            >
              검색
            </Button>
          </Col>
          {activeTab === "allUser" && (
            <Col md={7} className="total-user-num">
              <p>총 회원수 : {totalUserNum}</p>
            </Col>
          )}
        </Row>
        <Row className="table-area">
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-3"
          >
            <Tab eventKey="allUser" title="회원 리스트">
              <UserTable />
              <UserCard
                sortBy={sortBy}
                userType="allUser"
                onEditUser={handleEditUser}
                searchResults={searchResults["allUser"]}
              />
            </Tab>

            <Tab eventKey="ineligibleUsers" title="탈퇴회원 (90일이내)">
              <UserTable />
              <UserCard
                sortBy={sortBy}
                userType="ineligibleUser"
                onEditUser={handleEditUser}
                searchResults={searchResults["ineligibleUser"]}
              />
            </Tab>

            <Tab eventKey="eligibleUsers" title="탈퇴회원 (90일이상)">
              <Button onClick={handleDeleteAllEligibleUsers}>전체 삭제</Button>
              <UserTable />
              <UserCard
                sortBy={sortBy}
                userType="eligibleUser"
                onEditUser={handleEditUser}
                searchResults={searchResults["eligibleUser"]}
              />
            </Tab>

            <Tab eventKey="allAdmin" title="관리자">
              <UserTable />
              <UserCard
                sortBy={sortBy}
                userType="allAdmin"
                onEditUser={handleEditUser}
                searchResults={searchResults["allAdmin"]}
              />
            </Tab>
          </Tabs>
        </Row>
      </Container>

      <UserLevelEditDialog
        showDialog={showDialog}
        setShowDialog={setShowDialog}
        selectedUser={selectedUser}
      />
    </div>
  );
};

export default AdminUser;
