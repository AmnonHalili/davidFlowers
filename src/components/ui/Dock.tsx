'use client';

import { MotionValue, motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';

export interface DockProps {
    children: React.ReactNode;
    className?: string;
    magnification?: number;
    distance?: number;
    panelHeight?: number;
}

export interface DockItemProps {
    children: React.ReactNode;
    className?: string;
    mouseX?: MotionValue;
    magnification?: number;
    distance?: number;
}

export function Dock({
    children,
    className,
    magnification = 60,
    distance = 140,
    panelHeight = 64,
}: DockProps) {
    const mouseX = useMotionValue(Infinity);

    return (
        <motion.div
            style={{
                height: panelHeight,
                padding: '0 12px',
            }}
            onMouseMove={(e) => mouseX.set(e.pageX)}
            onMouseLeave={() => mouseX.set(Infinity)}
            className={`flex gap-4 items-end rounded-2xl bg-transparent ${className || ''}`}
        >
            {/* 
               We pass mouseX, magnification, and distance to children via render prop or context if we were flexible,
               but here we assume direct children usage or mapped usage. 
               However, to make it clean, we can clone children.
            */}
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child, { mouseX, magnification, distance });
                }
                return child;
            })}
        </motion.div>
    );
}

export function DockItem({
    children,
    className,
    mouseX,
    magnification = 60,
    distance = 140,
}: DockItemProps) {
    const ref = useRef<HTMLDivElement>(null);

    const distanceCalc = useTransform(mouseX || new MotionValue(Infinity), (val) => {
        const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
        return val - bounds.x - bounds.width / 2;
    });

    const widthSync = useTransform(distanceCalc, [-distance, 0, distance], [40, magnification, 40]);
    const width = useSpring(widthSync, {
        mass: 0.1,
        stiffness: 150,
        damping: 12,
    });

    return (
        <motion.div
            ref={ref}
            style={{ width, height: width }}
            className={`flex items-center justify-center rounded-full  ${className || ''}`}
        >
            {children}
        </motion.div>
    );
}

// Simplified version for text links which might not need full icon circular dock behavior
// but rather just scaling text.
export function DockLink({ children, mouseX, magnification = 1.2, distance = 100, className, onClick }: { children: React.ReactNode, mouseX?: MotionValue, magnification?: number, distance?: number, className?: string, onClick?: () => void }) {
    const ref = useRef<HTMLDivElement>(null);
    const distanceCalc = useTransform(mouseX || new MotionValue(Infinity), (val) => {
        const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
        return val - bounds.x - bounds.width / 2;
    });

    // For text, we scale font-size or scale transform
    const scaleSync = useTransform(distanceCalc, [-distance, 0, distance], [1, magnification, 1]);
    const scale = useSpring(scaleSync, {
        mass: 0.1,
        stiffness: 150,
        damping: 12,
    });

    return (
        <motion.div
            ref={ref}
            style={{ scale }}
            onClick={onClick}
            className={`origin-bottom flex items-center justify-center cursor-pointer ${className || ''}`}
        >
            {children}
        </motion.div>
    );
}

import React from 'react';
