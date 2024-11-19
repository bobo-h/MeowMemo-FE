import React, { useState, useEffect, useRef } from "react";
import Draggable from "react-draggable";
import { debounce } from "lodash";
import { useSelector, useDispatch } from "react-redux";
import {
  updateChatbotJins,
  updateChatbotMany,
} from "../../../features/chatbot/chatbotSlice";

function MyCatsComponent() {
  const dispatch = useDispatch();
  const parentRef = useRef(null); // 부모 요소를 참조
  const [size, setSize] = useState({});
  const { cats, loading } = useSelector((state) => state.chatbot);
  const [localCats, setLocalCats] = useState(cats || []);

  useEffect(() => {
    if (!loading) {
      setLocalCats(cats);
    }
  }, [cats, size]);

  const updateSize = async () => {
    if (parentRef.current) {
      const { width, height } = parentRef.current.getBoundingClientRect();
      setSize({ width, height });

      // 상태를 함수형으로 업데이트
      setLocalCats((prevCats) => {
        const updatedCats = prevCats.map((cat) => {
          const updatedX = (cat.position.x / 100) * width;
          const updatedY = (cat.position.y / 100) * height;

          const percentageX = (updatedX / width) * 100;
          const percentageY = (updatedY / height) * 100;

          return {
            ...cat,
            position: { x: percentageX, y: percentageY },
            defaultPosition: { x: updatedX, y: updatedY },
          };
        });

        // Redux 업데이트
        dispatch(updateChatbotMany({ updates: updatedCats }));

        return updatedCats; // 상태에 반영
      });
    }
  };

  // 디바운싱 적용
  const debouncedUpdate = debounce(updateSize, 300);

  useEffect(() => {
    updateSize(); // 초기 크기 계산 및 상태 업데이트

    // 창 크기 변경 이벤트 등록
    window.addEventListener("resize", debouncedUpdate);

    return () => {
      window.removeEventListener("resize", debouncedUpdate);
      debouncedUpdate.cancel();
    };
  }, [parentRef]); // 의존성 관리

  // 드래그 완료 시 위치 저장 (픽셀 값을 %로 변환하여 저장)
  const handleDragStop = async (id, data) => {
    const catToUpdate = cats.find((cat) => cat._id === id);
    if (!catToUpdate) return;

    console.log("움직이니?", data);
    const newXY = { x: data.x, y: data.y };
    // 현재 위치와 새 위치 비교
    if (
      catToUpdate.defaultPosition &&
      catToUpdate.defaultPosition.x === newXY.x &&
      catToUpdate.defaultPosition.y === newXY.y
    ) {
      console.log("위치가 동일하므로 업데이트하지 않음");
      return;
    }
    // 지금 위치를 백분율 할때 {x: (cat.defaultPosition.x/width)*100, y: (cat.defaultPosition.y/height)*100}
    try {
      // 서버로 업데이트 요청
      console.log("화면 사이즈", size.width);
      await dispatch(
        updateChatbotJins({
          id,
          updateData: {
            defaultPosition: newXY,
            position: {
              x: (newXY.x / size.width) * 100,
              y: (newXY.y / size.height) * 100,
            },
          },
        })
      );
      console.log("Cat updated successfully in DB");
      // 여기서 추가로 상태를 업데이트하거나 다른 동작 수행 가능
    } catch (error) {
      console.error("Failed to update cat in DB:", error);
    }
  };

  // zIndex 변경 (-1 또는 +1) 2~20사이로만 변경가능
  const handleZIndexChange = async (id, newZIndex) => {
    const catToUpdate = cats.find((cat) => cat._id === id);

    if (!catToUpdate) return;
    // 새로운 값 대입
    const clampedZIndex = Math.max(2, Math.min(newZIndex, 20));
    try {
      // 서버로 업데이트 요청
      await dispatch(
        updateChatbotJins({
          id,
          updateData: { zIndex: clampedZIndex },
        })
      );
      console.log("Cat updated successfully in DB");
      // 여기서 추가로 상태를 업데이트하거나 다른 동작 수행 가능
    } catch (error) {
      console.error("Failed to update cat in DB:", error);
    }
  };

  // 좌우 반전 토글
  const handleFlip = async (id) => {
    const catToUpdate = cats.find((cat) => cat._id === id);

    if (!catToUpdate) return;

    try {
      // flipped 상태를 반전한 데이터 생성
      const updatedCat = !catToUpdate.flip;

      // 서버로 업데이트 요청
      await dispatch(
        updateChatbotJins({
          id,
          updateData: { flip: updatedCat },
        })
      );
      console.log("Cat updated successfully in DB");
      // 여기서 추가로 상태를 업데이트하거나 다른 동작 수행 가능
    } catch (error) {
      console.error("Failed to update cat in DB:", error);
    }
  };

  // const renderedCats = !loading ? cats : localCats; // cats만 줘야 로컬 포지션 관리 가능

  return (
    <div
      ref={parentRef}
      style={{ position: "relative", width: "100%", height: "100%" }}
    >
      {cats
        .filter((cat) => cat.visualization) // visualization이 true인 것만 필터링
        .map((cat) => (
          <DraggableCat
            key={cat._id}
            id={cat._id}
            image={cat.product_id.image}
            defaultPosition={cat.defaultPosition}
            zIndex={cat.zIndex}
            flip={cat.flip}
            onZIndexChange={handleZIndexChange}
            onFlip={handleFlip}
            onDragStop={handleDragStop}
          />
        ))}
    </div>
  );
}

