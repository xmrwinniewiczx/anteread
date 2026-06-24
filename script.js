// CONFIGURATION: Verified API and Database Connection Keys
const API_KEY = "AIzaSyBWrMes6QzI2jXGppZDhpNP8W1u-CrqJ2Y"; 
const SUPABASE_URL = "https://dupirmedtmtrodwypkel.supabase.co"; 

// Paste your fresh key from the dashboard once right here inside these quotes:
const RAW_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1cGlybWVkdG10cm9kd3lwa2VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNDg4NTMsImV4cCI6MjA5NzYyNDg1M30.zDyFOtKYSV9V8QN6z1H_VUc0oYmGexZKoNibXe9VzQ0";

// Automatically cleans any accidental spaces or hidden line breaks from copy-pasting
const SUPABASE_ANON_KEY = RAW_ANON_KEY.replace(/\s/g, '').trim();

// The master data structures for your book club content
const CURRENT_BOOK = { title: "Blood Meridian", author: "Cormac Mccarthy" };

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
        description: "In Ray Bradburys chilling dystopian classic, Fahrenheit 451, books are strictly forbidden by law. Montag’s sole duty is to hunt down illegal personal libraries and burn them, along with the houses that hide them. In a world obsessed with mindless entertainment, fast cars, and superficial happiness, nobody stops to ask why. Montag never did either—until a chance encounter with an eccentric young neighbor changes everything."},
    { 
        id: "choice3", 
        title: "The Alchemist A Fable about Following Your Dream", 
        author: "Paulo Coelho",
        description: "A young Andalusian shepherd boy named Santiago yearns to travel the world in search of a worldly treasure. His quest leads him from his homeland in Spain into the vast, unforgiving markets of Tangier and across the Egyptian desert. Along the way, Santiago's simple search for riches transforms into a profound journey of self-discovery. Guided by a series of mysterious mentors—including a powerful alchemist—he learns to listen to his heart, read the omens scattered across his path, and understand the Language of the World." },
    { 
        id: "choice4", 
        title: "The Stepford Wives", 
        author: "Ira Levin",
        description: "Joanna Eberhart, an independent photographer, moves with her family to an idyllic Connecticut suburb. At first, it seems like a dream escape. But Joanna soon notices something deeply unsettling: the local women are all impossibly submissive, completely obsessed with housework, and entirely devoid of personal ambition. When her few free-thinking friends suddenly undergo the same eerie transformation, Joanna’s curiosity spirals into paranoia. She realizes she must uncover the dark secret behind this flawless community before she loses her own identity." }
];

const ARCHIVE_MONTHS = ["June 2026",];

// --- PRIORITY 1: LOAD ALL COVERS & RENDER INTERFACE ---
document.addEventListener("DOMContentLoaded", () => {
    fetchCurrentSelection();
    fetchPastArchive();
    fetchVotingOptions(); 
    disableFormAutocompletes(); 
    setupVotingForm();
    setupSuggestionForm();
});

function disableFormAutocompletes() {
    const inputs = document.querySelectorAll('#suggestion-form input, #vote-form input');
    inputs.forEach(input => {
        input.setAttribute('autocomplete', 'off');
    });
}

async function fetchCurrentSelection() {
    const container = document.getElementById("current-book");
    if (!container) return;

    try {
        const searchString = `intitle:${CURRENT_BOOK.title}+inauthor:${CURRENT_BOOK.author}`;
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchString)}&country=US&key=${API_KEY}`);
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            const book = data.items[0].volumeInfo;
            let thumbnail = book.imageLinks?.thumbnail || book.imageLinks?.smallThumbnail;
            if (thumbnail && thumbnail.startsWith('http://')) {
                thumbnail = thumbnail.replace('http://', 'https://');
            }
            
            container.innerHTML = `
                <div class="current-book-layout">
                    <img src="${thumbnail}" alt="${book.title} Cover">
                    <h3 class="current-title">${book.title}</h3>
                    <p class="current-author">${book.authors?.join(', ')}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error("Error loading current book:", error);
    }
}

