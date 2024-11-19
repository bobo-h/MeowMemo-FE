import React, { useState, useEffect } from "react";
import { Form, Container, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { createChatbot } from "../../features/chatbot/chatbotSlice";
import "./style/chatbot.style.css";
import Button from "../../common/components/Button";
import PersonalityMBTI from "./component/PersonalityMBTI/PersonalityMBTI";
import Alert from "../../common/components/Alert";
import Alert2 from "../../common/components/Alert2";
import { getProductList } from "../../features/product/productSlice";
import { updateChatbotJins } from "../../features/chatbot/chatbotSlice";
//import PersonalityBox from './component/PersonalityBox/PersonalityBox';

// ChatbotCreation 컴포넌트
const ChatbotCreation = ({ chatbotItem }) => {
  const [name, setName] = useState(chatbotItem?.name || ""); // 다희
  const [personality, setPersonality] = useState("");
  const [isDirectInput, setIsDirectInput] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [confilmAlert, setConfilmAlert] = useState(false);

  const [alertContent, setAlertContent] = useState("");
  const [alertStep, setAlertStep] = useState(1); 
  const dispatch = useDispatch();

  const { loading, registrationError, success } = useSelector(
    (state) => state.chatbot
  );

  const product = useSelector((state) => state.product?.productList || []);
  console.log(product);

  useEffect(() => {
    dispatch(getProductList());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (chatbotItem) {
      // 수정 로직
      dispatch(
        updateChatbotJins({
          id: chatbotItem._id, // ID를 전달
          name,
        })
      )
        .then(() => {
          setAlertContent("수정이 완료되었습니다!");
          setShowAlert(true);
        })
        .catch((error) => {
          console.error("수정 실패", error);
          setAlertContent("수정에 실패했습니다!");
          setShowAlert(true);
        });
    } else {
      dispatch(createChatbot({ name, personality }))
        .then(() => {
          setAlertContent("입양에 성공했습니다!");
          setShowAlert(true);
        })
        .catch((error) => {
          console.log("입양 실패", error);
          setAlertContent("입양에 실패했습니다!");
          setShowAlert(true);
        });
    }
  };

  const handlePersonalityChange = (selectedPersonality) => {
    setPersonality(selectedPersonality);
  };

  const handleInputTypeChange = (inputType) => {
    setIsDirectInput(inputType);
    setPersonality("");
  };

  const handleAlertConfirm = () => {
    setConfilmAlert(false);
    if (alertStep === 1) {
      setShowAlert(true);
    }
  };

  const defaultProduct = Array.isArray(product)
    ? product.find((product) => product.defaultProduct === "Yes")
    : null;

  return (
    <div className="chatbot-create-modal">
      {showAlert && (
        <Alert
          message={alertContent}
          onClose={() => setShowAlert(false)}
          redirectTo="/"
        />
      )}
      {confilmAlert && (
       <Alert2
       message={alertContent}
       onClose={() => setConfilmAlert(false)}
       redirectTo="/chatbot"
       onConfirm={handleAlertConfirm}
     />
      )}
      <Container
        className=" d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <Row className="text-center chatbot-create-content">
          <h3 className="create-modal-title">입양 서류</h3>
          <Col style={{ flex: "0 0 35%" }} className="">
            {chatbotItem?.product_id?.image ? (
              <img
                src={chatbotItem.product_id.image}
                alt="Selected Product"
                className="chatbot-image-size"
              />
            ) : defaultProduct?.image ? (
              <img
                src={defaultProduct.image}
                alt="Default Product"
                className="chatbot-image-size"
              />
            ) : (
              <div className="no-image-message">이미지 없음</div>
            )}
          </Col>
          <Col style={{ flex: "0 0 65%" }}>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formName">
                <Row className="align-items-center">
                  {registrationError && (
                    <Alert variant="danger">{registrationError}</Alert>
                  )}
                  {success && (
                    <Alert variant="success">
                      챗봇이 성공적으로 생성되었습니다!
                    </Alert>
                  )}
                  <Col xs="auto">
                    <Form.Label>챗봇 이름</Form.Label>
                  </Col>
                  <Col lg={6}>
                    <Form.Control
                      type="text"
                      placeholder="이름을 입력하세요"
                      value={chatbotItem?.name ? chatbotItem?.name : name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </Col>
                </Row>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formPersonality">
                <Row className="align-items-center">
                  <Col xs="auto">
                    <Form.Label>챗봇 성격</Form.Label>
                  </Col>
                  {chatbotItem ? (
                    ""
                  ) : (
                    <Col className="btn-gap">
                      <Button
                        variant={
                          isDirectInput ? "outline-secondary" : "primary"
                        }
                        onClick={() => handleInputTypeChange(true)}
                      >
                        직접 입력
                      </Button>
                      <Button
                        variant={
                          isDirectInput ? "primary" : "outline-secondary"
                        }
                        onClick={() => handleInputTypeChange(false)}
                      >
                        성격 선택
                      </Button>
                    </Col>
                  )}

                  <Row className="personality-area">
                    {!isDirectInput && (
                      <Form.Control
                        placeholder="성격을 선택해주세요"
                        value={personality}
                        onChange={(e) => setPersonality(e.target.value)}
                        required
                        disabled
                      />
                    )}
                    {isDirectInput && (
                      <Form.Control
                        as="textarea"
                        placeholder="성격을 직접 입력하세요"
                        value={
                          chatbotItem?.personality
                            ? chatbotItem.personality
                            : personality
                        }
                        onChange={(e) => setPersonality(e.target.value)}
                        required
                        disabled={Boolean(chatbotItem)}
                      />
                    )}
                  </Row>
                  <Row className="align-items-center text-center">
                    {!isDirectInput && (
                      <PersonalityMBTI
                        onPersonalitySelect={handlePersonalityChange}
                      />
                      //<PersonalityBox onPersonalitySelect={handlePersonalityChange}/>
                    )}
                  </Row>
                  <Col className="personality-area">
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={loading}
                      className="w-auto"
                    >
                      {loading
                        ? "생성 중..."
                        : chatbotItem
                        ? "수정하기"
                        : "입양하기"}
                    </Button>
                  </Col>
                </Row>
              </Form.Group>
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ChatbotCreation;
