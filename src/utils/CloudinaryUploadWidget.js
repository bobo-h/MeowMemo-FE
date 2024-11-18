import React, { useEffect, useRef } from "react";
import Button2 from "../common/components/Button2";

const CloudinaryUploadWidget = ({ uploadImage }) => {
  const widgetRef = useRef(null);

  useEffect(() => {
    const myWidget = window.cloudinary.createUploadWidget(
      {
        cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
        uploadPreset: process.env.REACT_APP_CLOUDINARY_PRESET,
      },
      (error, result) => {
        if (!error && result && result.event === "success") {
          console.log("Uploaded image info:", result.info);
          uploadImage(result.info.secure_url); // 부모 컴포넌트에 URL 전달
        }
      }
    );
    widgetRef.current = myWidget;
  }, [uploadImage]);

  const handleOpenWidget = () => {
    if (widgetRef.current) {
      widgetRef.current.open(); // 위젯 열기
    }
  };

  return <Button2 onClick={handleOpenWidget}>사진 업로드 +</Button2>;
};

export default CloudinaryUploadWidget;