async function fetchPastArchive() {
    const grid = document.getElementById("past-books");
    if (!grid) return;
    grid.innerHTML = '';

    try {
        const requests = PAST_BOOKS.map(book => {
            const searchString = `intitle:${book.title}+inauthor:${book.author}`;
            return fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchString)}&country=US&key=${API_KEY}`).then(res => res.json());
        });
        
        const results = await Promise.all(requests);

        results.forEach((data, index) => {
            if (data.items && data.items.length > 0) {
                const book = data.items[0].volumeInfo;
                let thumbnail = book.imageLinks?.thumbnail || book.imageLinks?.smallThumbnail;
                if (thumbnail && thumbnail.startsWith('http://')) {
                    thumbnail = thumbnail.replace('http://', 'https://');
                }
                
                const card = document.createElement('div');
                card.className = 'past-book-card';
                card.innerHTML = `
                    <img src="${thumbnail}" alt="${book.title} Cover">
                    <span class="past-month">${ARCHIVE_MONTHS[index]}</span>
                    <span class="book-title">${book.title}</span>
                    <span class="book-author">${book.authors?.join(', ')}</span>
                `;
                grid.appendChild(card);
            }
        });
    } catch (error) {
        console.error("Error loading archive:", error);
    }
}

async function fetchVotingOptions() {
    const optionsContainer = document.getElementById("voting-options-container");
    if (!optionsContainer) return;
    optionsContainer.innerHTML = ''; 

    try {
        const requests = VOTE_OPTIONS.map(book => {
            const searchString = `intitle:${book.title}+inauthor:${book.author}`;
            return fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchString)}&country=US&key=${API_KEY}`).then(res => res.json());
        });

        const results = await Promise.all(requests);

        results.forEach((data, index) => {
            const staticData = VOTE_OPTIONS[index];
            let thumbnail = "";
            let finalTitle = staticData.title;
            let finalAuthor = staticData.author;

            if (data.items && data.items.length > 0) {
                const apiBook = data.items[0].volumeInfo;
                thumbnail = apiBook.imageLinks?.thumbnail || apiBook.imageLinks?.smallThumbnail || "";
                if (thumbnail && thumbnail.startsWith('http://')) {
                    thumbnail = thumbnail.replace('http://', 'https://');
                }
                finalTitle = apiBook.title;
                finalAuthor = apiBook.authors?.join(', ') || staticData.author;
            }

            const tile = document.createElement('div'); 
            tile.className = 'vote-option-tile';
            tile.innerHTML = `
                <input type="checkbox" name="book-vote" value="${finalTitle} by ${finalAuthor}">
                <div class="tile-card-inner">
                    <div class="tile-front">
                        ${thumbnail ? `<img src="${thumbnail}" class="vote-cover" alt="${finalTitle} Cover">` : '<div class="no-cover" style="height:260px; border:2px dashed #000; margin-bottom:1.25rem;"></div>'}
                        <div class="vote-details">
                            <span class="vote-title">${finalTitle}</span>
                            <span class="vote-author">${finalAuthor}</span>
                        </div>
                    </div>
                    <div class="tile-back">
                        <span class="back-heading">Description</span>
                        <p class="vote-description">${staticData.description}</p>
                    </div>
                </div>
            `;

            const checkbox = tile.querySelector('input[type="checkbox"]');

            tile.addEventListener('click', (e) => {
                if (e.target === checkbox) return;
                if (checkbox.checked) return;
                tile.classList.toggle('reveal-back');
            });

            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    tile.classList.remove('reveal-back');
                }
            });

            optionsContainer.appendChild(tile);
        });

        setupMaxVotesGuard();

    } catch (error) {
        console.error("Error loading voting options:", error);
    }
}

function setupMaxVotesGuard() {
    const container = document.getElementById("voting-options-container");
    if (!container) return;

    container.addEventListener("change", (event) => {
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

    form.addEventListener("submit", async (e) => {
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

        const insertPromises = Array.from(selectedVotes).map(checkbox => {
            const choiceText = checkbox.value;
            return client.from('Votes').insert([{ choice_id: choiceText }]);
        });

        try {
            const responses = await Promise.all(insertPromises);
            const databaseError = responses.find(res => res.error);
            
            if (databaseError) {
                alert(`VOTE ERROR FROM SERVER:\nMessage: ${databaseError.error.message}`);
                console.error("Supabase Error Status:", databaseError.error);
            } else {
                alert("VOTES SUCCESSFULLY SUBMITTED!");
                selectedVotes.forEach(cb => cb.checked = false);
            }
        } catch (err) {
            console.error("Execution error during submission processing:", err);
        }
    });
}

function setupSuggestionForm() {
    const form = document.getElementById("suggestion-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
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
            alert(`SUGGESTION ERROR FROM SERVER:\nMessage: ${error.message}\nDetails: ${error.details}\nHint: ${error.hint}`);
            console.error("Full Supabase Error Status:", error);
        } else {
            alert("SUGGESTION RECEIVED!");
            form.reset();
        }
    });
}
