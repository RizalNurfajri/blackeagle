export const smoothTransition = {
    type: "tween" as const,
    ease: [0.25, 0.1, 0.25, 1.0] as any, // Cubic bezier for smooth ease-out
    duration: 0.5
}

export const springTransition = {
    type: "spring" as const,
    stiffness: 100,
    damping: 15,
    mass: 1
}

export const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: smoothTransition
}

export const fadeInScale = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: smoothTransition
}

export const slideDown = {
    initial: { y: -20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: smoothTransition
}
