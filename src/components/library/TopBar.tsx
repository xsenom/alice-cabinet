import React from "react";
import { TOKENS } from "../../lib/library/tokens";
import { useSessionProfile } from "../../hooks/useSessionProfile";

export function LibraryTopBar() {
    const { profile } = useSessionProfile();
    const name = profile?.full_name?.trim() || "друг";

    return (
        <div className="px-2 pt-1">
            <div className="flex items-center gap-3">
                {profile?.avatar_url ? (
                    <img
                        src={profile.avatar_url}
                        alt="Аватар"
                        className="h-10 w-10 rounded-full border border-white/15 object-cover"
                    />
                ) : (
                    <div className="h-10 w-10 rounded-full border border-white/15 bg-black" />
                )}
                <div className="text-[18px] font-semibold tracking-tight" style={{ color: TOKENS.text }}>
                    {name}, всё получится!
                </div>
            </div>
        </div>
    );
}
