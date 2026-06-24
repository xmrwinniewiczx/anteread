@import url('https://fonts.googleapis.com/css2?family=Unbounded:wght=800;900&family=Syne:wght=800&family=Inter:wght=400;600&display=swap');

:root {
    --bg-color: #faf9f6;          
    --text-color: #0b0c10;        
    --accent-color: #faad17;      
    --border-color: #0b0c10;
    --font-display: 'Unbounded', sans-serif; 
    --font-heading: 'Syne', sans-serif;
    --font-body: 'Inter', sans-serif;
}

* {
    box-sizing: border-box;
}

body {
    background-color: var(--bg-color);
    color: var(--text-color);
    font-family: var(--font-body);
    margin: 0;
    padding: 0;
    min-height: 100vh;
    
    /* Massive Yellow Pillars on the Sides */
    border-left: 48px solid var(--accent-color);
    border-right: 48px solid var(--accent-color);
}

/* Static Header Spacing */
.main-header {
    width: 100%;
    background-color: var(--bg-color);
    padding: 5rem 2rem 0rem 2rem; 
}

.header-inner {
    max-width: 1200px;
    margin: 0 auto;
    text-align: center; 
    border-bottom: none; 
}

/* Optimized centered layout style */
.header-heading {
    font-family: var(--font-display);
    font-weight: 900;
    text-transform: uppercase;
    margin: 0;
    padding: 0;
    font-size: 6.2rem; 
    line-height: 1;  
    letter-spacing: -0.04em;
    white-space: nowrap;
    display: inline-block;
}

.color-one { color: var(--text-color); }
.color-two { color: var(--accent-color); }

/* Main Content Layout Grid */
.content-wrapper {
    max-width: 1200px;
    margin: 0 auto;
    padding: 4rem 2rem 6rem 2rem;
}

section {
    margin-bottom: 7rem;
}

/* Section Separator Meta Lines */
.section-meta {
    display: flex;
    justify-content: space-between;
    font-family: var(--font-display);
    font-size: 0.75rem;
    font-weight: 800;
    border-bottom: 2px solid var(--border-color);
    padding-bottom: 0.5rem;
    margin-bottom: 3rem;
    color: var(--text-color);
}

.brutalist-heading {
    font-family: var(--font-heading);
    font-weight: 800;
    font-size: 3.5rem;
    text-transform: uppercase;
    margin-top: 0;
    margin-bottom: 3rem;
    letter-spacing: -0.03em;
}

/* Currently Reading Card Frame */
.current-book-layout {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 600px;
    width: 100%;
    text-align: center;
    padding: 4rem 2rem; 
    background: var(--bg-color);
    border: 3px solid var(--border-color);
    box-shadow: 20px 20px 0px var(--text-color);
    margin: 0 auto;
}

.current-book-layout img {
    width: 75%;
    max-width: 280px;
    height: auto;
    object-fit: cover;
    border: 2px solid var(--border-color);
    margin-bottom: 2.5rem;
    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}

.current-title {
    font-family: var(--font-heading);
    font-weight: 800;
    font-size: 2.5rem;
    text-transform: uppercase;
    line-height: 1.1;
    margin: 0 0 0.5rem 0;
}

.current-author {
    font-family: var(--font-body);
    font-size: 1.2rem;
    text-transform: uppercase;
    font-weight: 600;
    margin: 0;
}

/* --- 3D FLIPPING VOTING TILES --- */
#voting-options-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 30px; 
    margin-bottom: 4rem;
    padding: 10px 0;
}

/* The outer frame sets up the 3D space perspective */
.vote-option-tile {
    perspective: 1000px;
    cursor: pointer;
    width: 100%;
    max-width: 280px;
    height: 460px; /* Uniform grid card height */
    margin: 0 auto;
    display: block;
    position: relative;
}

/* Top Right checkbox configuration placement */
.vote-option-tile input[type="checkbox"] {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    accent-color: var(--text-color);
    transform: scale(1.4);
    z-index: 20; 
    margin: 0;
}

/* The core canvas container element that rotates */
.tile-card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    transform-style: preserve-3d;
}

/* 1. DESKTOP HOVER ROUTE: Spins strictly on mouse presence IF NOT checked */
@media (hover: hover) {
    .vote-option-tile:not(:has(input[type="checkbox"]:checked)):hover .tile-card-inner {
        transform: rotateY(180deg);
    }
}

/* 2. MOBILE TAP CLASS ROUTE: Spins when class is added via touch click interaction */
.vote-option-tile.reveal-back:not(:has(input[type="checkbox"]:checked)) .tile-card-inner {
    transform: rotateY(180deg);
}

/* Face Shared Settings (Front and Back layout parameters) */
.tile-front, .tile-back {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    backface-visibility: hidden; 
    border: 3px solid var(--border-color);
    padding: 3.5rem 1.5rem 1.5rem 1.5rem; 
    display: flex;
    flex-direction: column;
    background: var(--bg-color);
    transition: background-color 0.2s ease;
    box-sizing: border-box; 
}

/* FRONT CARD STYLING */
.tile-front {
    z-index: 2;
    transform: rotateY(0deg);
}

