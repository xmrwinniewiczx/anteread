// CONFIGURATION: Verified API and Database Connection Keys
const API_KEY = "AIzaSyBWrMes6QzI2jXGppZDhpNP8W1u-CrqJ2Y"; 
const SUPABASE_URL = "https://dupirmedtmtrodwypkel.supabase.co"; 

// Paste your fresh key from the dashboard once right here inside these quotes:
const RAW_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1cGlybWVkdG10cm9kd3lwa2VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNDg4NTMsImV4cCI6MjA5NzYyNDg1M30.zDyFOtKYSV9V8QN6z1H_VUc0oYmGexZKoNibXe9VzQ0";

// Automatically cleans any accidental spaces or hidden line breaks from copy-pasting
const SUPABASE_ANON_KEY = RAW_ANON_KEY.replace(/\s/g, '').trim();

// The master data structures for your book club content
const CURRENT_BOOK = { title: "Fahrenheit 451", author: "Ray Bradbury, Giorgio Monicelli" };

const PAST_BOOKS = [
    { title: "Blood Meridian", author: "Cormac Mccarthy" },
];

// LOOK HERE: Replace the placeholder text inside the quotes below whenever you want!
const VOTE_OPTIONS = [
    { 
        id: "choice1", 
        title: "The Metamorphosis", 
        author: "Franz Kafka, Stanley Corngold",
        description: "Gregor Samsa, a hardworking traveling salesman and the sole provider for his family, wakes up one morning to find he has been transformed into a giant, insect-like creature. Forced into isolation inside his bedroom, Gregor must navigate his bizarre new body while his family struggles to cope with the sudden loss of their breadwinner. As the household dynamics shift from shock to resentment, Gregor is left to face the deep ache of alienation right in his own home."    },
    { 
        id: "choice2", 
        title: "Fahrenheit 451", 
        author: "Ray Bradbury, Giorgio Monicelli",
        description: "In Ray Bradburys chilling dystopian classic, Fahrenheit 451, books are strictly forbidden by law. Montag's sole duty is to hunt down illegal personal libraries and burn them, along with the houses that hide them. In a world obsessed with mindless entertainment, fast cars, and superficial happiness, nobody stops to ask why. Montag never did either—until a chance encounter with an eccentric young neighbor changes everything."},
    { 
        id: "choice3", 
        title: "The Alchemist A Fable about Following Your Dream", 
        author: "Paulo Coelho",
        description: "A young Andalusian shepherd boy named Santiago yearns to travel the world in search of a worldly treasure. His quest leads him from his homeland in Spain into the vast, unforgiving markets of Tangier and across the Egyptian desert. Along the way, Santiago's simple search for riches transforms into a profound journey of self-discovery. Guided by a series of mysterious mentors—including a powerful alchemist—he learns to listen to his heart, read the omens scattered across his path, and understand the Language of the World." },
    { 
        id: "choice4", 
        title: "The Stepford Wives", 
        author: "Ira Levin",
        description: "Joanna Eberhart, an independent photographer, moves with her family to an idyllic Connecticut suburb. At first, it seems like a dream escape. But Joanna soon notices something deeply unsettling: the local women are all impossibly submissive, completely obsessed with housework, and entirely devoid of personal ambition. When her few free-thinking friends suddenly undergo the same eerie transformation, Joanna's curiosity spirals into paranoia. She realizes she must uncover the dark secret behind this flawless community before she loses her own identity." }
];

const ARCHIVE_MONTHS = ["June 2026",];

// --- COVER CACHING LAYER (24-hour TTL) ---
const CACHE_TTL = 24 * 60 * 60 * 1000;

function getCachedCover(key) {
    try {
        const raw = localStorage.getItem("bookclub_cover_" + key);
        if (!raw) return null;
        const entry = JSON.parse(raw);
        if (Date.now() - entry.ts > CACHE_TTL) {
            localStorage.removeItem("bookclub_cover_" + key);
            return null;
        }
        return entry.url;
    } catch { return null; }
}

function setCachedCover(key, url) {
    try {
        localStorage.setItem("bookclub_cover_" + key, JSON.stringify({ url, ts: Date.now() }));
    } catch {}
}

function clearStaleCoverCache() {
    try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && key.startsWith("bookclub_cover_")) {
                const entry = JSON.parse(localStorage.getItem(key));
                if (!entry.url || entry.url === "") {
                    localStorage.removeItem(key);
                }
            }
        }
    } catch {}
}

