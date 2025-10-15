document.addEventListener("DOMContentLoaded", () => {
  const highlight = document.querySelector(".highlight");

  // Get the full text and reset the highlight
  const fullText = highlight.textContent.trim();
  highlight.textContent = "> ";

  // Create the cursor element
  const cursor = document.createElement("span");
  cursor.classList.add("cursor", "cursor-solid"); 
  cursor.textContent = "█";
  highlight.appendChild(cursor);

  let i = 2;  
  const typingSpeed = 60;

  function typeHighlight() {
    if (i < fullText.length) {
      highlight.insertBefore(document.createTextNode(fullText.charAt(i)), cursor);
      i++;
      setTimeout(typeHighlight, typingSpeed + Math.random() * 40);
    } else {
      cursor.classList.remove("cursor-solid");
      cursor.classList.add("cursor-blink");
    }
  }

  typeHighlight();
});