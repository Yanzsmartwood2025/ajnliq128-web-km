import { useBackground } from "./BackgroundManager";
import TiltedCard from "./TiltedCard";
import GlareHover from "./GlareHover";
import BorderGlow from "./BorderGlow";
import SplashCursor from "./SplashCursor";
import dynamic from 'next/dynamic'
import React, { useRef, useEffect } from "react";

const RippleDistortion = dynamic(() => import('@/components/RippleDistortion'), { ssr: false })

interface BubbleWrapperProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<any>) => void;
}

export function BubbleWrapper({ children, className = "", onClick }: BubbleWrapperProps) {
  const { settings } = useBackground();
  const effect = settings.bubbleEffect;

  const innerClasses = "w-full h-full rounded-full";

  const handleWrapperClick = (e: React.MouseEvent<any>) => {
    // Para splashCursor el efecto captura el click interno
    if (onClick) {
      onClick(e);
    }
  }

  // Si no hay efecto o el efecto es none, retornamos los children directo.
  // Pero necesitamos el onClick y las clases.
  // Asumimos que children es un componente que acepta onClick, o envolvemos en div.

  return (
    <div className={`relative ${className}`} onClick={handleWrapperClick} style={{ display: 'inline-block' }}>
      {effect === 'none' && (
         <div className={innerClasses}>{children}</div>
      )}
      {effect === 'tiltedCard' && (
        <TiltedCard className={innerClasses}>{children}</TiltedCard>
      )}
      {effect === 'glareHover' && (
        <GlareHover className={`${innerClasses} rounded-full`}>{children}</GlareHover>
      )}
      {effect === 'borderGlow' && (
        <BorderGlow className={innerClasses} glowColor="#a855f7">{children}</BorderGlow>
      )}
      {effect === 'splashCursor' && (
        <SplashCursor className={`${innerClasses} rounded-full`}>{children}</SplashCursor>
      )}
      {effect === 'rippleDistortion' && (
        <div className={`${innerClasses} relative overflow-hidden rounded-full`}>
           <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
             <RippleDistortion tint="#ffffff" />
           </div>
           {children}
        </div>
      )}
    </div>
  )
}
