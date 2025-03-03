import React, { useState, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";

interface ImageCropperProps {
  image: string;
  onCropComplete: (croppedArea: Area, croppedAreaPixels: Area) => void;
  setFinishedCropping: React.Dispatch<React.SetStateAction<boolean>>;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ image, onCropComplete,setFinishedCropping }) => {
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);

  return (
    <div style={{ position: "fixed", maxWidth: '100vh', maxHeight: '100vh',width:400,height:400,zIndex:7,left:'50%',transform:'translateX(-50%) translateY(-50%)',top:'50%',borderRadius:10,overflow:'hidden',backgroundColor:'#121212' }}>
      <Cropper
        image={image}
        crop={crop}
        zoom={zoom}
        aspect={1} // 1:1 aspect ratio
        onCropChange={setCrop}
        onZoomChange={setZoom}
        onCropComplete={onCropComplete}
      />
      <input
        className="slider"
        type="range"
        min="1"
        max="3"
        step="0.01"
        value={zoom}
        style={{zIndex:10,position:'absolute',width:'calc(100% - 30px)',left:0,transform:'translateX(15px)',bottom:10,outline:'none'}}
        onChange={(e) => setZoom(parseFloat(e.target.value))}
      />
      <button onClick={()=>setFinishedCropping(true)} style={{position:'absolute',top:10,right:10,backgroundColor:'#1DB954',fontSize: 15,color:'#121212',cursor:'pointer',padding:'7px 17px',borderRadius:7,border:0,fontWeight:500}} >Done</button>
    </div>
  );
};

export  async function getCroppedImg(imageSrc: string, croppedAreaPixels: { x: number; y: number; width: number; height: number }): Promise<File> {
    const image = new Image();
    image.src = imageSrc;
    
    await new Promise((resolve) => {
      image.onload = resolve;
    });
  
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
  
    if (!ctx) {
      throw new Error("Could not get canvas context");
    }
  
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.width;
  
    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );
  
    return new Promise<File>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
            const file = new File([blob], "cropped-image.png", { type: "image/png" });
            resolve(file);
        }
      }, "image/png");
    });
  }
  

export default ImageCropper;
