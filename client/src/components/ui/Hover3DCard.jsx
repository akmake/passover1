import React, { createContext, useState, useContext, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const MouseEnterContext = createContext(undefined);

// --- START: ADD THIS MISSING FUNCTION ---
export const useMouseEnter = () => {
  const context = useContext(MouseEnterContext);
  if (context === undefined) {
    throw new Error("useMouseEnter must be used within a MouseEnterProvider");
  }
  return context;
};
// --- END: ADD THIS MISSING FUNCTION ---

export const CardContainer = ({ children, className, containerClassName }) => {
  const containerRef = useRef(null);
  const [isMouseEntered, setIsMouseEntered] = useState(false);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 25;
    const y = (e.clientY - top - height / 2) / 25;
    rotateX.set(y);
    rotateY.set(x);
  };

  const handleMouseEnter = () => setIsMouseEntered(true);
  const handleMouseLeave = () => {
    setIsMouseEntered(false);
    rotateX.set(0);
    rotateY.set(0);
  };

  const rotateX = useSpring(useMotionValue(0), { stiffness: 400, damping: 30 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 400, damping: 30 });

  return (
    <MouseEnterContext.Provider value={[isMouseEntered, setIsMouseEntered]}>
      <motion.div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        className={twMerge("flex items-center justify-center", containerClassName)}
        style={{ perspective: "1000px" }}
      >
        <motion.div
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className={twMerge("relative transition-all duration-200 ease-linear", className)}
        >
          {children}
        </motion.div>
      </motion.div>
    </MouseEnterContext.Provider>
  );
};

export const CardBody = ({ children, className }) => {
  return (
    <div className={twMerge("h-96 w-96 [transform-style:preserve-3d] [&>*]:[transform-style:preserve-3d]", className)}>
      {children}
    </div>
  );
};

export const CardItem = ({
  as: Tag = "div",
  children,
  className,
  translateX = 0,
  translateY = 0,
  translateZ = 0,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  ...rest
}) => {
  const ref = useRef(null);
  const [isMouseEntered] = useMouseEnter();

  const x = useSpring(useMotionValue(0), { stiffness: 400, damping: 25 });
  const y = useSpring(useMotionValue(0), { stiffness: 400, damping: 25 });

  useEffect(() => {
    if (isMouseEntered) {
      x.set(translateX);
      y.set(translateY);
    } else {
      x.set(0);
      y.set(0);
    }
  }, [isMouseEntered, translateX, translateY, x, y]);

  return (
    <motion.div
      ref={ref}
      style={{ x, y, rotateX, rotateY, rotateZ, translateZ }}
      className={twMerge(className)}
      {...rest}
    >
      {children}
    </motion.div>
  );
};