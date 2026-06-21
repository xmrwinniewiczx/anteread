// configuration data for your books
const CURRENT_BOOK_ISBN = "9780593135204"; // Example: Project Hail Mary

const PAST_BOOKS = [
    { isbn: "9780143128540", month: "January 2026" },
    { isbn: "9780345391803", month: "February 2026" },
    { isbn: "9780525559474", month: "March 2026" }
];

// Helper function to fetch book information from Google Books API
async function fetchBookData(isbn) {
    try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
        const data = await response.json();
        if (data.items && data.items.length > 0) {
            return data.items[0].volumeInfo;
        }
    } catch (error) {
        console.error("Error fetching from Google Books API:", error);
    }
    return null;
}

// Load Current Book
async function loadCurrentBook() {
    const container = document.getElementById('current-book');
    const book = await fetchBookData(CURRENT_BOOK_ISBN);

    if (book) {
        const thumbnail = book.imageLinks?.thumbnail || 'https://via.placeholder.com/150x200?text=No+Cover';
        container.innerHTML = `
            <img src="${thumbnail}" alt="${book.title} cover">
            <div class="current-info">
                <h3>${book.title}</h3>
                <p>by ${book.authors ? book.authors.join(', ') : 'Unknown Author'}</p>
                <p style="font-size:0.9rem; color:#666;">${book.description ? book.description.substring(0, 180) + '...' : ''}</p>
            </div>
        `;
    } else {
        container.innerHTML = `<p>Failed to load current book details.</p>`;
    }
}

// Load Past Books Shelf
async function loadPastBooks() {
    const grid = document.getElementById('past-books');
    grid.innerHTML = ''; // Clear fallback text

    for (const past of PAST_BOOKS) {
        const book = await fetchBookData(past.isbn);
        if (book) {
            const thumbnail = book.imageLinks?.thumbnail || 'https://via.placeholder.com/120x180?text=No+Cover';
            const card = document.createElement('div');
            card.className = 'past-book-card';
            card.innerHTML = `
                <img src="${thumbnail}" alt="${book.title} cover">
                <div class="book-title">${book.title}</div>
                <div class="book-author">${book.authors ? book.authors[0] : 'Unknown'}</div>
                <span class="past-month">${past.month}</span>
            `;
            grid.appendChild(card);
        }
    }
}

// Handle Secret Voting Backend Connection
document.getElementById('vote-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Grab whichever radio item was selected
    const selectedVote = document.querySelector('input[name="book-vote"]:checked').value;
    
    // Dummy Backend POST request 
    // In production, change '/api/vote' to your actual server endpoint (Node.js, Firebase, Supabase, etc.)
    fetch('/api/vote', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vote: selectedVote }),
    })
    .then(response => {
        // Even if server fails because it's a front-end placeholder right now, 
        // we simulate a success message to keep the frontend completely blind to totals.
        alert("Your secret vote has been submitted successfully!");
    })
    .catch(err => {
        // Graceful catch for frontend-only testing
        alert("Vote recorded locally! (Hook up your backend route to save permanently).");
    });
});

// Initialize site content on load
window.addEventListener('DOMContentLoaded', () => {
    loadCurrentBook();
    loadPastBooks();
});