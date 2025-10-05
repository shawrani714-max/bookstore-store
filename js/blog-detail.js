// Example blog data (should match the order/index in blog.html)
const blogPosts = [
  {
    title: "The Top 10 Must-Read Fiction Books of the Year",
    author: "Bookworld Team",
    date: "Dec 15, 2023",
    image: "/images/book1.jpg",
    text: `We dive into the most compelling fiction novels that have captured our hearts and minds this year. From sprawling fantasies to intimate dramas, there's something for every reader. (Full blog post content goes here...)`
  },
  {
    title: "How Reading Improves Your Mental Health",
    author: "Bookworld Team",
    date: "Dec 10, 2023",
    image: "/images/book2.jpg",
    text: `Explore the science-backed benefits of reading for your brain and overall well-being. It's more than just a hobby; it's a form of self-care. (Full blog post content goes here...)`
  },
  {
    title: "A Guide to Building Your Perfect Home Library",
    author: "Bookworld Team",
    date: "Dec 5, 2023",
    image: "/images/book3.jpg",
    text: `Dreaming of a personal library? Here are our top tips for curating a collection that reflects your taste, organizing your shelves, and creating a cozy reading nook. (Full blog post content goes here...)`
  },
  {
    title: "Classic Literature: Why These Books Still Matter",
    author: "Bookworld Team",
    date: "Nov 28, 2023",
    image: "/images/book4.jpg",
    text: `Discover why classic literature continues to resonate with readers across generations and how these timeless stories shape our understanding of the world. (Full blog post content goes here...)`
  },
  {
    title: "The Power of Self-Help Books: Transform Your Life",
    author: "Bookworld Team",
    date: "Nov 20, 2023",
    image: "/images/book5.jpg",
    text: `Explore how self-help books can provide practical tools for personal growth, motivation, and positive change in your daily life. (Full blog post content goes here...)`
  },
  {
    title: "Inspiring Biographies That Will Change Your Perspective",
    author: "Bookworld Team",
    date: "Nov 15, 2023",
    image: "/images/book6.jpg",
    text: `From world leaders to artists, these compelling biographies offer insights into extraordinary lives and the lessons we can learn from them. (Full blog post content goes here...)`
  }
];

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

document.addEventListener('DOMContentLoaded', () => {
  const id = parseInt(getQueryParam('id'), 10);
  const post = blogPosts[id];
  const container = document.getElementById('blog-detail-container');
  if (!post) {
    container.innerHTML = '<p>Blog post not found.</p>';
    return;
  }
  container.innerHTML = `
    <div class="card mb-4">
      <img src="${post.image}" class="card-img-top" alt="${post.title}">
      <div class="card-body">
        <h1 class="card-title">${post.title}</h1>
        <p class="text-muted">By ${post.author} | ${post.date}</p>
        <p class="card-text">${post.text}</p>
      </div>
    </div>
  `;
}); 