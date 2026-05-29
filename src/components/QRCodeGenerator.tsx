"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";

interface QRCodeGeneratorProps {
    value: string;
    size?: number;
    fgColor?: string;
    bgColor?: string;
}

export default function QRCodeGenerator({
    value,
    size = 200,
    fgColor = "#00d2c4", // Default tactical cyan/primary tint
    bgColor = "#00000000", // Default transparent
}: QRCodeGeneratorProps) {
    const [qrUrl, setQrUrl] = useState<string>("");
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        if (!value) return;

        // Since color values can be hex or rgb, let's make sure qrcode can parse them.
        // We'll clean up transparency if it's #00000000 (rgba transparent fallback).
        const darkColor = fgColor;
        const lightColor = bgColor === "transparent" || bgColor === "#00000000" ? "#00000000" : bgColor;

        QRCode.toDataURL(
            value,
            {
                width: size,
                margin: 2,
                color: {
                    dark: darkColor,
                    light: lightColor,
                },
            },
            (err, url) => {
                if (err) {
                    console.error("QR Code generation error:", err);
                    setError(true);
                } else {
                    setQrUrl(url);
                    setError(false);
                }
            }
        );
    }, [value, size, fgColor, bgColor]);

    if (error) {
        return (
            <div 
                className="flex items-center justify-center border border-red-500/30 text-red-400 text-xs font-mono p-4"
                style={{ width: size, height: size }}
            >
                [ ERROR: QR_GEN_FAIL ]
            </div>
        );
    }

    if (!qrUrl) {
        return (
            <div 
                className="flex items-center justify-center border border-[#333] text-white/30 text-xs font-mono animate-pulse"
                style={{ width: size, height: size }}
            >
                [ SECURING LINK... ]
            </div>
        );
    }

    return (
        <div className="relative flex items-center justify-center p-2 bg-white/5 border border-white/10 rounded">
            {/* Tech Corner Deco */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary/40" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary/40" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary/40" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary/40" />

            <img
                src={qrUrl}
                alt="QR Code"
                className="object-contain"
                style={{ width: size, height: size }}
            />
        </div>
    );
}
