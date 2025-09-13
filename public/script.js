document.addEventListener('DOMContentLoaded', function() {
    const storyForm = document.getElementById('storyForm');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const storyResult = document.getElementById('storyResult');
    const storyContent = document.getElementById('storyContent');
    const newStoryBtn = document.getElementById('newStoryBtn');

    storyForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(storyForm);
        const childName = formData.get('childName').trim();
        const age = formData.get('age');
        const imagination = formData.get('imagination').trim();
        const favoriteBooks = formData.getAll('favoriteBooks');

        // Validation
        if (!childName) {
            alert('Please enter your name! 😊');
            return;
        }

        if (favoriteBooks.length === 0) {
            alert('Please select at least one favorite book! 📚');
            return;
        }

        // Show loading, hide form and previous results
        storyForm.classList.add('hidden');
        storyResult.classList.add('hidden');
        loadingSpinner.classList.remove('hidden');

        try {
            // Send request to generate story
            const response = await fetch('/api/generate-story', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    childName,
                    age,
                    imagination,
                    favoriteBooks
                })
            });

            if (!response.ok) {
                throw new Error('Failed to generate story');
            }

            const data = await response.json();
            
            // Display the story
            storyContent.textContent = data.story;
            
            // Hide loading, show result
            loadingSpinner.classList.add('hidden');
            storyResult.classList.remove('hidden');
            
            // Scroll to story
            storyResult.scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            console.error('Error:', error);
            alert('Oops! Something went wrong creating your story. Please try again! 🌟');
            
            // Hide loading, show form
            loadingSpinner.classList.add('hidden');
            storyForm.classList.remove('hidden');
        }
    });

    newStoryBtn.addEventListener('click', function() {
        // Reset form
        storyForm.reset();
        
        // Show form, hide result
        storyResult.classList.add('hidden');
        storyForm.classList.remove('hidden');
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Add some interactive feedback for checkboxes
    const bookOptions = document.querySelectorAll('.book-option');
    bookOptions.forEach(option => {
        const checkbox = option.querySelector('input[type="checkbox"]');
        
        option.addEventListener('click', function(e) {
            if (e.target !== checkbox) {
                checkbox.checked = !checkbox.checked;
            }
        });
        
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                option.style.background = '#e6fffa';
                option.style.borderColor = '#38b2ac';
            } else {
                option.style.background = '#f7fafc';
                option.style.borderColor = '#e2e8f0';
            }
        });
    });
});