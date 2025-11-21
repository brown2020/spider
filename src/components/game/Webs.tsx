import React from "react";
import { Web } from "@/lib/types/game";
import { GAME_CONFIG } from "@/lib/constants/gameConfig";

interface WebsProps {
    webs: Web[];
}

const Webs: React.FC<WebsProps> = ({ webs }) => {
    if (!webs || webs.length === 0) return null;

    return (
        <>
            {webs.map((web) => {
                const now = Date.now();
                const timeElapsed = now - web.createdAt;
                const timeRemaining = web.lifetime - timeElapsed;

                // Skip rendering if web is expired
                if (timeRemaining <= 0) return null;

                const opacity = Math.max(0.2, 1 - timeElapsed / web.lifetime);

                return (
                    <div
                        key={web.id}
                        className="absolute bg-white"
                        style={{
                            left: web.startPos.x,
                            top: web.startPos.y,
                            width: Math.hypot(
                                web.endPos.x - web.startPos.x,
                                web.endPos.y - web.startPos.y
                            ),
                            height: GAME_CONFIG.web.thickness,
                            transformOrigin: "left center",
                            transform: `rotate(${Math.atan2(
                                web.endPos.y - web.startPos.y,
                                web.endPos.x - web.startPos.x
                            )}rad)`,
                            opacity: opacity,
                            zIndex: 1000,
                        }}
                    />
                );
            })}
        </>
    );
};

export default Webs;
