"use client";

import {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
} from "react";
import Matter from "matter-js";

const THEMES = [
  ["🎮", "🕹️", "👾", "🎲", "📺"],
  ["🏀", "⚽", "⛹️‍♂️", "🥅", "👟"],
  ["🎨", "🖌️", "✏️", "📐", "🖼️"],
  ["💻", "⌨️", "🖱️", "📱", "🔌"],
  ["🕶️", "🥽", "🌌", "🎮", "🌐"],
];

export interface PhysicsEmojisRef {
  spawn: (x: number, y: number) => void;
}

export const PhysicsEmojis = forwardRef<PhysicsEmojisRef, object>(
  function PhysicsEmojis(_, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<Matter.Engine | null>(null);
    const renderRef = useRef<Matter.Render | null>(null);
    const runnerRef = useRef<Matter.Runner | null>(null);

    const [themeIndex, setThemeIndex] = useState(0);
    const emojisRef = useRef<{ body: Matter.Body; elem: HTMLDivElement }[]>([]);

    useEffect(() => {
      if (!containerRef.current) return;

      const engine = Matter.Engine.create();
      engineRef.current = engine;

      const runner = Matter.Runner.create();
      runnerRef.current = runner;
      Matter.Runner.run(runner, engine);

      const staticBodies: Matter.Body[] = [];

      const syncColliders = () => {
        Matter.World.remove(engine.world, staticBodies);
        staticBodies.length = 0;

        const colliders = document.querySelectorAll(".physics-collider");
        colliders.forEach((el) => {
          const rect = el.getBoundingClientRect();
          const x = rect.left + window.scrollX + rect.width / 2;
          const y = rect.top + window.scrollY + rect.height / 2;

          const body = Matter.Bodies.rectangle(x, y, rect.width, rect.height, {
            isStatic: true,
            restitution: 0.6,
            friction: 0.1,
          });
          staticBodies.push(body);
        });
        Matter.World.add(engine.world, staticBodies);
      };

      syncColliders();

      const updateLoop = () => {
        const bodiesToRemove: Matter.Body[] = [];
        const emojisToRemove: typeof emojisRef.current = [];

        emojisRef.current.forEach((item) => {
          const { body, elem } = item;

          if (body.position.y > document.documentElement.scrollHeight + 100) {
            bodiesToRemove.push(body);
            emojisToRemove.push(item);
            elem.remove();
          } else {
            elem.style.transform = `translate(${body.position.x}px, ${body.position.y}px) translate(-50%, -50%) rotate(${body.angle}rad)`;
          }
        });

        if (bodiesToRemove.length > 0) {
          Matter.World.remove(engine.world, bodiesToRemove);
          emojisRef.current = emojisRef.current.filter(
            (e) => !emojisToRemove.includes(e)
          );
        }

        requestAnimationFrame(updateLoop);
      };

      const loopId = requestAnimationFrame(updateLoop);

      const handleResize = () => {
        syncColliders();
      };

      window.addEventListener("resize", handleResize);

      return () => {
        cancelAnimationFrame(loopId);
        window.removeEventListener("resize", handleResize);
        if (renderRef.current) Matter.Render.stop(renderRef.current);
        if (runnerRef.current) Matter.Runner.stop(runnerRef.current);
        if (engineRef.current) Matter.Engine.clear(engineRef.current);
        if (engineRef.current && runnerRef.current)
          Matter.Runner.stop(runnerRef.current);

        emojisRef.current.forEach(({ elem }) => elem.remove());
      };
    }, []);

    useImperativeHandle(ref, () => ({
      spawn: (x: number, y: number) => {
        const engine = engineRef.current;
        if (!engine || !containerRef.current) return;

        const theme = THEMES[themeIndex];

        setThemeIndex((prev) => (prev + 1) % THEMES.length);

        const emojisToSpawn = [...theme, ...theme];

        emojisToSpawn.forEach((emojiChar) => {
          const spawnX = x + (Math.random() - 0.5) * 40;
          const spawnY = y + (Math.random() - 0.5) * 40;

          const size = 40;

          const elem = document.createElement("div");
          elem.innerText = emojiChar;
          elem.style.position = "absolute";
          elem.style.top = "0";
          elem.style.left = "0";
          elem.style.fontSize = "32px";
          elem.style.width = `${size}px`;
          elem.style.height = `${size}px`;
          elem.style.display = "flex";
          elem.style.alignItems = "center";
          elem.style.justifyContent = "center";
          elem.style.pointerEvents = "none";
          elem.style.zIndex = "9999";
          elem.style.userSelect = "none";
          elem.style.willChange = "transform";
          elem.style.transform = `translate(-1000px, -1000px) translate(-50%, -50%)`;

          containerRef.current!.appendChild(elem);

          const body = Matter.Bodies.circle(spawnX, spawnY, size / 2, {
            restitution: 0.8,
            friction: 0.1,
            density: 0.001,
          });

          Matter.Body.setVelocity(body, {
            x: (Math.random() - 0.5) * 15,
            y: (Math.random() - 1.0) * 15 - 5,
          });

          Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.5);

          Matter.World.add(engine.world, [body]);

          emojisRef.current.push({ body, elem });
        });
      },
    }));

    return (
      <div
        ref={containerRef}
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ zIndex: 9999, height: "100%" }}
      />
    );
  }
);
