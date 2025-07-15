
const form = document.getElementById("contactForm");
const status = document.getElementById("form-status");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.textContent = "Sending...";
    status.style.color = "gray";

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    let message = form.message.value.trim();

    if (!name || !email) {
    status.textContent = "Please provide your name and email.";
    status.style.color = "red";
    return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
    status.textContent = "Please enter a valid email address.";
    status.style.color = "red";
    return;
    }

    if (!message) {
    message = "User left his information on the website.";
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("message", message);

    try {
    const response = await fetch("https://script.google.com/macros/s/AKfycbxUjgnxcA4yM1eHvor5vkiQteJIYzZljk-Kb_89k45xJewp1rwV-cIEHd-rgKdoCbrsCA/exec", {
        method: "POST",
        body: formData
    });

    if (response.ok) {
        form.reset();
        status.textContent = "Thanks! We'll be in touch shortly.";
        status.style.color = "green";
    } else {
        throw new Error("Failed to submit.");
    }
    } catch (err) {
    status.textContent = "Something went wrong. Please try again later.";
    status.style.color = "red";
    }
});