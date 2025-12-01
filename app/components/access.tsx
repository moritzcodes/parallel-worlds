'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface RoleBasedAccessControlProps {
  onAccessGranted: () => void;
}

const RoleBasedAccessControl = ({ onAccessGranted }: RoleBasedAccessControlProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasBeenClicked, setHasBeenClicked] = useState(false);

  const handleClick = () => {
    if (!hasBeenClicked) {
      setHasBeenClicked(true);
      setIsAnimating(true);
      // Call onAccessGranted after animation completes (1.15s + some buffer)
      setTimeout(() => {
        onAccessGranted();
      }, 1200);
    }
  };

  return (
    <div
      className="relative h-[400px] w-[400px] flex items-center justify-center cursor-pointer group"
      style={{
        mask: 'radial-gradient(90% 88% at 50% 50%,#fff 10%,transparent 65%)',
        WebkitMask: 'radial-gradient(90% 88% at 50% 50%,#fff 10%,transparent 65%)',
      }}
      onClick={handleClick}
    >
      <CircleAnimation
        width={360}
        height={360}
        index={2}
        opacity={0.5}
        isAnimating={isAnimating}
      />
      <CircleAnimation
        width={270}
        height={270}
        index={1}
        opacity={0.5}
        isAnimating={isAnimating}
      />
      <CircleAnimation
        width={180}
        height={180}
        index={0}
        opacity={0.5}
        isAnimating={isAnimating}
      />
      <motion.div
        initial={{ x: 0 }}
        animate={
          isAnimating
            ? {
                scale: [1, 1.05, 0.9, 0.95, 1.05, 1],
              }
            : {
                scale: 1,
              }
        }
        transition={{
          duration: 1.15,
          ease: 'easeInOut',
          times: [0, 0.2, 0.4, 0.6, 0.8, 1],
        }}
        className="w-[140px] h-[74px] flex items-center rounded-full relative px-2 bg-black/33"
        style={{
          boxShadow: 'inset 0 0 50px 0 rgba(255, 255, 255, 0.08), inset 0 -8px 10px 0 rgba(255, 255, 255, 0.02)',
        }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            padding: '1px',
            backgroundImage: 'linear-gradient(180deg,hsla(0,0%,100%,.15),hsla(0,0%,100%,0))',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            WebkitMaskComposite: 'xor',
          }}
        />
        <div
          className={`w-[60px] h-[60px] rounded-full flex items-center justify-center border relative transition-all duration-400 ${
            isAnimating
              ? 'translate-x-full delay-400 drop-shadow-[0_0_4px_#FFFFFF] border-white'
              : 'border-white/10'
          }`}
          style={{
            transitionTimingFunction: 'cubic-bezier(0,0,0.2,1)',
          }}
        >
          <svg
            width="60"
            height="60"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 5v14l11-7z"
              fill="#fff"
            ></path>
          </svg>
        </div>
      </motion.div>
    </div>
  );
};

const CircleAnimation = ({
  isAnimating,
  width,
  height,
  index,
  opacity,
}: {
  isAnimating?: boolean;
  width: number;
  height: number;
  index: number;
  opacity: number;
}) => {
  return (
    <motion.div
      animate={isAnimating ? { scale: [1, 0.95, 1.1, 1.05, 1] } : { scale: 1 }}
      transition={{
        duration: 1.2,
        ease: 'linear',
        delay: 0.5 + index * 0.1,
        times: [0, 0.25, 0.5, 0.75, 1],
      }}
      className="absolute rounded-full"
      style={{
        width,
        height,
        top: `calc(50% - ${height / 2}px)`,
        left: `calc(50% - ${width / 2}px)`,
        padding: '1.5px',
        backgroundImage: 'linear-gradient(180deg,hsla(0,0%,100%,.42),#222 44.79%)',
        boxShadow: 'inset 0 -16px 32px rgba(255, 255, 255, 0.04)',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0)',
        maskComposite: 'exclude',
        WebkitMaskComposite: 'xor',
        opacity: opacity,
      }}
    />
  );
};

export default RoleBasedAccessControl;