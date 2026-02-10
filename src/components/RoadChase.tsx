export default function RoadChase() {
    return (
        <div className="roadchase" aria-hidden="true">
            {/* Road */}
            <div className="roadchase__road">
                <div className="roadchase__dashes" />
            </div>

            {/* Rabbit silhouette (clean) */}
            <svg className="roadchase__rabbit" viewBox="0 0 220 120">
                <g fill="#000">
                    {/* ears */}
                    <path d="M150 10c18-6 34 10 22 28-8 12-22 16-34 12 10-10 14-22 12-40z" />
                    <path d="M120 16c14-10 32 2 28 18-3 13-16 18-28 16 6-10 8-18 0-34z" />
                    {/* head */}
                    <path d="M105 45c22-20 62-4 62 22 0 22-22 34-54 30-22-3-32-16-32-28 0-8 7-18 24-24z" />
                    {/* body */}
                    <path d="M40 78c10-26 42-34 74-26 14 4 28 14 34 30 8 20-6 34-30 34H78c-22 0-46-6-38-38z" />
                    {/* front paw */}
                    <path d="M112 96c10 0 18 6 18 12 0 8-10 10-20 6-8-3-10-12 2-18z" />
                    {/* back leg */}
                    <path d="M54 96c-18 2-30 14-24 22 8 10 34 2 44-10 6-8-2-14-20-12z" />
                    {/* tail */}
                    <path d="M28 80c-12-2-20 6-18 14 3 10 22 10 28 2 6-6 2-14-10-16z" />
                </g>
            </svg>

            {/* Alice silhouette (clean running) */}
            <svg className="roadchase__alice" viewBox="0 0 240 140">
                <g fill="#000">
                    {/* head */}
                    <path d="M150 34c0 16-13 28-29 28s-29-12-29-28 13-28 29-28 29 12 29 28z" />
                    {/* hair/back head */}
                    <path d="M92 42c8-18 24-30 44-30 18 0 32 8 38 22-8-4-18-6-30-6-22 0-38 6-52 14z" />
                    {/* torso + dress */}
                    <path d="M98 64c10-6 24-8 38-6 16 3 26 12 30 24 6 18 12 30 16 46 4 14-10 18-54 18s-66-4-60-18c6-16 16-34 30-52z" />
                    {/* front arm */}
                    <path d="M82 88c-16 6-30 16-36 24-6 8 6 14 20 8 10-4 22-18 28-28 4-8-2-10-12-4z" />
                    {/* back arm */}
                    <path d="M164 86c16 4 30 14 38 22 8 8-4 16-18 10-10-4-22-16-30-26-6-8 0-10 10-6z" />
                    {/* legs (running) */}
                    <path d="M118 126c-18 16-24 28-12 34 14 6 30-14 40-30 6-10-2-12-28-4z" />
                    <path d="M150 124c10 18 18 34 34 30 14-4 6-20-12-36-18-16-30-14-22 6z" />
                </g>
            </svg>
        </div>
    );
}
