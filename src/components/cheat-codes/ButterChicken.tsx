"use client";

export function ButterChicken() {
    return (
        <div
            className="fixed inset-0 z-[200] pointer-events-auto"
            style={{
                backgroundImage: "url(/assets/cheat-codes/butterchicken.png)",
                backgroundSize: "200px 200px",
                backgroundRepeat: "repeat",
            }}
        >
            {/* Gradient overlay for blended edges */}
            <div
                className="absolute inset-0"
                style={{
                    background: "linear-gradient(135deg, rgba(255,200,100,0.3) 0%, rgba(200,80,20,0.2) 50%, rgba(255,200,100,0.3) 100%)",
                }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
                <p className="font-[family-name:var(--font-instrument-serif)] text-6xl md:text-8xl text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)] text-center">
                    Butter Chicken
                </p>
            </div>
        </div>
    );
}