async function fetchCoverFromAPI(title, author) {
    const cacheKey = title + "|||" + author;
    const cached = getCachedCover(cacheKey);
    if (cached !== null) return cached;

    let thumbnail = "";
    try {
        const searchString = "intitle:" + title + "+inauthor:" + author;
        const response = await fetch("https://www.googleapis.com/books/v1/volumes?q=" + encodeURIComponent(searchString) + "&country=US&key=" + API_KEY);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            const book = data.items[0].volumeInfo;
            thumbnail = book.imageLinks?.thumbnail || book.imageLinks?.smallThumbnail || "";
            if (thumbnail.startsWith("http://")) thumbnail = thumbnail.replace("http://", "https://");
        }
    } catch (error) {
        console.error("Error fetching cover for '" + title + "':", error);
    }

    if (thumbnail) {
        setCachedCover(cacheKey, thumbnail);
    }
    return thumbnail;
}

// --- IMAGE ERROR FALLBACK ---
function attachImageFallbacks(container) {
    const imgs = container.querySelectorAll("img");
    imgs.forEach(function(img) {
        img.addEventListener("error", function handler() {
            img.removeEventListener("error", handler);
            const fallback = document.createElement("div");
            fallback.className = "no-cover";
            fallback.style.cssText = "width:100%; height:260px; background:#eaeaea; border:2px dashed #000; display:flex; align-items:center; justify-content:center; font-size:0.85em; color:#666; margin-bottom:1.25rem;";
            fallback.textContent = "[Image Unavailable]";
            img.replaceWith(fallback);
        });
    });
}

// --- PRIORITY 1: LOAD ALL COVERS & RENDER INTERFACE ---
document.addEventListener("DOMContentLoaded", function() {
    clearStaleCoverCache();
    fetchCurrentSelection();
    fetchPastArchive();
    fetchVotingOptions(); 
    disableFormAutocompletes(); 
    setupVotingForm();
    setupSuggestionForm();
});

function disableFormAutocompletes() {
    const inputs = document.querySelectorAll('#suggestion-form input, #vote-form input');
    inputs.forEach(function(input) {
        input.setAttribute('autocomplete', 'off');
    });
}

async function fetchCurrentSelection() {
    const container = document.getElementById("current-book");
    if (!container) return;

    const thumbnail = await fetchCoverFromAPI(CURRENT_BOOK.title, CURRENT_BOOK.author);

    if (thumbnail) {
        container.innerHTML = '<div class="current-book-layout">' +
            '<img src="' + thumbnail + '" alt="' + CURRENT_BOOK.title + ' Cover">' +
            '<h3 class="current-title">' + CURRENT_BOOK.title + '</h3>' +
            '<p class="current-author">' + CURRENT_BOOK.author + '</p>' +
            '</div>';
    } else {
        container.innerHTML = '<div class="current-book-layout">' +
            '<div class="no-cover" style="width:180px; height:260px; background:#eaeaea; border:2px dashed #000; display:flex; align-items:center; justify-content:center; margin:0 auto; font-size:0.85em; color:#666;">[Image Unavailable]</div>' +
            '<h3 class="current-title">' + CURRENT_BOOK.title + '</h3>' +
            '<p class="current-author">' + CURRENT_BOOK.author + '</p>' +
            '</div>';
    }
    attachImageFallbacks(container);
}

async function fetchPastArchive() {
    const grid = document.getElementById("past-books");
    if (!grid) return;
    grid.innerHTML = '';

    const coverResults = await Promise.all(
        PAST_BOOKS.map(function(book) {
            return fetchCoverFromAPI(book.title, book.author).catch(function() { return ""; });
        })
    );

    PAST_BOOKS.forEach(function(book, index) {
        const thumbnail = coverResults[index];
        const card = document.createElement('div');
        card.className = 'past-book-card';
        card.innerHTML = (thumbnail
            ? '<img src="' + thumbnail + '" alt="' + book.title + ' Cover">'
            : '<div class="no-cover" style="width:100%; aspect-ratio:2/3; background:#eaeaea; border:2px dashed #000; display:flex; align-items:center; justify-content:center; font-size:0.85em; color:#666; margin-bottom:1.25rem;">[Image Unavailable]</div>')
            + '<span class="past-month">' + (ARCHIVE_MONTHS[index] || '') + '</span>'
            + '<span class="book-title">' + book.title + '</span>'
            + '<span class="book-author">' + book.author + '</span>';
        grid.appendChild(card);
    });
    attachImageFallbacks(grid);
}

