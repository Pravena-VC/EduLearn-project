export const htmlChallenges = [
  {
    id: "html-form-challenge",
    title: "Create a Contact Form",
    description: "Build a responsive contact form with validation.",
    difficulty: "Easy",
    category: "HTML & CSS",
    points: 150,
    timeLimit: "25 minutes",
    instructions: `
      # Challenge: Create a Contact Form

      In this challenge, you'll build a functional contact form with proper validation.

      ## Requirements:
      1. Create a form with the following fields:
         - Name (required)
         - Email (required, with email validation)
         - Subject (dropdown with at least 3 options)
         - Message (textarea, required)
         - Submit button
      2. Add proper labels for each field
      3. Style the form to be visually appealing
      4. Add basic validation (HTML5 validation attributes)
      5. Make the form responsive

      ## Tips:
      - Use semantic HTML elements
      - Utilize HTML5 validation attributes (required, type="email", etc.)
      - Add appropriate CSS for focus states
      - Consider using flexbox or grid for layout
    `,
    testCases: [
      {
        name: "Form exists",
        description: "The page should have a form element",
      },
      {
        name: "Required fields",
        description: "Name, Email, and Message fields should be required",
      },
      {
        name: "Email validation",
        description: "Email field should have type='email'",
      },
      {
        name: "Dropdown menu",
        description: "Subject should be a dropdown with at least 3 options",
      },
      {
        name: "Submit button",
        description: "Form should have a submit button",
      },
    ],
    starterCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact Form</title>
  <style>
    /* Add your CSS here */
  </style>
</head>
<body>
  <!-- Create your contact form here -->
  
</body>
</html>`,
  },
  {
    id: "product-card-challenge",
    title: "Product Card Component",
    description: "Create a responsive product card for an e-commerce site.",
    difficulty: "Easy",
    category: "HTML & CSS",
    points: 150,
    timeLimit: "25 minutes",
    instructions: `
      # Challenge: Product Card Component

      In this challenge, you'll create a product card component commonly found on e-commerce websites.

      ## Requirements:
      1. Create a product card with:
         - Product image
         - Product title
         - Product description
         - Price
         - "Add to Cart" button
      2. Style the card with a clean, modern design
      3. Add hover effects to the card and button
      4. Make the card responsive
      5. Include a discount badge on the product

      ## Tips:
      - Use a container with proper padding and border-radius
      - Add box-shadow for depth
      - Use relative/absolute positioning for the discount badge
      - Consider using flexbox for layout
    `,
    testCases: [
      {
        name: "Product image",
        description: "Card should include an image element",
      },
      {
        name: "Product details",
        description: "Card should include title, description, and price",
      },
      {
        name: "Add to Cart button",
        description: "Card should have an 'Add to Cart' button",
      },
      {
        name: "Discount badge",
        description: "Card should include a discount badge",
      },
      {
        name: "Hover effects",
        description: "Card or button should have hover effects",
      },
    ],
    starterCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Product Card</title>
  <style>
    /* Add your CSS here */
  </style>
</head>
<body>
  <!-- Create your product card here -->
  
</body>
</html>`,
  },
  {
    id: "flexbox-navbar-challenge",
    title: "Responsive Navbar with Flexbox",
    description: "Build a responsive navigation bar using Flexbox.",
    difficulty: "Medium",
    category: "HTML & CSS",
    points: 200,
    timeLimit: "30 minutes",
    instructions: `
      # Challenge: Responsive Navbar with Flexbox

      In this challenge, you'll create a responsive navigation bar using Flexbox.

      ## Requirements:
      1. Create a navbar with:
         - Logo/brand name on the left
         - Navigation links in the center
         - Login/signup buttons on the right
      2. Use Flexbox for layout
      3. Make the navbar responsive:
         - On mobile (below 768px), display a hamburger icon
         - Hide the navigation links on mobile
      4. Add hover effects to the navigation links
      5. Add a subtle box-shadow to the navbar

      ## Tips:
      - Use flexbox properties like justify-content and align-items
      - Use media queries for responsive design
      - Consider using CSS variables for colors
      - You don't need to implement the mobile menu functionality, just show the hamburger icon
    `,
    testCases: [
      {
        name: "Navbar structure",
        description: "Navbar should have logo, navigation links, and buttons",
      },
      {
        name: "Flexbox usage",
        description: "Navbar should use flexbox for layout",
      },
      {
        name: "Responsive design",
        description: "Navbar should have media queries for mobile view",
      },
      {
        name: "Hamburger icon",
        description: "Mobile view should include a hamburger icon",
      },
      {
        name: "Hover effects",
        description: "Navigation links should have hover effects",
      },
    ],
    starterCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Responsive Navbar</title>
  <style>
    /* Add your CSS here */
  </style>
</head>
<body>
  <!-- Create your navbar here -->
  
</body>
</html>`,
  },
  {
    id: "css-grid-gallery-challenge",
    title: "Image Gallery with CSS Grid",
    description: "Create a responsive image gallery using CSS Grid.",
    difficulty: "Medium",
    category: "HTML & CSS",
    points: 250,
    timeLimit: "35 minutes",
    instructions: `
      # Challenge: Image Gallery with CSS Grid

      In this challenge, you'll create a responsive image gallery using CSS Grid.

      ## Requirements:
      1. Create a gallery with at least 6 images
      2. Use CSS Grid for layout
      3. Make the gallery responsive:
         - 3 columns on desktop
         - 2 columns on tablet
         - 1 column on mobile
      4. Add a hover effect to images (zoom, overlay, etc.)
      5. Create a featured image that spans multiple grid cells

      ## Tips:
      - Use grid-template-columns and grid-template-rows
      - Use grid-column and grid-row for the featured image
      - Use media queries for responsive design
      - Consider using object-fit for images
      - You can use placeholder images from /placeholder.svg?height=300&width=400
    `,
    testCases: [
      {
        name: "Gallery structure",
        description: "Gallery should contain at least 6 images",
      },
      {
        name: "CSS Grid usage",
        description: "Gallery should use CSS Grid for layout",
      },
      {
        name: "Responsive design",
        description:
          "Gallery should have media queries for different screen sizes",
      },
      {
        name: "Featured image",
        description:
          "Gallery should have a featured image spanning multiple cells",
      },
      {
        name: "Hover effects",
        description: "Images should have hover effects",
      },
    ],
    starterCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CSS Grid Gallery</title>
  <style>
    /* Add your CSS here */
  </style>
</head>
<body>
  <!-- Create your image gallery here -->
  
</body>
</html>`,
  },
  {
    id: "pricing-table-challenge",
    title: "Pricing Table Component",
    description: "Create a responsive pricing table with multiple tiers.",
    difficulty: "Medium",
    category: "HTML & CSS",
    points: 250,
    timeLimit: "35 minutes",
    instructions: `
      # Challenge: Pricing Table Component

      In this challenge, you'll create a responsive pricing table with multiple tiers.

      ## Requirements:
      1. Create a pricing table with 3 tiers (Basic, Pro, Enterprise)
      2. Each tier should include:
         - Plan name
         - Price
         - List of features (at least 4 per plan)
         - Call-to-action button
      3. Highlight the recommended plan
      4. Make the pricing table responsive
      5. Add hover effects to the buttons

      ## Tips:
      - Use a clean, organized layout
      - Use CSS to highlight the recommended plan (scale, border, etc.)
      - Consider using flexbox or grid for layout
      - Use consistent spacing and typography
      - Use icons or checkmarks for feature lists
    `,
    testCases: [
      {
        name: "Three pricing tiers",
        description: "Page should have three pricing tiers",
      },
      {
        name: "Plan details",
        description:
          "Each plan should include name, price, features, and button",
      },
      {
        name: "Highlighted plan",
        description: "One plan should be visually highlighted as recommended",
      },
      {
        name: "Feature lists",
        description: "Each plan should have at least 4 features listed",
      },
      {
        name: "Responsive design",
        description: "Pricing table should be responsive",
      },
    ],
    starterCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pricing Table</title>
  <style>
    /* Add your CSS here */
  </style>
</head>
<body>
  <!-- Create your pricing table here -->
  
</body>
</html>`,
  },
  {
    id: "animated-card-challenge",
    title: "Animated Info Cards",
    description: "Create a set of info cards with CSS animations.",
    difficulty: "Hard",
    category: "HTML & CSS",
    points: 300,
    timeLimit: "40 minutes",
    instructions: `
      # Challenge: Animated Info Cards

      In this challenge, you'll create a set of information cards with CSS animations.

      ## Requirements:
      1. Create 3 info cards in a row (or column on mobile)
      2. Each card should include:
         - Icon or image
         - Title
         - Description
         - "Learn More" link
      3. Add entrance animations when the page loads
      4. Add hover animations for each card
      5. Make the layout responsive

      ## Tips:
      - Use CSS animations (@keyframes) for entrance animations
      - Use CSS transitions for hover effects
      - Consider using transform properties (scale, rotate, translate)
      - Add animation delays to create a staggered effect
      - Use flexbox or grid for layout
    `,
    testCases: [
      {
        name: "Three info cards",
        description: "Page should have three info cards",
      },
      {
        name: "Card content",
        description:
          "Each card should include icon/image, title, description, and link",
      },
      {
        name: "Entrance animations",
        description: "Cards should have entrance animations",
      },
      {
        name: "Hover animations",
        description: "Cards should have hover animations",
      },
      {
        name: "Responsive design",
        description: "Layout should be responsive",
      },
    ],
    starterCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Animated Info Cards</title>
  <style>
    /* Add your CSS here */
  </style>
</head>
<body>
  <!-- Create your animated info cards here -->
  
</body>
</html>`,
  },
  {
    id: "accessible-form-challenge",
    title: "Accessible Signup Form",
    description:
      "Create an accessible signup form with proper ARIA attributes.",
    difficulty: "Hard",
    category: "HTML & CSS",
    points: 350,
    timeLimit: "45 minutes",
    instructions: `
      # Challenge: Accessible Signup Form

      In this challenge, you'll create an accessible signup form with proper ARIA attributes and keyboard navigation.

      ## Requirements:
      1. Create a signup form with:
         - Name field
         - Email field
         - Password field with strength indicator
         - Confirm password field
         - Terms and conditions checkbox
         - Submit button
      2. Add proper labels and ARIA attributes
      3. Include error messages for validation
      4. Ensure keyboard navigation works correctly
      5. Make the form responsive

      ## Tips:
      - Use semantic HTML elements
      - Add proper labels with 'for' attributes
      - Use aria-required, aria-invalid, and aria-describedby where appropriate
      - Add tabindex attributes if needed
      - Use fieldset and legend for grouping related fields
      - Add focus styles for keyboard navigation
    `,
    testCases: [
      {
        name: "Form structure",
        description: "Form should include all required fields",
      },
      {
        name: "Proper labels",
        description:
          "All form fields should have proper labels with 'for' attributes",
      },
      {
        name: "ARIA attributes",
        description: "Form should use appropriate ARIA attributes",
      },
      {
        name: "Error messages",
        description: "Form should include error message elements",
      },
      {
        name: "Focus styles",
        description: "Form elements should have visible focus styles",
      },
    ],
    starterCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessible Signup Form</title>
  <style>
    /* Add your CSS here */
  </style>
</head>
<body>
  <!-- Create your accessible signup form here -->
  
</body>
</html>`,
  },
];
