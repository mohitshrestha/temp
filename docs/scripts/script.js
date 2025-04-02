let books = [];
let filteredBooks = [];
let currentPage = 1;
let booksPerPage = 20;
let isShowingAllBooks = false;

const booksContainer = document.querySelector('.featured-books');
const paginationContainer = document.querySelector('.pagination');
const categorySelect = document.getElementById('category-select');
const titleSearchInput = document.getElementById('title-search');
const isbnSearchInput = document.getElementById('isbn-search');
const showAllButton = document.createElement('button');
showAllButton.textContent = "Show All Books";
showAllButton.classList.add('show-all-books');

// Fetch books from JSON file
fetch('../data/updated_books.json')
    .then(response => response.json())
    .then(data => {
        books = data;
        filteredBooks = books;
        populateCategoryFilter();
        loadBooks();
        createPagination();
    })
    .catch(error => console.error('Error fetching books:', error));

// Populate categories dropdown
function populateCategoryFilter() {
    const categories = new Set();

    // Extract categories from books and add to Set to avoid duplicates
    books.forEach(book => {
        if (book['Category']) {
            book['Category'].split(',').forEach(category => {
                categories.add(category.trim());
            });
        }
    });

    // Populate the dropdown with categories
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });

    // Add 'All Categories' as the first option and set it as selected by default
    const allOption = document.createElement('option');
    allOption.value = 'All Categories';
    allOption.textContent = 'All Categories';
    categorySelect.insertBefore(allOption, categorySelect.firstChild);

    // Set 'All Categories' as selected by default
    categorySelect.value = 'All Categories';
}

// Filter books based on title, ISBN-13, and categories
function filterBooks() {
    const selectedCategories = Array.from(categorySelect.selectedOptions).map(option => option.value);
    const titleSearch = titleSearchInput.value.trim().toLowerCase();
    const isbnSearch = isbnSearchInput.value.trim().toLowerCase();

    // Filter books based on ISBN-13 first, then Book Title, and finally Category
    filteredBooks = books.filter(book => {
        const bookCategories = book['Category'] ? book['Category'].split(',') : [];
        
        // Category Match Logic: If "All Categories" is selected, it allows all books
        const categoryMatch = selectedCategories.includes("All Categories") || selectedCategories.some(category => bookCategories.includes(category.trim()));

        // ISBN Match Logic (prioritize ISBN-13 search first)
        const isbnMatch = isbnSearch === "" || (book['ISBN-13'] && book['ISBN-13'].toLowerCase().includes(isbnSearch));

        // Book Title Match Logic (only if ISBN-13 is not matched and titleSearch is provided)
        const titleMatch = (isbnSearch === "" || isbnMatch) && (titleSearch === "" || (book['Book Title'] && book['Book Title'].toLowerCase().includes(titleSearch)));

        return categoryMatch && titleMatch;
    });

    currentPage = 1;  // Reset to first page after any filter is applied
    loadBooks();
    createPagination();
}

// Load books for the current page or all books (if Show All is active)
function loadBooks() {
    booksContainer.innerHTML = '';

    // If Show All is enabled, show all filtered books
    const booksToDisplay = isShowingAllBooks ? filteredBooks : filteredBooks.slice((currentPage - 1) * booksPerPage, currentPage * booksPerPage);

    booksToDisplay.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.classList.add('book-card');

        bookCard.innerHTML = `
            <img src="${book.image || 'https://placehold.co/250x300?text=No+Image+Found'}" alt="${book['Book Title']}" class="book-image">
            <div class="book-info">
                <h3 class="book-title">${book['Book Title']}</h3>
                <p class="book-isbn-13">ISBN-13: ${book['ISBN-13'] || 'N/A'}</p>
                <p class="book-category">Category: ${book['Category'] || 'N/A'}</p>
                <p class="book-price">Price: ${book['Price in NPR (रु)'] || 'N/A'}</p>
                <p class="book-stock">Quantity in Stock: ${book['Quantity in Stock'] || 'N/A'}</p>
            </div>
        `;
        booksContainer.appendChild(bookCard);
    });
}

// Create pagination
function createPagination() {
    if (isShowingAllBooks) {
        paginationContainer.innerHTML = ''; // Hide pagination when Show All is active
        return;
    }

    paginationContainer.innerHTML = '';
    const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

    // Previous Button
    const prevButton = document.createElement('button');
    prevButton.textContent = '←';
    prevButton.disabled = currentPage === 1;
    prevButton.classList.add(currentPage === 1 ? 'disabled' : 'prev-page');
    prevButton.addEventListener('click', () => changePage(currentPage - 1));
    paginationContainer.appendChild(prevButton);

    // Page Numbers
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.classList.add('page-button');
        if (i === currentPage) pageButton.classList.add('active');
        pageButton.addEventListener('click', () => changePage(i));
        paginationContainer.appendChild(pageButton);
    }

    // Next Button
    const nextButton = document.createElement('button');
    nextButton.textContent = '→';
    nextButton.disabled = currentPage === totalPages;
    nextButton.classList.add(currentPage === totalPages ? 'disabled' : 'next-page');
    nextButton.addEventListener('click', () => changePage(currentPage + 1));
    paginationContainer.appendChild(nextButton);

    // Show All Button (always visible below pagination)
    paginationContainer.appendChild(showAllButton);
}

// Change to a new page
function changePage(page) {
    currentPage = page;
    loadBooks();
    createPagination();
}

// Show all books (toggle pagination and display all books)
showAllButton.addEventListener('click', () => {
    isShowingAllBooks = !isShowingAllBooks;
    loadBooks();
    createPagination();
});

// Event listeners for search inputs
titleSearchInput.addEventListener('input', filterBooks);
isbnSearchInput.addEventListener('input', filterBooks);
categorySelect.addEventListener('change', filterBooks);