.vote-cover {
    width: 100%;
    height: 260px; 
    object-fit: cover;
    border: 2px solid var(--border-color);
    margin-bottom: 1.25rem;
    display: block;
}

.vote-details {
    margin-top: auto;
}

.vote-title {
    display: block;
    font-family: var(--font-heading);
    font-weight: 800;
    font-size: 1.2rem;
    text-transform: uppercase;
    line-height: 1.2;
    margin-bottom: 0.25rem;
    color: var(--text-color);
}

.vote-author {
    font-size: 0.85rem;
    text-transform: uppercase;
    color: rgba(11, 12, 16, 0.7);
    font-family: var(--font-body);
}

/* BACK CARD STYLING */
.tile-back {
    transform: rotateY(180deg); 
    text-align: left;
    justify-content: flex-start;
    overflow-y: auto; /* Clean scrolling context for large word blocks */
}

.back-heading {
    font-family: var(--font-display);
    font-size: 0.8rem;
    font-weight: 900;
    text-transform: uppercase;
    border-bottom: 2px solid var(--border-color);
    padding-bottom: 0.25rem;
    margin-bottom: 1rem;
    letter-spacing: 0.05em;
    display: block;
}

.vote-description {
    font-family: var(--font-body);
    font-size: 0.85rem;
    line-height: 1.5;
    margin: 0;
    color: var(--text-color);
}

/* HOVER & SELECTION SYSTEM COLOR STATES */
.vote-option-tile:hover .tile-back {
    background-color: var(--accent-color);
}

.vote-option-tile:has(input[type="checkbox"]:checked) .tile-front,
.vote-option-tile:has(input[type="checkbox"]:checked) .tile-back {
    background-color: var(--accent-color);
}

/* Suggestions Form Card Container */
.suggestion-form {
    max-width: 800px;
    margin: 0 auto 4rem auto;
    background: #ffffff;
    border: 3px solid var(--border-color);
    box-shadow: 12px 12px 0px var(--text-color);
    padding: 3.5rem 3rem;
}

.suggestion-form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2.5rem;
    margin-bottom: 3rem;
}

.input-group {
    display: flex;
    flex-direction: column;
    position: relative;
}

.input-group label {
    font-family: var(--font-display);
    font-size: 0.8rem;
    font-weight: 900;
    margin-bottom: 0.75rem;
    letter-spacing: 0.05em;
    color: var(--text-color);
}

/* Inline single baseline input style */
.input-group input {
    width: 100%;
    padding: 1rem 0;
    font-family: var(--font-body);
    font-size: 1.1rem;
    background: transparent;
    border: none;
    border-bottom: 3px solid var(--border-color);
    color: var(--text-color);
    font-weight: 600;
    outline: none;
    border-radius: 0;
    transition: all 0.25s ease;
}

.input-group input::placeholder {
    color: rgba(11, 12, 16, 0.3);
    font-weight: 400;
}

.input-group input:focus {
    border-bottom-color: var(--accent-color);
    padding-left: 0.5rem; 
}

.form-actions {
    text-align: center;
    width: 100%;
}

/* Shared Centered Brutalist Submit Buttons */
.btn-submit {
    display: block; 
    width: 100%;
    max-width: 320px;
    margin: 0 auto; 
    background-color: var(--text-color);
    color: var(--bg-color);
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 0.95rem;
    padding: 1.25rem;
    border: 3px solid var(--text-color);
    cursor: pointer;
    text-transform: uppercase;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-submit:hover {
    background-color: var(--accent-color);
    color: var(--text-color);
    box-shadow: 6px 6px 0px var(--text-color);
    transform: translate(-3px, -3px);
}

/* Past Reads Shelving Rows */
.history-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 4rem 2rem;
}

.past-book-card {
    display: flex;
    flex-direction: column;
}

.past-book-card img {
    width: 100%;
    height: auto;
    aspect-ratio: 2/3;
    object-fit: cover;
    border: 2px solid var(--border-color);
    margin-bottom: 1.25rem;
}

.past-book-card .book-title {
    font-family: var(--font-heading);
    font-weight: 700;
    font-size: 1.15rem;
    text-transform: uppercase;
    line-height: 1.2;
    margin-bottom: 0.25rem;
}

.past-book-card .book-author {
    font-size: 0.9rem;
    text-transform: uppercase;
    color: rgba(11, 12, 16, 0.7);
    margin-bottom: 0.75rem;
}

.past-month {
    font-family: var(--font-display);
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    opacity: 0.5;
}

/* Media Queries for Mobile Responsiveness */
@media (max-width: 768px) {
    body {
        border-left-width: 16px;
        border-right-width: 16px;
    }
    .main-header { padding: 3rem 1rem 0rem 1rem; }
    .content-wrapper { padding: 2rem 1rem; }
    
    .header-heading { 
        font-size: 2.5rem; 
        white-space: normal; 
    }
    .suggestion-form {
        padding: 2.5rem 1.5rem;
        box-shadow: 8px 8px 0px var(--text-color);
    }
    .suggestion-form-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
    }
    .btn-submit {
        max-width: 100%;
    }
}

@media (max-width: 480px) {
    .header-heading { font-size: 2rem; }
}