async function fetchVotingOptions() {
    const optionsContainer = document.getElementById("voting-options-container");
    if (!optionsContainer) return;
    optionsContainer.innerHTML = ''; 

    const coverResults = await Promise.all(
        VOTE_OPTIONS.map(function(opt) {
            return fetchCoverFromAPI(opt.title, opt.author).catch(function() { return ""; });
        })
    );

    VOTE_OPTIONS.forEach(function(staticData, index) {
        const thumbnail = coverResults[index];
        let finalTitle = staticData.title;
        let finalAuthor = staticData.author;

        const tile = document.createElement('div'); 
        tile.className = 'vote-option-tile';
        tile.innerHTML = '<input type="checkbox" name="book-vote" value="' + finalTitle + ' by ' + finalAuthor + '">' +
            '<div class="tile-card-inner">' +
                '<div class="tile-front">' +
                    (thumbnail
                        ? '<img src="' + thumbnail + '" class="vote-cover" alt="' + finalTitle + ' Cover">'
                        : '<div class="no-cover" style="width:100%; height:260px; background:#eaeaea; border:2px dashed #000; display:flex; align-items:center; justify-content:center; font-size:0.85em; color:#666; margin-bottom:1.25rem;">[Image Unavailable]</div>') +
                    '<div class="vote-details">' +
                        '<span class="vote-title">' + finalTitle + '</span>' +
                        '<span class="vote-author">' + finalAuthor + '</span>' +
                    '</div>' +
                '</div>' +
                '<div class="tile-back">' +
                    '<span class="back-heading">Description</span>' +
                    '<p class="vote-description">' + staticData.description + '</p>' +
                '</div>' +
            '</div>';

        const checkbox = tile.querySelector('input[type="checkbox"]');

        tile.addEventListener('click', function(e) {
            if (e.target === checkbox) return;
            if (checkbox.checked) return;
            tile.classList.toggle('reveal-back');
        });

        checkbox.addEventListener('change', function() {
            if (checkbox.checked) {
                tile.classList.remove('reveal-back');
            }
        });

        optionsContainer.appendChild(tile);
    });
    attachImageFallbacks(optionsContainer);
    setupMaxVotesGuard();
}

function setupMaxVotesGuard() {
    const container = document.getElementById("voting-options-container");
    if (!container) return;

    container.addEventListener("change", function(event) {
        const checkedBoxes = container.querySelectorAll('input[name="book-vote"]:checked');
        
        if (checkedBoxes.length > 2) {
            alert("You can only select up to 2 books for your vote!");
            event.target.checked = false; 
        }
    });
}

// --- PRIORITY 2: DATABASE SETUP ---
function getSupabaseClient() {
    if (window.supabase) {
        return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return null;
}

function setupVotingForm() {
    const form = document.getElementById("vote-form");
    if (!form) return;

    form.addEventListener("submit", async function(e) {
        e.preventDefault();
        const client = getSupabaseClient();
        
        if (!client) {
            alert("VOTE ERROR:\nSupabase database client script did not load.");
            return;
        }

        const selectedVotes = form.querySelectorAll('input[name="book-vote"]:checked');
        
        if (selectedVotes.length === 0) {
            alert("Please select at least one book choice before submitting!");
            return;
        }

        const insertPromises = Array.from(selectedVotes).map(function(checkbox) {
            const choiceText = checkbox.value;
            return client.from('Votes').insert([{ choice_id: choiceText }]);
        });

        try {
            const responses = await Promise.all(insertPromises);
            const databaseError = responses.find(function(res) { return res.error; });
            
            if (databaseError) {
                alert("VOTE ERROR FROM SERVER:\nMessage: " + databaseError.error.message);
                console.error("Supabase Error Status:", databaseError.error);
            } else {
                alert("VOTES SUCCESSFULLY SUBMITTED!");
                selectedVotes.forEach(function(cb) { cb.checked = false; });
            }
        } catch (err) {
            console.error("Execution error during submission processing:", err);
        }
    });
}

function setupSuggestionForm() {
    const form = document.getElementById("suggestion-form");
    if (!form) return;

    form.addEventListener("submit", async function(e) {
        e.preventDefault();
        const client = getSupabaseClient();
        
        if (!client) {
            alert("SUGGESTION ERROR:\nSupabase database client script did not load.");
            return;
        }
        
        const title = document.getElementById("suggest-title").value.trim();
        const author = document.getElementById("suggest-author").value.trim();
        
        const { error } = await client.from('Suggestions').insert([{ title: title, author: author }]);
        
        if (error) {
            alert("SUGGESTION ERROR FROM SERVER:\nMessage: " + error.message + "\nDetails: " + error.details + "\nHint: " + error.hint);
            console.error("Full Supabase Error Status:", error);
        } else {
            alert("SUGGESTION RECEIVED!");
            form.reset();
        }
    });
}

