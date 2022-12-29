import React from "react";
import images from "./assets/img";

function Landscape() {
  return (
    <div className="crazy-rocket crazy-rocket__landscape">
      <div className="landscape__icon">
        <img
          src={images.landscapeIcon}
          alt=""
          className="landscape__icons-svg"
        />
      </div>
    </div>
  );
}

export default Landscape;