function DraggableCat({
  id,
  image,
  defaultPosition,
  zIndex,
  flip,
  onZIndexChange,
  onFlip,
  onDragStop,
}) {
  // 말풍선 표시 상태와 타이머 참조 추가
  const [isSpeechBubbleVisible, setIsSpeechBubbleVisible] = useState(false);
  const [activeInputId, setActiveInputId] = useState(null); // 현재 입력 필드가 활성화된 고양이 ID
  const { loading } = useSelector((state) => state.chatbot);
  const [localPosition, setLocalPosition] = useState(defaultPosition); // 로딩중 임시 좌표
  const timerRef = useRef(null);

  useEffect(() => {
    setLocalPosition(defaultPosition);
  }, [defaultPosition]); // 이게 정답이였던 것 ㅠㅠㅠㅠ

  // 로딩중일때 임시 좌표
  const handleDragStopLoding = (e, data) => {
    const newXY = { x: data.x, y: data.y };

    // 1. 로컬 상태 업데이트
    setLocalPosition(newXY);

    // 2. 상위 컴포넌트에 새 위치 전달
    onDragStop(id, newXY);
  };

  // 이미지 클릭 시 말풍선 표시 및 타이머 설정
  const handleImageClick = () => {
    setIsSpeechBubbleVisible(true);

    // 기존 타이머가 있으면 초기화
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // 3초 후에 말풍선 숨기기
    timerRef.current = setTimeout(() => {
      setIsSpeechBubbleVisible(false);
      timerRef.current = null; // 타이머 참조 초기화
    }, 3000);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setActiveInputId((prevId) => (prevId === id ? null : id)); // 동일 ID 클릭 시 닫기
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <Draggable
      position={!loading ? defaultPosition : localPosition} // defaultPosition 사용 보류
      onStop={(e, data) => handleDragStopLoding(id, data)}
      bounds="parent"
    >
      <div
        style={{
          position: "absolute",
          zIndex: zIndex,
          cursor: "grab",
        }}
        onContextMenu={handleContextMenu}
      >
        {/* 말풍선 렌더링 */}
        {isSpeechBubbleVisible && (
          <div
            style={{
              position: "absolute",
              bottom: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              marginBottom: 10,
              background: "#fff",
              padding: "5px 10px",
              borderRadius: "10px",
              border: "1px solid #ccc",
              textAlign: "center",
              whiteSpace: "nowrap",
            }}
          >
            야옹!
          </div>
        )}
        <img
          src={image}
          alt="Draggable Cat"
          draggable="false"
          onClick={handleImageClick} // 클릭 핸들러 추가
          style={{
            width: 100,
            transform: flip ? "scaleX(-1)" : "none",
          }}
        />
        {activeInputId === id && (
          <div
            style={{
              marginTop: 5,
              background: "#fff",
              padding: "5px",
              border: "1px solid #ccc",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <button
              onClick={() => onZIndexChange(id, zIndex - 1)}
              disabled={zIndex <= 2}
            >
              아래로
            </button>
            <button
              onClick={() => onZIndexChange(id, zIndex + 1)}
              disabled={zIndex >= 20}
            >
              위로
            </button>
            <button onClick={() => onFlip(id)}>좌우 반전</button>
          </div>
        )}
      </div>
    </Draggable>
  );
}

export default MyCatsComponent;
