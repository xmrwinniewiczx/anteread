// CONFIGURATION: Verified API and Database Connection Keys
const API_KEY = "AIzaSyBWrMes6QzI2jXGppZDhpNP8W1u-CrqJ2Y"; 
const SUPABASE_URL = "https://dupirmedtmtrodwypkel.supabase.co"; 

// Paste your fresh key from the dashboard once right here inside these quotes:
const RAW_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1cGlybWVkdG10cm9kd3lwa2VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNDg4NTMsImV4cCI6MjA5NzYyNDg1M30.zDyFOtKYSV9V8QN6z1H_VUc0oYmGexZKoNibXe9VzQ0";

// Automatically cleans any accidental spaces or hidden line breaks from copy-pasting
const SUPABASE_ANON_KEY = RAW_ANON_KEY.replace(/\s/g, '').trim();

const CURRENT_BOOK = { title: "Blood Meridian", author: "Cormac Mccarthy" };
const PAST_BOOKS = [
    { title: "Blood Meridian", author: "Cormac Mccarthy" },
];

const ARCHIVE_MONTHS = ["June 2026"];

// --- PRIORITY 1: LOAD COVERS & INTERFACE CONFIGURATION ---
document.addEventListener("DOMContentLoaded", () => {
    fetchCurrentSelection();
    fetchPastArchive();
    disableFormAutocompletes(); // Turn off history suggestions on input boxes
    setupVotingForm();
    setupSuggestionForm();
});

// Programmatically disables autocomplete history suggestions on all input text boxes
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
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchString)}&key=${API_KEY}`);
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
            return fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchString)}&key=${API_KEY}`).then(res => res.json());
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

        const selectedVote = form.querySelector('input[name="book-vote"]:checked');
        if (selectedVote) {
            // Find the label text container associated with the selected radio button option
            const optionContainer = selectedVote.closest('.vote-option') || selectedVote.parentElement;
            
            // Grab readable text info instead of generic strings like "book1"
            let choiceText = selectedVote.value; 
            if (optionContainer) {
                // Tries to look for clean Title / Author structure inside your element wrapper
                const labelText = optionContainer.textContent.replace(/\s+/g, ' ').trim();
                if (labelText) {
                    choiceText = labelText;
                }
            }

            // Sends the readable full details to your 'choice_id' text column
            const { error } = await client.from('Votes').insert([{ choice_id: choiceText }]);

            if (error) {
                alert(`VOTE ERROR FROM SERVER:\nMessage: ${error.message}\nDetails: ${error.details}\nHint: ${error.hint}`);
                console.error("Full Supabase Error Status:", error);
            } else {
                alert(`VOTE SUBMITTED FOR:\n"${choiceText}"`);
            }
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
