// Reviews functionality for book pages
class ReviewsManager {
    constructor() {
        this.currentBookId = null;
        this.currentPage = 1;
        this.reviewsPerPage = 5;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadReviews();
    }

    setupEventListeners() {
        // Rating input stars
        document.querySelectorAll('.rating-input i').forEach(star => {
            star.addEventListener('click', (e) => this.handleStarClick(e));
            star.addEventListener('mouseenter', (e) => this.handleStarHover(e, true));
            star.addEventListener('mouseleave', (e) => this.handleStarHover(e, false));
        });

        // Submit review button
        const submitBtn = document.getElementById('submit-review-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitReview());
        }

        // Load more reviews
        const loadMoreBtn = document.getElementById('load-more-reviews');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMoreReviews());
        }
    }

    setBookId(bookId) {
        this.currentBookId = bookId;
        this.loadReviews();
    }

    async loadReviews() {
        if (!this.currentBookId) return;

        try {
            const response = await fetch(`/api/reviews/${this.currentBookId}?page=${this.currentPage}&limit=${this.reviewsPerPage}`);
            const data = await response.json();

            if (data.success) {
                this.displayReviews(data.data.reviews);
                this.updateReviewSummary(data.data.summary);
                this.updateRatingBars(data.data.summary.ratingDistribution);
            }
        } catch (error) {
            console.error('Error loading reviews:', error);
        }
    }

    displayReviews(reviews) {
        const container = document.getElementById('reviews-container');
        if (!container) return;

        if (this.currentPage === 1) {
            container.innerHTML = '';
        }

        if (reviews.length === 0 && this.currentPage === 1) {
            container.innerHTML = '<p class="text-center text-muted">No reviews yet. Be the first to review this book!</p>';
            return;
        }

        reviews.forEach(review => {
            const reviewElement = this.createReviewElement(review);
            container.appendChild(reviewElement);
        });

        // Show/hide load more button
        const loadMoreBtn = document.getElementById('load-more-reviews');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = reviews.length === this.reviewsPerPage ? 'block' : 'none';
        }
    }

    createReviewElement(review) {
        const reviewDiv = document.createElement('div');
        reviewDiv.className = 'review-item border-bottom pb-3 mb-3';
        
        const stars = this.generateStars(review.rating);
        const verifiedBadge = review.isVerifiedPurchase ? '<span class="badge bg-success ms-2">Verified Purchase</span>' : '';
        
        reviewDiv.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <h6 class="mb-1">${review.title || 'Great Book!'}</h6>
                    <div class="stars mb-2">
                        ${stars}
                    </div>
                    <p class="text-muted mb-2">
                        By ${review.user?.firstName || 'Anonymous'} ${review.user?.lastName || ''} 
                        ${verifiedBadge}
                        <small class="ms-2">${new Date(review.createdAt).toLocaleDateString()}</small>
                    </p>
                </div>
                <div class="text-end">
                    <button class="btn btn-sm btn-outline-primary helpful-btn" data-review-id="${review._id}">
                        <i class="fas fa-thumbs-up"></i> Helpful (${review.helpful || 0})
                    </button>
                </div>
            </div>
            <p class="mb-0">${review.comment}</p>
        `;

        // Add helpful button functionality
        const helpfulBtn = reviewDiv.querySelector('.helpful-btn');
        helpfulBtn.addEventListener('click', () => this.markHelpful(review._id));

        return reviewDiv;
    }

    generateStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '<i class="fas fa-star text-warning"></i>';
            } else {
                stars += '<i class="far fa-star text-muted"></i>';
            }
        }
        return stars;
    }

    updateReviewSummary(summary) {
        const avgRating = document.getElementById('average-rating');
        const avgStars = document.getElementById('average-stars');
        const totalReviews = document.getElementById('total-reviews');

        if (avgRating) avgRating.textContent = summary.averageRating.toFixed(1);
        if (avgStars) avgStars.innerHTML = this.generateStars(Math.round(summary.averageRating));
        if (totalReviews) totalReviews.textContent = `${summary.totalReviews} reviews`;
    }

    updateRatingBars(distribution) {
        const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
        
        for (let i = 1; i <= 5; i++) {
            const count = distribution[i] || 0;
            const percentage = total > 0 ? (count / total) * 100 : 0;
            
            const countElement = document.getElementById(`count-${i}`);
            const barElement = document.getElementById(`rating-${i}`);
            
            if (countElement) countElement.textContent = count;
            if (barElement) barElement.style.width = `${percentage}%`;
        }
    }

    handleStarClick(e) {
        const rating = parseInt(e.target.dataset.rating);
        document.getElementById('review-rating').value = rating;
        this.updateRatingDisplay(rating);
    }

    handleStarHover(e, isHover) {
        const rating = parseInt(e.target.dataset.rating);
        if (isHover) {
            this.updateRatingDisplay(rating);
        } else {
            const currentRating = parseInt(document.getElementById('review-rating').value) || 0;
            this.updateRatingDisplay(currentRating);
        }
    }

    updateRatingDisplay(rating) {
        document.querySelectorAll('.rating-input i').forEach((star, index) => {
            if (index < rating) {
                star.className = 'fas fa-star text-warning';
            } else {
                star.className = 'far fa-star text-muted';
            }
        });
    }

    async submitReview() {
        if (!this.currentBookId) {
            alert('Book ID not found');
            return;
        }

        const rating = parseInt(document.getElementById('review-rating').value);
        const title = document.getElementById('review-title').value.trim();
        const comment = document.getElementById('review-comment').value.trim();

        if (rating === 0) {
            alert('Please select a rating');
            return;
        }

        if (comment.length < 10) {
            alert('Please write a review with at least 10 characters');
            return;
        }

        try {
            const response = await fetch(`/api/reviews/${this.currentBookId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    rating,
                    title,
                    comment
                })
            });

            const data = await response.json();

            if (data.success) {
                alert('Review submitted successfully!');
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('reviewModal'));
                modal.hide();
                
                // Reset form
                document.getElementById('review-form').reset();
                document.getElementById('review-rating').value = '0';
                this.updateRatingDisplay(0);
                
                // Reload reviews
                this.currentPage = 1;
                this.loadReviews();
            } else {
                alert(data.message || 'Failed to submit review');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Failed to submit review. Please try again.');
        }
    }

    async markHelpful(reviewId) {
        try {
            const response = await fetch(`/api/reviews/${this.currentBookId}/${reviewId}/helpful`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();

            if (data.success) {
                // Update the helpful count in the UI
                const helpfulBtn = document.querySelector(`[data-review-id="${reviewId}"]`);
                if (helpfulBtn) {
                    const icon = helpfulBtn.querySelector('i');
                    const text = helpfulBtn.textContent;
                    const newCount = data.data.helpfulCount;
                    helpfulBtn.innerHTML = `<i class="fas fa-thumbs-up"></i> Helpful (${newCount})`;
                    helpfulBtn.disabled = true;
                    helpfulBtn.classList.add('btn-success');
                }
            }
        } catch (error) {
            console.error('Error marking review as helpful:', error);
        }
    }

    loadMoreReviews() {
        this.currentPage++;
        this.loadReviews();
    }
}

// Initialize reviews manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.reviewsManager = new ReviewsManager();
    
    // Set book ID when book details are loaded
    if (window.currentBookId) {
        window.reviewsManager.setBookId(window.currentBookId);
    }
});

// Add CSS for reviews
const style = document.createElement('style');
style.textContent = `
    .rating-input i {
        cursor: pointer;
        font-size: 1.5rem;
        margin-right: 0.25rem;
    }
    
    .rating-bar {
        display: flex;
        align-items: center;
        margin-bottom: 0.5rem;
    }
    
    .rating-bar span:first-child {
        width: 60px;
        font-size: 0.9rem;
    }
    
    .rating-bar .progress {
        flex: 1;
        margin: 0 1rem;
        height: 8px;
    }
    
    .rating-bar span:last-child {
        width: 30px;
        text-align: right;
        font-size: 0.9rem;
    }
    
    .review-item {
        background: white;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .helpful-btn {
        font-size: 0.8rem;
    }
    
    .helpful-btn:disabled {
        opacity: 0.7;
    }
`;
document.head.appendChild(style); 
